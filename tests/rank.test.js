import { getRank } from '../src/commands'
import { mockMessage } from './testUtils'
import { getDatabaseUsers } from '../src/utils/user'
import { handleMessageError } from '../src/utils/handleError'

jest.mock('../src/config', () => ({
  prefix: '.',
  rank: {
    enabled: true
  }
}))

jest.mock('../src/utils/handleError', () => ({
  handleMessageError: jest.fn()
}))

jest.mock('../src/utils/user', () => {
  const originalModule = jest.requireActual('../src/utils/user')

  return {
    ...originalModule,
    getDatabaseUsers: jest.fn()
  }
})

const mockedUsers = [
  {
    userId: '123',
    tag: 'Mark',
    score: 100,
    tokens: [
      {
        code: 'TOKEN',
        value: 100,
        claimedAt: '2021-04-24T23:00:00.000Z'
      }
    ]
  },
  {
    userId: '010',
    tag: 'Gabriel Nunes',
    score: 250,
    tokens: [
      {
        code: 'TOKENZ',
        value: 250,
        claimedAt: '2021-04-24T23:00:00.000Z'
      }
    ]
  }
]

describe('getRank', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns the rank embed', async () => {
    getDatabaseUsers.mockResolvedValueOnce(mockedUsers)
    const content = '.rank'
    const userMessage = mockMessage(content)
    const botMessage = await getRank(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        color: 'YELLOW',
        title: ':trophy: Top Rank',
        description: '`#1 ` `Gabriel Nunes                   ` `250  `\n`#2 ` `Mark                            ` `100  `'
      }
    })
  })

  it('handles error and return a message if a error happens', async () => {
    getDatabaseUsers.mockImplementation(() => {
      throw new Error()
    })
    const content = '.rank'
    const userMessage = mockMessage(content)
    const botMessage = await getRank(userMessage)
    expect(handleMessageError).toHaveBeenCalledTimes(1)
    expect(botMessage).toEqual('Dang, something went very wrong. Try asking for help. Anyone?')
  })
})
