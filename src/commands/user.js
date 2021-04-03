import { mountUserEmbed, getDatabaseUserById, getUserRankPosition } from '../utils/user'
import { handleMessageError } from '../utils/handleError'
import { mountCommandHelpEmbed } from './help'
import { getArgumentsAndOptions, removeOrUpdateReaction } from '../utils/message'
import { Message } from 'discord.js'

/**
 * Get an user from the database to check its data.
 *
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export async function getUser (message) {
  try {
    const { args } = getArgumentsAndOptions(message, '=')
    const userId = args[0]
    if (!userId) {
      const helpEmbed = mountCommandHelpEmbed(message)
      return message.channel.send({ embed: helpEmbed })
    }

    const awaitReaction = await message.react('⏳')
    const user = await getDatabaseUserById(userId)

    if (!user) {
      await removeOrUpdateReaction(awaitReaction, false)
      return message.channel.send('Não encontrei nenhum user com esse id :(')
    }

    const rank = await getUserRankPosition(userId)
    const userEmbed = await mountUserEmbed(user, rank)
    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send({ embed: userEmbed })
  } catch (error) {
    handleMessageError(error, message)
    return message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
  }
}
