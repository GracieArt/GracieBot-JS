var config = require("../config.json")
var sysConfig = require("/etc/graciebot/conf.json")
config.token = sysConfig.token
config.graciepost.postFile = sysConfig.postFile
module.exports = config
