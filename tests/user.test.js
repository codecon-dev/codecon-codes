import { getUser } from '../src/commands'
import { mockMessage } from './testUtils'
import { getDatabaseUserById, getUserRankPosition } from '../src/utils/user'
import { handleMessageError } from '../src/utils/handleError'

jest.mock('../src/utils/handleError', () => ({
  handleMessageError: jest.fn()
}))

jest.mock('../src/utils/user', () => {
  const originalModule = jest.requireActual('../src/utils/user')

  return {
    ...originalModule,
    getDatabaseUserById: jest.fn(),
    getUserRankPosition: jest.fn()
  }
})

const mockedUser = {
  userId: '123',
  username: 'Mark',
  score: 100,
  tokens: [
    {
      code: 'TOKEN',
      value: 100,
      claimedAt: '2021-04-24T23:00:00.000Z'
    }
  ]
}

describe('getUser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('sends a help message if no user id is provided', async () => {
    const content = '.user'
    const userMessage = mockMessage(content)
    const botMessage = await getUser(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':grey_question: Ajuda: `.help user`'
      }
    })
  })

  it('sends a not found message if no user was found', async () => {
    getDatabaseUserById.mockResolvedValueOnce(null)
    const content = '.user 123'
    const userMessage = mockMessage(content)
    const botMessage = await getUser(userMessage)
    expect(botMessage).toEqual('Não encontrei nenhum user com esse id :(')
  })

  it('returns a user successfully', async () => {
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    getUserRankPosition.mockResolvedValueOnce(10)
    const content = '.user 123'
    const userMessage = mockMessage(content)
    const botMessage = await getUser(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':bust_in_silhouette: Mark (123)',
        fields: [
          {
            inline: true,
            name: 'Rank',
            value: '#10'
          },
          {
            inline: true,
            name: 'Pontos',
            value: 100
          },
          {
            name: 'Tokens',
            value: 'TOKEN'
          }
        ]
      }
    })
  })

  it('handles error and return a message if a error happens', async () => {
    const content = '.user 123'
    const userMessage = mockMessage(content)
    delete userMessage.content
    const botMessage = await getUser(userMessage)
    expect(handleMessageError).toHaveBeenCalledTimes(1)
    expect(botMessage).toEqual('Dang, something went very wrong. Try asking for help. Anyone?')
  })
})
