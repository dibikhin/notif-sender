var dataLayer = require('./data-layer.js')
var mongoose = dataLayer.init();

var playerSchema = mongoose.Schema({
	vk_id: Number,
	first_name: String
});

exports.init = function() {
	return mongoose.model('Player', playerSchema);
}