import Discord from 'discord.js'
import { getHelp, getAbout, claimToken, token, getUser } from './commands'
import { handleMessageError } from './utils/handleError'
import { getCommand, handleWrongChannel, handleAdminCommand } from './utils/message'
import config from './config'
import dotenv from 'dotenv'
dotenv.config()
const { prefix, DMOnlyCommands, adminOnlyCommands } = config
let userPool = []

const commandActions = {
  help: getHelp,
  about: getAbout,
  claim: claimToken,
  token: token,
  user: getUser,
  time: (message) => message.reply(new Date().toString())
}

/**
 * Initialize this bot.
 */
async function init () {
  const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

  client.on('ready', async function () {
    console.log(`Online on ${client.guilds.cache.size} servers: ${client.guilds.cache.map(ch => ch.name).join(', ')}`)
    client.user.setActivity('.about or .help', { type: 'PLAYING' })
  })

  client.on('message', async function (message) {
    try {
      if (message.author.bot) return

      if (!message.content.startsWith(prefix)) return

      const command = getCommand(prefix, message)

      const isAdminOnlyCommand = adminOnlyCommands.some(DMOnlyCommand => DMOnlyCommand === command)
      if (isAdminOnlyCommand) {
        const isNonAdminUser = await handleAdminCommand(message)
        if (isNonAdminUser) return
      }

      const isDMOnlyCommand = DMOnlyCommands.some(DMOnlyCommand => DMOnlyCommand === command)
      if (isDMOnlyCommand) {
        const isWrongChannel = await handleWrongChannel(message)
        if (isWrongChannel) return
      }

      const action = commandActions[command]

      if (!action) return

      await lockMessage(message.author.id, () => action(message))
    } catch (error) {
      handleMessageError(error, message)
    }
  })

  client.login(process.env.DISCORD_BOT_TOKEN)
}

init()

/**
 * Locks a user to not trigger multiple commands.
 *
 * @param {string} userId
 * @param {Function} unlockedFunction
 */
async function lockMessage (userId, unlockedFunction) {
  if (userPool.includes(userId)) return
  userPool.push(userId)
  await unlockedFunction()
  userPool = userPool.filter(id => id !== userId)
}
