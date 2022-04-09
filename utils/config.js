// Parsing the config file at ../.conf.json

var config = require("../config.json")
var sysConfig = require("/etc/graciebot/conf.json")


// discord api token
config.token = sysConfig.token

module.exports = config
