import { getDatabaseUsers, User } from '../utils/user'
import { handleMessageError } from '../utils/handleError'
import { removeOrUpdateReaction, convertToCodeBlock } from '../utils/message'
import { Message } from 'discord.js'

/**
 * Mount the rank embed.
 *
 * @param {User[]} users
 * @returns {import('discord.js').MessageEmbed}
 */
function mountRankEmbed (users) {
  const rankText = users.map((user, index) => {
    const position = index + 1
    const positionText = convertToCodeBlock(`#${position}`, 3)
    const name = convertToCodeBlock(user.username, 32)
    const score = convertToCodeBlock(user.score, 5)
    return `${positionText} ${name} ${score}`
  })

  return {
    color: 'YELLOW',
    title: ':trophy: Top Rank',
    description: rankText.join('\n')
  }
}

/**
 * Get the users rank information.
 *
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export async function getRank (message) {
  try {
    const awaitReaction = await message.react('⏳')
    const users = await getDatabaseUsers()
    users.sort((a, b) => b.score - a.score)
    const topUsers = users.slice(0, 10)
    const embed = mountRankEmbed(topUsers)

    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send({ embed })
  } catch (error) {
    handleMessageError(error, message)
    return message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
  }
}
