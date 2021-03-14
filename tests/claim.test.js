import { claimToken } from '../src/commands'
import { mockMessage } from './testUtils'
import { getDatabaseTokenByCode, saveTokens } from '../src/utils/token'

jest.mock('../src/utils/token', () => ({
  handleMessageError: jest.fn()
}))

describe('claimToken', () => {
  it('sends a success embed when claimed successfully', async () => {
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage.embed).toMatchObject({
      title: ':trophy: Código resgatado!',
      fields: [
        {
          name: 'Usuário',
          value: 'Mark',
          inline: true
        },
        {
          name: 'Código',
          value: 'CODECON21',
          inline: true
        }
      ]
    })
  })
})
