import { mountTokenEmbed, getDatabaseTokenByCode } from '../../utils/token'
import { handleMessageError } from '../../utils/handleError'
import { mountCommandHelpEmbed } from '../help'
import { getArgumentsAndOptions, removeOrUpdateReaction } from '../../utils/message'
import { Message } from 'discord.js'
import config from '../../config'
const { watchedTokens } = config

/**
 * Get a token from the database to check its data.
 *
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export async function getToken (message) {
  try {
    const { args } = getArgumentsAndOptions(message, '=')
    const code = args[1]
    const hasWatch = args[2] === '--watch'
    if (!code) {
      const helpEmbed = mountCommandHelpEmbed(message)
      return message.channel.send({ embed: helpEmbed })
    }

    const awaitReaction = await message.react('⏳')
    const token = await getDatabaseTokenByCode(code)

    if (!token) {
      await removeOrUpdateReaction(awaitReaction, false)
      return message.channel.send('Não encontrei nenhum token com esse código :(')
    }

    await removeOrUpdateReaction(awaitReaction, true)
    const tokenEmbed = mountTokenEmbed(token)

    const messageSent = await message.channel.send({ embed: tokenEmbed })

    if (hasWatch) {
      watchedTokens.push({
        code,
        message: messageSent
      })
    }

    return messageSent
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
