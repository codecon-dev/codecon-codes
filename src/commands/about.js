import { name, description } from '../../package.json'

export const aboutText = `${description}.  

Created by [Mark Kop](https://github.com/Markkop) and maintaned by the CodeCon's Team
`

/**
 * Send a message with information about this bot.
 *
 * @param { import('discord.js').Message } message - Discord message object.
 * @returns {Promise<object>}
 */
export function getAbout (message) {
  const embed = {
    color: 'YELLOW',
    title: `:robot: About ${name}`,
    description: aboutText
  }
  return message.channel.send({ embed })
}
