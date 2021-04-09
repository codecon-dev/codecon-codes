import { getSelfUser } from '../src/commands'
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

  it('returns a fresh user card if no user was found', async () => {
    getDatabaseUserById.mockResolvedValueOnce(null)
    const content = '.me'
    const userMessage = mockMessage(content)
    const botMessage = await getSelfUser(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':bust_in_silhouette: Mark',
        thumbnail: {
          url: 'https://www.image.com/url.webp'
        },
        fields: [
          {
            inline: true,
            name: 'Rank',
            value: '#??'
          },
          {
            inline: true,
            name: 'Pontos',
            value: 0
          }
        ]
      }
    })
  })

  it('returns a user card', async () => {
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    getUserRankPosition.mockResolvedValueOnce(10)
    const content = '.me'
    const userMessage = mockMessage(content)
    const botMessage = await getSelfUser(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':bust_in_silhouette: Mark',
        thumbnail: {
          url: 'https://www.image.com/url.webp'
        },
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
          }
        ]

      }
    })
  })

  it('handles error and return a message if a error happens', async () => {
    getDatabaseUserById.mockImplementation(() => {
      throw new Error()
    })
    const content = '.me'
    const userMessage = mockMessage(content)
    const botMessage = await getSelfUser(userMessage)
    expect(handleMessageError).toHaveBeenCalledTimes(1)
    expect(botMessage).toEqual('Dang, something went very wrong. Try asking for help. Anyone?')
  })
})
