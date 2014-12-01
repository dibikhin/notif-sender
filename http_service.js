var bodyParser = require('body-parser')
var express = require('express')
var util = require('util')

var tasks = require('./task.js')

var app = express();
var Task = tasks.init();

// set body parsing middleware
app.use(bodyParser.urlencoded({  extended: true }));

// curl --data "template=Hi%20there!" http://localhost:3000/send
app.post('/send', function (req, res) {
	// TODO validate template

	// TODO move to model
	var task = new Task();
	task.state = 'new';
	task.template = req.body.template;
	task.save();

	// TODO fill response {status: ok, message: new task created }
	res.send('Got a POST request');
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	util.log(
		util.format('HTTP service listening at http://%s:%s', host, port));
});