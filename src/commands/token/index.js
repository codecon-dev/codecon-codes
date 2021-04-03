import { createToken } from './create'
import { getToken } from './get'
import { listTokens } from './list'
import { updateToken } from './update'
import { mountCommandHelpEmbed } from '../help'
import { getArgumentsAndOptions } from '../../utils/message'
import { Message } from 'discord.js'

const tokenActions = {
  create: createToken,
  get: getToken,
  list: listTokens,
  update: updateToken
}

/**
 * Create, update, get or list tokens.
 *
 * @param {Message} message
 * @returns {Promise<Message>}
 */
export async function token (message) {
  const { args, options } = getArgumentsAndOptions(message, '=')
  const argument = args[0]
  const isValidArgument = Object.keys(tokenActions).some(key => key === argument)
  if (!isValidArgument) {
    const helpEmbed = mountCommandHelpEmbed(message)
    return message.channel.send({ embed: helpEmbed })
  }

  const tokenAction = tokenActions[argument]
  return tokenAction(message, options)
}
