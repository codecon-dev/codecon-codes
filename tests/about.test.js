import { getAbout } from '../src/commands'
import { aboutText } from '../src/commands/about'
import { mockMessage } from './testUtils'

describe('getAbout', () => {
  it('sends the correct about text', () => {
    const content = '.about'
    const userMessage = mockMessage(content)
    const botMessage = getAbout(userMessage)
    expect(botMessage.embed).toMatchObject({
      color: 'YELLOW',
      title: ':robot: About codecon-codes',
      description: aboutText
    })
  })
})
