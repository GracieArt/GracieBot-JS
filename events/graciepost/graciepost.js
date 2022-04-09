// watches for updates to a file by the GraciePost addon and posts the data in an embed


const fs = require("fs")
const http = require("http")

// the cutoff point if the description of an embed is too long
const charLimit = 180

// the port graciebot will be listening to for posts
const port = 30034 // booba teehee



module.exports = class GraciePost {
  constructor(client, key, likeButton) {
    this.client = client
    this.key = key
    this.likeButton = likeButton
    this.shouldWatch = true
  }


  // Starts listening for posts
  watch() {
    this.server = http.createServer((req, res) => {
      let data = ''
      req.on('data', chunk => {
        data += chunk
      })
      req.on('end', () => {
        data = JSON.parse(data)

        if (data.key !== this.key) {
          console.log(`GraciePost: Access denied to incomping post request:`)
          console.log(req)
          res.writeHead(403)
        } else {
          console.log(`GraciePost: Receieved authentic post request`)
          res.writeHead(200)
          this.post(data)
        }
        res.end()
      })
    })
    this.server.listen(port)
    console.log(`GraciePost: listening to port 30034`)
  }



  // Sends a post with the given metadata
  post(meta) {
    let channel = this.client.channels.cache.get(meta.channel)

    // send it, then add a like button
    channel.send(this.messageBody(meta))
      .then(this.likeButton.addButton)
  }



  // Reads the metadata and returns the message to post
  messageBody(meta) {

    // Just return the link if its set to override the embed
    if (meta.overrideEmbed) { return meta.postLink }

    // Create the embed
    let embed = {
      title:  meta.title || '',
      author: {
        name: meta.artist || '',
        icon_url: meta.pfp || '',
      },
      description: meta.desc || '',
      fields: [
        {
          name: 'Post link:',
          value: meta.postLink
        }
      ],
      image: {
        url:  meta.imageLink
      },
      footer: {
        text: `Retrieved from ${meta.siteName} using GraciePost`
      }
    }


    // Truncate the description (if any)
    if (embed.description) {
      let desc = embed.description
      let cutoff

      // set cut off point at the first double linebreak (if any)
      if (desc.includes('\n\n')) { cutoff = desc.indexOf('\n\n') }

      // if it still exceeds the character limit, cut it off!!!
      if (cutoff > charLimit) { cutoff = charLimit }

      // truncate the string if a cutoff point was set made
      if (cutoff) { embed.description = `${desc.substring(0, cutoff)} ...` }
    }

    console.log(embed)
    return { embed: embed }
  }
}
