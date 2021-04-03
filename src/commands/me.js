import { mountSelfUserEmbed, getDatabaseUserById, getUserRankPosition } from '../utils/user'
import { handleMessageError } from '../utils/handleError'
import { removeOrUpdateReaction } from '../utils/message'
import { Message } from 'discord.js'

/**
 * Get the author user information.
 *
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export async function getSelfUser (message) {
  try {
    const { username, id: userId } = message.author
    const avatar = message.author.displayAvatarURL()
    const awaitReaction = await message.react('⏳')
    let user = await getDatabaseUserById(userId)
    let userEmbed = {}

    if (user) {
      const rank = await getUserRankPosition(userId)
      user.avatar = avatar
      userEmbed = mountSelfUserEmbed(user, rank)
    } else {
      user = { username, score: 0, avatar }
      userEmbed = mountSelfUserEmbed(user, null)
    }

    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send({ embed: userEmbed })
  } catch (error) {
    handleMessageError(error, message)
    return message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
  }
}
