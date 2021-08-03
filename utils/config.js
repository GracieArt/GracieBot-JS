var config = require("../config.json")
config.token = process.env.GB_TOKEN
config.graciepost.postFile = process.env.GB_POSTFILE
module.exports = config
