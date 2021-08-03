const commando = require("discord.js-commando")
const fs = require("fs")

module.exports = class ChannelCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'updatech',
			group: 'util',
			memberName: 'updatech',
			description: 'Updates the channel list for GraciePost',
			guildOnly: true
		})
	}

	async run(msg) {
    //let guildChannels = msg.guild.channels.cache
		let channels = {categories: {}}

    //get categories
    msg.guild.channels.cache.each( (ch) => {
      if (ch.type == "category") {
        channels.categories[ch.name] = {}
        channels.categories[ch.name].name = ch.name
        channels.categories[ch.name].channels = {}
      }
    })

    //get channels in categories
    msg.guild.channels.cache.each( (ch) => {
      if (ch.type == "text") {
        let cat = ch.guild.channels.cache.get(ch.parentID)
        channels.categories[cat.name].channels[ch.name] = {
          name: ch.name,
          id:   ch.id
        }
      }
    })

    fs.writeFile("/var/www/html/graciebot/channels.json", JSON.stringify(channels), (err) => {
      if (err) { console.log(err) }
    })

		return msg.reply("Updated channel list");
	}
};
