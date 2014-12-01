var config = require('config')
var timestamps = require('mongoose-timestamp')

var dataLayer = require('./data-layer.js')
var players = require('./player.js')
var notifs = require('./notif.js')

var mongoose = dataLayer.init();
var Player = players.init();
var Notif = notifs.init();

var tasksInWorkLimit = config.get('Service.Limits.tasksInWorkLimit');
var playersFindBatchSize = config.get('Service.Limits.playersFindBatchSize');

var taskSchema = mongoose.Schema({
	template: String,
	state: String,
});

taskSchema.plugin(timestamps);

// generate notifs
taskSchema.statics.generateNotifsWrapper = function () {
	// Maybe dangerous, can consume too much RAM
	var generateNotifs = function (err, tasks) {
		var processTask = function(task) {
			var createNotif = function (player) {
				var notif = new Notif();
				Notif.fill(notif, player.vk_id, player.first_name, task.template);
				notif.save();
			};

			task.state = 'in_work';
			task.save();

			Player.find()
				.batchSize(playersFindBatchSize)
				.exec(function (err, players) {
					players.forEach(createNotif);
				});

			task.state = 'done';
			task.save();
		};

		tasks.forEach(processTask);
	};

	mongoose.model('Task').find()
		.where('state').equals('new')
		.limit(tasksInWorkLimit)
		.sort({ createdAt: 'asc' })
		.exec(generateNotifs);
};

exports.init = function() {
	return mongoose.model('Task', taskSchema);
}