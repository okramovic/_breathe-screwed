var exec = require('cordova/exec');

exports.addAlarmClock = function(arg0, success, error) {
    exec(success, error, "alarmClock", "addAlarmClock", [arg0]);
};

exports.deleteManyAlarmClock = function(arg0, success, error) {
    exec(success, error, "alarmClock", "addAlarmClock", arg0);
};
