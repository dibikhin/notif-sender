var log4js = require('log4js')

log4js.configure('./config/log4js.json');

log4js.addAppender(log4js.appenders.console());

exports.init = function() {
	return log4js.getLogger('app');
}