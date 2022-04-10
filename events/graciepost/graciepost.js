// watches for updates to a file by the GraciePost addon and posts the data in an embed


const fs = require("fs")
const http = require("http")


module.exports = class GraciePost {
  constructor(client, config, likeButton) {
    this.client = client
    this.config = config
    this.likeButton = likeButton
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
      res.end( response.body )
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


        // Return channel list
        case 'GET':
          console.log(`GraciePost: Fulfilling GET request for channels`)

          let menus = []

          // get guilds
          menus.push({
            name : 'guilds',
            items : this.client.guilds.cache.map( g => {
              return {
                title : g.name,
                id    : g.id
              }
            })
          })

          // get categories
          menus.push({
            name  : 'categories',
            items : this.client.channels.cache
              .filter(this.isGoodCategory)
              .map(cat => {
                return {
                  title    : cat.name,
                  id       : cat.id,
                  parentId : cat.guild.id
                }
              })
          })

          // get channels
          menus.push({
            name  : 'channels' ,
            items : this.client.channels.cache
              .filter(ch => ch.type === 'text')
              .map(ch => {
                return {
                  title     : ch.name,
                  id        : ch.id,
                  parentId  : ch.parentID || ch.guild.id
                }
              })
          })

          return resolve({
            status  : 200,
            type    : 'application/json',
            body    : JSON.stringify(menus)
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



  // text if a channel is good to put on the menu
  isGoodCategory(ch) {

    // only allow text and category channels
    if (ch.type !== 'category') { return false }

    // Filter out the categories that don't have any text channels
    let children = ch.children.filter(ch => ch.type === 'text')
    if (children.size === 0) { return false }

    return true
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
