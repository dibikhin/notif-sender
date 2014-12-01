var async = require('async')
var config = require('config')
var timestamps = require('mongoose-timestamp')

var vk_api = require('./vkontakte-api.js')

var loggers = require('./logger.js')
var dataLayer = require('./data-layer.js')

var logger = loggers.init();
var mongoose = dataLayer.init();

var notifsDeletionLimit = config.get('Service.Limits.notifsDeletionLimit');
var notifsSendingLimit = config.get('Service.Limits.notifsSendingLimit');

var notifSchema = mongoose.Schema({
	vk_id: Number,
	first_name: String,
	template: String,
	state: String
});

notifSchema.plugin(timestamps);

notifSchema.statics.fill = function (notif, vk_id, first_name, template) {
	notif.vk_id = vk_id;
	notif.first_name = first_name;
	notif.template = template;
	notif.state = 'new';
	return notif;
};

// send notifs
notifSchema.statics.sendNotifsWrapper = function() {
	var agg = [
		{ "$limit": notifsSendingLimit },
		{ $match : { state : "new" } },
		{
			$group: {
				_id: {
					"first_name": "$first_name",
					"template": "$template"
				},
				vk_ids: { $push: "$vk_id" },
				ids: { $push: "$_id" }
			}
		}
	];

	var sendAllNotifs = function(err, notifGroups){
		var sendNotifs = function(i) {
			var notifGroup = notifGroups[i];
			if(notifGroup !== undefined) {
				var idsListStr = notifGroup.vk_ids.join();

				var logSentOk = function () {
					logger.info("Notifs sent to " + notifGroup._id.first_name + ", ids: " + idsListStr);
					notifGroup.ids.forEach(function(id) {
						var query = { _id: id };
						mongoose.model('Notif').update(query, { state: 'sent' }).exec();
					});
				};

				var message = notifGroup._id.template.replace('%name%', notifGroup._id.first_name);
				vk_api.sendNotification(idsListStr, message, logSentOk);
			}
		};

		// ugly as hell :(
		async.eachLimit([0, 1, 2], 3, sendNotifs, function(err) { });
	};

	mongoose.model('Notif').aggregate(agg, sendAllNotifs);
};

// remove sent notifs
notifSchema.statics.removeSentWrapper = function() {
	mongoose.model('Notif').find()
		.where('state').equals('sent')
		.select('_id')
		.limit(notifsDeletionLimit)
		.exec(function (err, docs) {
			var ids = docs.map(function(doc) { return doc._id; });
			mongoose.model('Notif')
				.remove({ _id: { $in: ids } }, function (err) { });
		});
};

exports.init = function() {
	return mongoose.model('Notif', notifSchema);
};