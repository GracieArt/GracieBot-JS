// watches for updates to a file by the GraciePost addon and posts the data in an embed


const fs = require("fs")
const http = require("http")


module.exports = class GraciePost {
  constructor(client, config, likeButton) {
    this.client = client
    this.config = config
    this.likeButton = likeButton
    this.guild = client.guilds.resolve(this.config.guildID)
  }


  // Starts listening for posts
  watch() {
    this.server = http.createServer(async (req, res) => {
      let response = await this.handleRequest(req)
      res.writeHead( response.status, {
        'Content-Type' : response.type,
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'POST, GET'
      })
      res.write( response.body )
      res.end()
    }).listen(this.config.port)
    console.log(`GraciePost: listening to port ${this.config.port}`)
  }


  // Handles the request
  handleRequest(req) {
    return new Promise((resolve, reject) => {
      let data = ''

      switch (req.method) {
        case 'POST':
          req.on('data', chunk => {
            data += chunk
          })

          req.on('end', () => {
            data = JSON.parse(data)

            if (data.key !== this.config.key) {
              console.log(`GraciePost: Access denied to incoming POST request:`)
              console.log(req)
              return resolve({
                status : 403,
                type   : 'text/plain',
                body   : 'Access denied'
              })
            }

            console.log(`GraciePost: Receieved authentic POST request`)
            this.post(data)
            return resolve({
              status  : 200,
              type    : 'text/plain',
              body    : 'Post successful'
            })
          })
          break


        case 'GET':
          console.log(`GraciePost: Fulfilling GET request for channels`)

          let channels = {categories: {}}

          //get categories
          this.guild.channels.cache.each( (ch) => {
            if (ch.type == "category") {
              channels.categories[ch.name] = {}
              channels.categories[ch.name].name = ch.name
              channels.categories[ch.name].channels = {}
            }
          })

          //get channels in categories
          this.guild.channels.cache.each( (ch) => {
            if (ch.type == "text") {
              let cat = ch.guild.channels.cache.get(ch.parentID)
              channels.categories[cat.name].channels[ch.name] = {
                name: ch.name,
                id:   ch.id
              }
            }
          })

          return resolve({
            status  : 200,
            type    : 'application/json',
            body    : JSON.stringify(channels)
          })
          break


        default:
          return resolve({
            status  : 501,
            type    : 'text/plain',
            body    : 'Method not implemented'
          })
      }
    })
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
      if (cutoff > this.config.charLimit) { cutoff = this.config.charLimit }

      // truncate the string if a cutoff point was set made
      if (cutoff) { embed.description = `${desc.substring(0, cutoff)} ...` }
    }

    console.log(embed)
    return { embed: embed }
  }
}
