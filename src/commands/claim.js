import { mountCommandHelpEmbed } from './help'
import { getArgumentsAndOptions, removeOrUpdateReaction } from '../utils/message'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../utils/token'
import { getDatabaseUserById, updateDatabaseUser } from '../utils/user'
import gifs from '../../data/gifs'

/**
 * @typedef UserScore
 * @property {number} acquired
 * @property {number} total
 */

/**
 * Get a random element from a list.
 *
 * @param {Array} list
 * @returns {any}
 */
function getRandom (list) {
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * Created the embed message with sublimations found list.
 *
 * @param {string} code
 * @param {string} username
 * @param {UserScore} score
 * @returns {import('discord.js').MessageEmbed}
 */
function mountClaimEmbed (code, username, score) {
  return {
    color: 'YELLOW',
    title: `:trophy: Código ${code} resgatado!`,
    image: {
      url: getRandom(gifs.claim)
    },
    fields: [
      {
        name: 'Usuário',
        value: username
      },
      {
        name: 'Pontos obtidos',
        value: score.acquired,
        inline: true
      },
      {
        name: 'Total',
        value: score.total,
        inline: true
      }
    ]
  }
}

/**
 * Replies the user message with the claimed token result.
 *
 * @param { import('discord.js').Message } message - Discord message object.
 * @returns {Promise<import('discord.js').Message>}
 */
export async function claimToken (message) {
  try {
    const { args } = getArgumentsAndOptions(message, '=')
    const code = args[0]
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

    const { claimedBy, remainingClaims, value, decreaseValue, minimumValue, expireAt } = token

    if (!remainingClaims) {
      return message.channel.send('Esse token expirou :(')
    }

    const isExpired = expireAt && new Date(Date.now()) > new Date(expireAt)
    if (isExpired) {
      return message.channel.send('Esse token expirou :(')
    }

    const timesClaimed = claimedBy.length
    let scoreAcquired = value - (timesClaimed * decreaseValue)
    if (scoreAcquired < minimumValue) {
      scoreAcquired = minimumValue
    }

    const { id: userId, username } = message.author
    let userCurrentScore = 0
    let tokensClaimed = []
    const user = await getDatabaseUserById(userId)
    if (user) {
      userCurrentScore = user.score
      tokensClaimed = user.tokens
    }

    const score = {
      acquired: scoreAcquired,
      total: userCurrentScore + scoreAcquired
    }

    const date = new Date(Date.now())
    const dateString = date.toISOString()
    const claimUser = {
      username: username,
      claimedAt: dateString
    }

    const updatedToken = {
      ...token,
      remainingClaims: remainingClaims - 1,
      claimedBy: claimedBy.concat(claimUser)
    }

    const updatedUser = {
      userId,
      username,
      score: score.total,
      tokens: tokensClaimed.concat({
        code,
        value: scoreAcquired,
        claimedAt: dateString
      })
    }

    const userClaimSuccess = await updateDatabaseUser(updatedUser)
    if (!userClaimSuccess) {
      await removeOrUpdateReaction(awaitReaction, false)
      return message.channel.send('Putz, deu ruim ao atualizar o usuário')
    }

    const tokenClaimSuccess = await updateDatabaseToken(updatedToken)
    if (!tokenClaimSuccess) {
      await removeOrUpdateReaction(awaitReaction, false)
      return message.channel.send('Putz, deu ruim ao atualizar o token')
    }

    const successClaimEmbed = mountClaimEmbed(code, username, score)
    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send({ embed: successClaimEmbed })
  } catch (error) {
    console.log(error)
  }
}
