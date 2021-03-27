import { askToken } from '../../utils/wizards/askCreateToken'
import { createDatabaseToken } from '../../utils/token'
import { handleMessageError } from '../../utils/handleError'
import { Message } from 'discord.js'

/**
 * Create a new token with a guiding help.
 *
 * @param {Message} message
 * @returns {undefined}
 */
export async function createToken (message) {
  try {
    const token = await askToken(message)
    if (!token || !token.code) {
      return
    }
    const success = await createDatabaseToken(token)
    if (!success) {
      return message.channel.send('Não foi possível criar o token :c Olha o log')
    }
    return message.channel.send('Token criado!')
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
