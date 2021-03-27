import { updateDatabaseToken } from '../../utils/token'
import { askTokenUpdate } from '../../utils/wizards/askUpdateToken'
import { handleMessageError } from '../../utils/handleError'
import { Message } from 'discord.js'

/**
 * Create a party message on the parties channel.
 *
 * @param {Message} message
 * @returns {undefined}
 */
export async function updateToken (message) {
  try {
    const token = await askTokenUpdate(message)
    if (!token || !token.code) {
      return
    }

    const success = await updateDatabaseToken(token)
    if (!success) {
      return message.channel.send('Não foi possível atualizar o token :c Olha o log')
    }
    return message.channel.send('Token atualizado!')
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
