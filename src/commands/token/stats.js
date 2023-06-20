import { getDatabaseTokens, getTokenStats } from '../../utils/token'
import { handleMessageError } from '../../utils/handleError'
import { removeOrUpdateReaction } from '../../utils/message'
import { Message } from 'discord.js'

/**
 * Retrieve some interesting statistics from database.
 *
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export async function getStats (message) {
  try {
    const awaitReaction = await message.react('⏳')
    const tokens = await getDatabaseTokens()

    if (!tokens || !tokens.length) {
      await removeOrUpdateReaction(awaitReaction, false)
      return message.channel.send('Nenhum token cadastrado')
    }

    const tokenStats = getTokenStats(tokens)

    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send(JSON.stringify(tokenStats, null, 2))
  } catch (error) {
    handleMessageError(error, message)
    return message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
  }
}
