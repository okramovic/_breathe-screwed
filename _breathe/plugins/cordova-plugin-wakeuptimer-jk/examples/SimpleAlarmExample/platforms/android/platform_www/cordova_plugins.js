cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "org.nypr.cordova.wakeupplugin.Wakeup",
        "file": "plugins/org.nypr.cordova.wakeupplugin/www/wakeup.js",
        "pluginId": "org.nypr.cordova.wakeupplugin",
        "clobbers": [
            "wakeuptimer"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.nypr.cordova.wakeupplugin": "0.1.0"
};
// BOTTOM OF METADATA
});