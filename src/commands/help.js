import { getArgumentsAndOptions, getCommand } from '../utils/message'
import commandsHelp from '../utils/helpMessages'
import config from '../config'
const { prefix } = config

/**
 * Get fields with more help information.
 *
 * @returns {object[]}
 */
function getMoreHelpFields () {
  const commandsListText = Object.keys(commandsHelp).map(command => `\`${command}\``).join(', ')
  return [
    {
      name: 'Comandos disponíveis',
      value: commandsListText
    }
  ]
}

/**
 * Mounts the help message embed.
 *
 * @param {object|string} messageOrArgument
 * @returns {object}
 */
export function mountCommandHelpEmbed (messageOrArgument) {
  const command = typeof messageOrArgument === 'string' ? messageOrArgument : getCommand(prefix, messageOrArgument)
  return {
    color: 'LIGHT_GREY',
    title: `:grey_question: Ajuda: \`.help ${command}\``,
    description: commandsHelp[command].help,
    fields: [
      {
        name: 'Exemplos',
        value: commandsHelp[command].examples.map(example => `\`${example}\``).join('\n')
      },
      ...getMoreHelpFields()
    ]
  }
}

/**
 * Replies the user with a help message.
 *
 * @param { import('discord.js').Message } message - Discord message object.
 * @returns {Promise<object>}
 */
export function getHelp (message) {
  const { args } = getArgumentsAndOptions(message, '=')

  const hasArguments = Boolean(args.length)
  const hasTooManyArguments = args.length > 1
  const helpArgument = args[0]
  const embed = {
    color: 'LIGHT_GREY',
    title: ':grey_question: Help',
    description: 'Digite `.help <command>` para obter ajuda de um comando específico',
    fields: getMoreHelpFields()
  }
  if (!hasArguments) {
    return message.channel.send({ embed })
  }

  if (hasTooManyArguments) {
    embed.description = 'You can get help for only one command'
    return message.channel.send({ embed })
  }

  const hasValidArgument = Object.keys(commandsHelp).some(command => command === helpArgument)
  if (!hasValidArgument) {
    embed.title = `No help found for command "${helpArgument}"`
    return message.channel.send({ embed })
  }

  const helpEmbed = mountCommandHelpEmbed(helpArgument)
  return message.channel.send({ embed: helpEmbed })
}
