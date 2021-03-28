import { mountCommandHelpEmbed } from './help'
import { getArgumentsAndOptions } from '../utils/message'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../utils/token'
import { getDatabaseUserById, updateDatabaseUser } from '../utils/user'

/**
 * @typedef UserScore
 * @property {number} acquired
 * @property {number} total
 */

/**
 * Created the embed message with sublimations found list.
 *
 * @param {string} token
 * @param {string} username
 * @param {UserScore} score
 * @returns {import('discord.js').MessageEmbed}
 */
function mountClaimEmbed (token, username, score) {
  return {
    title: ':trophy: Código resgatado!',
    fields: [
      {
        name: 'Usuário',
        value: username,
        inline: true
      },
      {
        name: 'Código',
        value: token,
        inline: true
      },
      {
        name: 'Pontos',
        value: `Obtidos: ${score.acquired}\nTotal: ${score.total}`
      }
    ]
  }
}

/**
 * Replies the user message with the claimed token result.
 *
 * @param { import('discord.js').Message } message - Discord message object.
 * @returns {Promise<object>}
 */
export async function claimToken (message) {
  try {
    const { args } = getArgumentsAndOptions(message, '=')
    const code = args[0]
    if (!code) {
      const helpEmbed = mountCommandHelpEmbed(message)
      return message.channel.send({ embed: helpEmbed })
    }

    const token = await getDatabaseTokenByCode(code)
    if (!token) {
      return message.channel.send('Não encontrei nenhum token com esse código :(')
    }

    const { claimedBy, remainingClaims, value, decreaseValue, minimumValue } = token
    const { id: userId, username } = message.author

    const timesClaimed = claimedBy.length
    let scoreAcquired = value - (timesClaimed * decreaseValue)
    if (scoreAcquired < minimumValue) {
      scoreAcquired = minimumValue
    }

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
        claimedAt: dateString
      })
    }

    const userClaimSuccess = await updateDatabaseUser(updatedUser)
    if (!userClaimSuccess) {
      return message.channel.send('Putz, deu ruim ao atualizar o usuário')
    }

    const tokenClaimSuccess = await updateDatabaseToken(updatedToken)
    if (!tokenClaimSuccess) {
      return message.channel.send('Putz, deu ruim ao atualizar o token')
    }

    const successClaimEmbed = mountClaimEmbed(code, username, score)
    return message.channel.send({ embed: successClaimEmbed })
  } catch (error) {
    console.log(error)
  }
}
