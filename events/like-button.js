module.exports = class LikeButton {
  constructor(client) {
    this.client = client
  }

  containsMedia(msg) {
    return msg.content.includes("https://") || msg.content.includes("http://") || msg.attachments.size || msg.embeds.length
  }

  addButton(msg) {
    msg.react("💛")
  }

  watch() {
    this.client.on('message', async (msg) => {
      if (this.containsMedia(msg) && !msg.author.bot) {
        this.addButton(msg)
      }
  	});
  }
}
