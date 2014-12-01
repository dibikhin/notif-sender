var config = require('config')

var loggers = require('./logger.js')
var notifs = require('./notif.js')
var tasks = require('./task.js')

var logger = loggers.init();
var Notif = notifs.init();
var Task = tasks.init();

var generateNotifsEveryMs = config.get('Service.Intervals.generateNotifsEveryMs');
var sendNotifsEveryMs = config.get('Service.Intervals.sendNotifsEveryMs');
var removeNotifsEveryMs = config.get('Service.Intervals.removeNotifsEveryMs');

// log service start/stop events
logger.info('Service started');

process.on('SIGINT', function() {
	logger.info('Stopping service...');
	process.exit(0);
});

// generate notifs
setInterval(Task.generateNotifsWrapper, generateNotifsEveryMs);

// send notifs
setInterval(Notif.sendNotifsWrapper, sendNotifsEveryMs);

// remove sent notifs
setInterval(Notif.removeSentWrapper, removeNotifsEveryMs);