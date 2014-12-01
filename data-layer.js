var mongoose = require('mongoose')

// http://mongoosejs.com/docs/connections.html
connectionString = 'mongodb://localhost/test';

// shared connection
mongoose.connect(connectionString);

exports.init = function() {
	return mongoose;
}