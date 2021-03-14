import { mountCommandHelpEmbed } from './help'
import { getArgumentsAndOptions } from '../utils/message'
import { getDatabaseTokenByCode, saveTokens } from '../utils/token'

/**
 * Created the embed message with sublimations found list.
 *
 * @param {string} token
 * @param {string} username
 * @returns {import('discord.js').MessageEmbed}
 */
function mountClaimEmbed (token, username) {
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

  const date = new Date(Date.now())
  const dateString = date.toISOString()
  const user = {
    username: message.author.username,
    email: '',
    claimedAt: dateString
  }

  token.remainingClaims = token.remainingClaims - 1
  token.claimedBy.push(user)

  const successClaimEmbed = mountClaimEmbed(code, user.username)
  return message.channel.send({ embed: successClaimEmbed })
}
