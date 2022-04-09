// This script will react to every media post with a yellow heart emoji


// Normally bots are ignored for the like button, but put their IDs here to whitelist them! (should put this in config file later)
const whitelist = [
  '828059130505330698', // Camp Gracie #gracie-art announcement bot
  '828059335829487626', // Camp Grace #gracie-art-nsfw announcement bot
  '962176583232286761' // Private testing channel
]


module.exports = class LikeButton {
  constructor(client) {
    this.client = client
  }


  // returns if the provided message contains media
  containsMedia(msg) {
    let text = msg.content

    let hasLink = text.includes("https://") || text.includes("http://")
    let hasAttachment = msg.attachments.size > 0
    let hasEmbed = msg.embeds.length > 0

    return hasLink || hasAttachment || hasEmbed
  }


  // adds the yellow heart reaction to the provided message
  addButton(msg) { msg.react("💛") }


  // will start watching for media messages and reacts to them
  watch() {
    this.client.on('message', async (msg) => {

      // makes sure the sender is not a bot, unless it's whitelisted
      let isOnWhitelist = whitelist.includes(msg.author.id)
      if (!this.containsMedia(msg) || (msg.author.bot && !isOnWhitelist)) return
      this.addButton(msg)
  	});
  }
}
