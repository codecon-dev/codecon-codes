import botConfig from '../config'
import { Message, MessageReaction } from 'discord.js'

/**
 * Get command word from user message.
 *
 * @param {string} commandPrefix - Command prefix.
 * @param { import('discord.js').Message } message - Discord message object.
 * @returns {string} Command and arguments.
 */
export function getCommand (commandPrefix, message) {
  const messageContent = message.content
  const command = messageContent.split(' ')[0]
  return command.slice(commandPrefix.length)
}

/**
 * Get arguments from user message.
 * For options with quotes, it replaces their spaces with underscore and then
 * replaces them back. If you manage to find a regex that extracts them directly,
 * please let me know.
 * Feel free to use getArgumentsAndOptions test file to validate the suggested
 * implementation.
 *
 * @param { import('discord.js').Message } message - Discord message object.
 * @param {string} optionsConector
 * @returns {string[]} Command and arguments.
 */
export function getArgumentsAndOptions (message, optionsConector) {
  let messageContent = message.content.replace(/“|”/g, '"')
  const quoteOptions = messageContent.match(/(".*?")/g) || []
  quoteOptions.forEach(quoteOption => {
    const quoteOptionWithUnderscore = quoteOption.replace(/ /g, '_')
    messageContent = messageContent.replace(quoteOption, quoteOptionWithUnderscore)
  })
  const args = messageContent.split(' ').slice(1).filter(arg => !arg.includes(optionsConector))
  const options = messageContent.split(' ').slice(1).reduce((options, argument) => {
    if (!argument.includes(optionsConector)) {
      return options
    }
    const splittedArgument = argument.split(optionsConector)
    const argumentName = splittedArgument[0]
    const argumentValue = splittedArgument[1].replace(/_/g, ' ').replace(/"/g, '')
    return { ...options, [argumentName]: argumentValue }
  }, {})
  return { args, options }
}

/**
 * Get a config from guild custom config or default.
 *
 * @param {string} configName
 * @param {string} guildId
 * @returns {any}
 */
export function getConfig (configName, guildId) {
  const guildConfig = botConfig.guildsOptions.find(guildConfig => guildConfig.id === guildId) || {}
  return guildConfig[configName] || botConfig.defaultConfig[configName]
}

/**
 * React to a given message with an emoji list.
 *
 * @param {string[]} reactions
 * @param {string} message
 * @returns {Promise<undefined>}
 */
export async function reactToMessage (reactions, message) {
  for (let index = 0; index < reactions.length; index++) {
    await message.react(reactions[index])
  }
}

/**
 * Send a message and wait for user response.
 *
 * @param {string} questionText
 * @param { Message } message
 * @param { string } noResponseText
 * @returns { Promise<Message> }
 */
export async function askAndWait (questionText, message, noResponseText) {
  try {
    await message.channel.send(questionText)
    const filterMessagesByAuthorId = newMessage => newMessage.author.id === message.author.id
    const waitTime = 90 * 1000
    const waitConfig = {
      max: 1,
      time: waitTime,
      errors: ['time']
    }
    const awaitedMessages = await message.channel.awaitMessages(filterMessagesByAuthorId, waitConfig)
    return awaitedMessages.first()
  } catch (error) {
    message.channel.send(noResponseText || 'Nevermind then')
    return {}
  }
}

/**
 * Truncates a field value if bigger than the max allowed characters.
 *
 * @param {string} value
 * @returns {string}
 */
export function truncateFieldValue (value) {
  if (value.length > 1024) {
    value = value.substring(0, 1020) + '...'
  }
  return value
}

/**
 * Convert a string to a code block string to make
 * whitespaces visible.
 *
 * @param {string} text
 * @param {number} codeBlockCharactersLength
 * @returns {string}
 */
export function convertToCodeBlock (text, codeBlockCharactersLength) {
  const textCharacters = String(text).split('')
  const whiteSpacesCharacters = Array(codeBlockCharactersLength).fill(' ')
  whiteSpacesCharacters.splice(0, textCharacters.length, ...textCharacters)
  return `\`${whiteSpacesCharacters.join('')}\``
}

const negativeAnswers = ['não', 'nao', 'no', 'n']
/**
 * Check if the answer text contains a negative word.
 *
 * @param {string} answer
 * @returns {boolean}
 */
export function isNegativeAnswer (answer) {
  return negativeAnswers.includes(answer.toLowerCase())
}

/**
 * Check if the message channel is a Direct Message chanenl.
 *
 * @param {Message} message
 * @returns {boolean}
 */
export function isDMChannel (message) {
  return message.channel.type === 'dm'
}

/**
 * Check and returns a message if it's not a DM channel.
 *
 * @param {Message} message
 * @returns {Promise<boolean>} Message was in wrong channel.
 */
export async function handleWrongChannel (message) {
  const isDirectMessage = isDMChannel(message)
  if (isDirectMessage) {
    return false
  }
  await message.delete()
  await message.author.send('Opa, você só pode usar esse comando aqui nesse chat privado comigo. Tenta aí ;D')
  return true
}

/**
 * Remove a waiting reaction or react with a checkmark if it's a DM channel.
 *
 * @param { MessageReaction } reaction
 * @param { boolean } success
 */
export async function removeOrUpdateReaction (reaction, success) {
  const isDirectMessage = isDMChannel(reaction.message)
  if (isDirectMessage) {
    const emoji = success ? '✅' : '❌'
    await reaction.message.react(emoji)
  } else {
    await reaction.remove()
  }
}

/**
 * Check if the user is a admin.
 *
 * @param { Message } message
 * @returns { Promise<boolean> }
 */
export async function isAdmin (message) {
  const { adminRoles } = botConfig
  let member = message.member

  const isDirectMessage = isDMChannel(message)
  if (isDirectMessage) {
    const userId = message.author.id
    const guild = message.client.guilds.cache.get(botConfig.guildId)
    const members = await guild.members.fetch()
    member = members.get(userId)
  }

  if (!member) {
    return false
  }

  const hasAdminRole = member.roles.cache.some(memberRole => {
    return adminRoles.some(adminRole => adminRole === memberRole.name)
  })
  return hasAdminRole
}

/**
 * Check and returns a message if it was sent by a non-admin.
 *
 * @param {Message} message
 * @returns {Promise<boolean>} Message was sent by a non-admin user.
 */
export async function handleAdminCommand (message) {
  const isAdminMessage = await isAdmin(message)
  if (isAdminMessage) {
    return false
  }

  await message.author.send('Apenas administradores podem usar esse comando =/')
  return true
}
