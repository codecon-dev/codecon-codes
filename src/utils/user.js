import { createOrUpdateUser, getUserFromMongo, getUsersFromMongo } from './mongoose'
import { truncateFieldValue } from './message'

/**
 * @typedef User
 * @property {string} userId
 * @property {string} tag
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
    users.sort((a, b) => b.score - a.score)
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
 * @param {number} rank
 * @returns {import('discord.js').MessageEmbed}
 */
export function mountUserEmbed (user, rank) {
  const { tag, userId, score, tokens } = user
  tokens.sort((a, b) => {
    return b.value - a.value
  })
  const claimedTokensText = tokens.map(token => token.code).join(', ') || 'Nenhum'
  return {
    color: 'AQUA',
    title: `:bust_in_silhouette: ${tag}`,
    fields: [
      {
        name: 'ID',
        value: userId,
        inline: true
      },
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

/**
 * Creates the User message embed.
 *
 * @param {User} user
 * @param {number|null} rank
 * @returns {import('discord.js').MessageEmbed}
 */
export function mountSelfUserEmbed (user, rank) {
  const { tag, score, avatar } = user
  return {
    color: 'AQUA',
    title: `:bust_in_silhouette: ${tag}`,
    thumbnail: {
      url: avatar
    },
    fields: [
      {
        name: 'Rank',
        value: `#${rank || '??'}`,
        inline: true
      },
      {
        name: 'Pontos',
        value: score,
        inline: true
      }
    ]
  }
}
