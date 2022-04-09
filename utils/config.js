// Parsing the config file at ../.conf.json

var config = require("../config.json")
var sysConfig = require(config.sysConfig)


// discord api token
config.token = sysConfig.token
config.graciePost.key = sysConfig.graciePost.key
config.graciePost.guildID = sysConfig.graciePost.guildID

module.exports = config
