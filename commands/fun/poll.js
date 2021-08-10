const commando = require("discord.js-commando")
const fs = require("fs")
const emojiRegex = require("emoji-regex/RGI_Emoji.js")

module.exports = class PollCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'poll',
			group: 'fun',
			memberName: 'poll',
			description: 'Make a quick reaction poll',
			guildOnly: true,
			args: [
				{
					key: 'content',
					prompt: 'What would you like the poll message to say? Use an emoji for each option.',
					type: 'string'
				}
			]
		})
	}

	async run(msg, {content}) {
		let embed = {
			title: "Poll",
			footer: {
				text: "Sent by " + msg.author.username
			},
			description: content
		}
		let message = await msg.channel.send({embed})
		const regex = emojiRegex()
		let match
		while (match = regex.exec(content)) {
			const emoji = match[0]
			message.react(emoji)
		}
		msg.delete()
		return
	}
};
