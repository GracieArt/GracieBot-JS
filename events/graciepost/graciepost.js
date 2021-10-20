const fs = require("fs")

module.exports = class GraciePost {
  constructor(client, postFile, likeButton) {
    this.client = client
    this.postFile = postFile
    this.likeButton = likeButton
    this.shouldWatch = true
  }

  watch() {
    console.log("GraciePost: Watching for changes to " + this.postFile)
    fs.watchFile(this.postFile, () => {
      console.log("GraciePost: File changed")
      this.post(JSON.parse(fs.readFileSync(this.postFile)))
    })
  }

  post(meta) {
    let channel = this.client.channels.cache.get(meta.channel)

    if (meta.overrideEmbed) {
      channel.send(meta.postLink).then(this.likeButton.addButton)
    } else {
      if (meta.desc) {
        if (meta.desc.includes("\n\n")) { // cut off the description at a double line break
          meta.desc = meta.desc.substring(0, meta.desc.indexOf("\n\n")) + " [ . . . ]"
        } else if (meta.desc.length > 180) { // cut off the description if it's too long
           meta.desc = meta.desc.substring(0, 180) + " [ . . . ]"
        }
      }
      let embed = {
        title:  meta.title || "",
        author: {
          name: meta.artist || "",
          icon_url: meta.pfp || "",
        },
        description: meta.desc || "",
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
          text: "Retrieved from " + meta.siteName + " using GraciePost"
        }
      }
      console.log(embed);
      channel.send({embed}).then(this.likeButton.addButton)
    }
  }
}
