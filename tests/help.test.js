import { getHelp } from '../src/commands'
import commandsHelp from '../src/utils/helpMessages'
import { mockMessage } from './testUtils'

describe('getHelp', () => {
  it('returns an error with there is no help for the given option', async () => {
    const content = '.help lang'
    const userMessage = mockMessage(content)
    const botMessage = await getHelp(userMessage)
    expect(botMessage.embed).toMatchObject({
      title: 'No help found for command "lang"'
    })
  })

  it('returns the generic help when no arguments are provided', async () => {
    const content = '.help'
    const userMessage = mockMessage(content)
    const botMessage = await getHelp(userMessage)
    expect(botMessage.embed).toMatchObject({
      color: 'LIGHT_GREY',
      title: ':grey_question: Help',
      description: 'type `.help <command>` to get help for an specific command',
      fields: [
        {
          name: 'Available Commands',
          value: Object.keys(commandsHelp).map(command => `\`${command}\``).join(', ')
        }
      ]
    })
  })

  it('returns a warning if more than one argument is provided', async () => {
    const content = '.help calc equip'
    const userMessage = mockMessage(content)
    const botMessage = await getHelp(userMessage)
    expect(botMessage.embed).toMatchObject({
      color: 'LIGHT_GREY',
      title: ':grey_question: Help',
      description: 'You can get help for only one command',
      fields: [
        {
          name: 'Available Commands',
          value: Object.keys(commandsHelp).map(command => `\`${command}\``).join(', ')
        }
      ]
    })
  })
})
