const fs = require("fs")

module.exports = class GraciePost {
  constructor(client, postFile) {
    this.client = client
    this.postFile = postFile
    this.shouldWatch = true
  }

  watch() {
    fs.watch(this.postFile, () => {
      if (this.shouldWatch) {
        console.log("File changed")
        this.shouldWatch = false

        this.post(JSON.parse(fs.readFileSync(this.postFile)))

        setTimeout(() => {
          this.shouldWatch = true
          console.log("watching...")
        }, 2000)
      }
    })
  }

  post(meta) {
    let channel = this.client.channels.cache.get(meta.channel)

    if (meta.overrideEmbed) {
      channel.send(meta.postLink)
    } else {
      let embed = {
        title:  meta.title || "",
        author: {
          name: meta.artist || "",
          icon_url: meta.pfp || "",
        },
        fields: [
          {
            name: "Post link:",
            value: meta.postLink
          }
        ],
        image: {
          url:  meta.imageLink
        },
        footer: {
          text: "Retrieved from " + meta.siteName
        }
      }
      channel.send({embed})
    }
  }
}
