import { getDatabaseTokens } from '../../utils/token'
import { handleMessageError } from '../../utils/handleError'
import { truncateFieldValue } from '../../utils/message'
import { Message } from 'discord.js'

/**
 * Split an array in two.
 *
 * @param {Array} array
 * @returns {Array[]}
 */
function splitArray (array) {
  var indexToSplit = Math.ceil(array.length / 2)
  var firstArray = array.slice(0, indexToSplit)
  var secondArray = array.slice(indexToSplit)
  return [firstArray, secondArray]
}

/**
 * Mount the embed of the Tokens List command response.
 *
 * @param {string[]}tokensCodes
 * @returns {import('discord.js').MessageEmbed}
 */
function mountTokenListEmbed (tokensCodes) {
  const [firstTokens, secondTokens] = splitArray(tokensCodes)

  return {
    color: '#40b2b5',
    title: '📜 Lista de Tokens',
    fields: [
      {
        name: 'Número total de Tokens',
        value: tokensCodes.length
      },
      {
        name: 'Tokens',
        value: truncateFieldValue(firstTokens.join('\n')),
        inline: true
      },
      {
        name: '\u200B',
        value: truncateFieldValue(secondTokens.join('\n')),
        inline: true
      }
    ]
  }
}

/**
 * Get a token from the database to check its data.
 *
 * @param {Message} message
 * @returns {any}
 */
export async function listTokens (message) {
  try {
    const tokens = await getDatabaseTokens()
    if (!tokens.length) {
      return message.channel.send('Vish, nenhum token encontrado. Tá tudo certo com a base? :eyes:')
    }

    const tokensCodes = tokens.map(token => token.code.toUpperCase()).sort()
    const tokenListEmbed = mountTokenListEmbed(tokensCodes)
    await message.channel.send({ embed: tokenListEmbed })
    return
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
