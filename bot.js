// Initialization of the bot

const commando = require('discord.js-commando')
const path = require('path')
const config = require('./utils/config.js')

const GraciePost = require("./events/graciepost/graciepost.js")
const LikeButton = require("./events/like-button.js")

const client = new commando.Client({
	commandPrefix: config.prefix,
	owner: config.owner
});


// Set up all the events
client
	// Once graciebot is logged in and ready to recieve commands
	.on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);

		// initialize likebutton event
		likeButton = new LikeButton(client)
		likeButton.watch()

		// initialize graciepost event
		graciepost = new GraciePost(
			client,
			config.graciePost,
			likeButton
		)
		graciepost.watch()
	})

	// Disconnect/Reconnect
	.on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })

	// Errors/Warnings/Notices
	.on('error', console.error)
	.on('warn', console.warn)
	.on('debug', console.log)

	// Command-specific errors/warnings/notices
	.on('commandError', (cmd, err) => {
		if(err instanceof commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})


// Register the commands
client.registry
	.registerDefaults()
	.registerGroup("fun")
	.registerCommandsIn(path.join(__dirname, 'commands'))


// Login
client.login(config.token)
