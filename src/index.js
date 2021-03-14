import Discord from 'discord.js'
import { getHelp, getAbout } from './commands'
import { handleMessageError } from './utils/handleError'
import { getCommand, setStartupConfig } from './utils/message'
import config from './config'
import dotenv from 'dotenv'
dotenv.config()

const { defaultConfig: { prefix } } = config

const commandActions = {
  help: getHelp,
  about: getAbout,
  time: (message) => message.reply(new Date().toString())
}

/**
 * Initialize this bot.
 */
async function init () {
  await setStartupConfig()

  const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

  client.on('ready', async function () {
    console.log(`Online on ${client.guilds.cache.size} servers: ${client.guilds.cache.map(ch => ch.name).join(', ')}`)
    client.user.setActivity('.about or .help', { type: 'PLAYING' })
  })

  client.on('message', async function (message) {
    try {
      if (message.author.bot) return

      if (!message.content.startsWith(prefix)) return
      if (!message.guild) return

      const command = getCommand(prefix, message)
      const action = commandActions[command]

      if (!action) return
      await action(message)
    } catch (error) {
      handleMessageError(error, message)
    }
  })

  client.login(process.env.DISCORD_BOT_TOKEN)
}

init()
