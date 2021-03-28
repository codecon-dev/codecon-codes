import { createOrUpdateUser, getUserFromMongo, getUsersFromMongo } from './mongoose'
import { truncateFieldValue } from './message'

/**
 * @typedef User
 * @property {string} userId
 * @property {string} username
 * @property {number} score
 * @property {Array} tokens
 */

/**
 * Get a user from database by its discord id.
 *
 * @param {User} userId
 * @returns {Promise<User>}
 */
export async function getDatabaseUserById (userId) {
  try {
    const user = await getUserFromMongo(userId)
    return user
  } catch (error) {
    console.log(error)
  }
}

/**
 * Get all users from database.
 *
 * @returns {Promise<User[]>}
 */
export async function getDatabaseUsers () {
  try {
    const users = await getUsersFromMongo()
    return users
  } catch (error) {
    console.log(error)
  }
}

/**
 * Update a user.
 *
 * @param {User} user
 * @returns {Promise<boolean>}
 */
export async function updateDatabaseUser (user) {
  try {
    const { userId } = user

    const updatedUser = await createOrUpdateUser(userId, user)
    if (!updatedUser) {
      throw new Error(`Error on User Update: User ${userId} was not found`)
    }
    return updatedUser
  } catch (error) {
    console.log(error)
    return false
  }
}

/**
 * Get user rank position.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getUserRankPosition (userId) {
  try {
    const users = await getDatabaseUsers()
    users.sort((a, b) => a.score - b.score)
    const matchingUser = users.find(user => user.userId === userId)
    const userIndex = users.indexOf(matchingUser)
    return userIndex + 1
  } catch (error) {
    console.log(error)
    return false
  }
}

/**
 * Creates the User message embed.
 *
 * @param {User} user
 * @returns {Promise<import('discord.js').MessageEmbed>}
 */
export async function mountUserEmbed (user) {
  const { username, userId, score, tokens } = user
  const claimedTokensText = tokens.map(token => token.code).join(', ') || 'Nenhum'
  const rank = await getUserRankPosition(userId)
  return {
    title: `:bust_in_silhouette: ${username} (${userId})`,
    fields: [
      {
        name: 'Rank',
        value: `#${rank}`,
        inline: true
      },
      {
        name: 'Pontos',
        value: score,
        inline: true
      },
      {
        name: 'Tokens',
        value: truncateFieldValue(claimedTokensText)
      }
    ]
  }
}
