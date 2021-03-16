import { createToken } from './create'
import { mountCommandHelpEmbed } from '../help'
import { getArgumentsAndOptions } from '../../utils/message'

const tokenActions = {
  create: createToken
}

/**
 * Create, join, update or leave a party listing.
 *
 * @param {object} message
 * @returns {Promise<object>}
 */
export function token (message) {
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
