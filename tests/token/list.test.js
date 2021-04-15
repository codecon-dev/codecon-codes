import { listTokens } from '../../src/commands/token/list'
import { mockMessage } from '../testUtils'
import { getDatabaseTokens } from '../../src/utils/token'

jest.mock('../../src/utils/token', () => {
  const originalModule = jest.requireActual('../../src/utils/token')

  return {
    ...originalModule,
    getDatabaseTokens: jest.fn()
  }
})

const mockedTokens = [
  {
    code: 'CODECON21',
    description: 'Primeiro código da CodeCon 2021!',
    value: 20,
    decreaseValue: 2,
    minimumValue: 10,
    totalClaims: 21,
    remainingClaims: 20,
    createdBy: 'markkop',
    claimedBy: [
      {
        tag: 'gabrielnunes',
        email: 'gabriel@nunes.com',
        claimedAt: '2021-03-14T21:45:59.143Z'
      }
    ],
    createdAt: '2021-03-13T21:45:59.143Z',
    expireAt: '2021-04-24T23:00:00.000Z'
  },
  {
    code: 'MARKTOKEN',
    description: 'Código do Mark apenas, não resgate ò_Ó',
    value: 100,
    decreaseValue: 0,
    minimumValue: 100,
    totalClaims: 1,
    remainingClaims: 1,
    createdBy: 'markkop',
    claimedBy: [],
    createdAt: '2021-03-13T21:45:59.143Z',
    expireAt: '2021-04-24T23:00:00.000Z'
  }
]

describe('listTokens', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('list tokens in each column', async () => {
    getDatabaseTokens.mockResolvedValueOnce(mockedTokens)
    const content = '.token list'
    const userMessage = mockMessage(content)
    const botMessage = await listTokens(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: '📜 Lista de Tokens',
        fields: [
          {
            name: 'Número total de Tokens',
            value: 2
          },
          {
            inline: true,
            name: 'Tokens',
            value: 'CODECON21'
          },
          {
            inline: true,
            name: '​',
            value: 'MARKTOKEN'
          }
        ]
      }
    })
  })

  it('truncates field text when there is a lot of tokens to list', async () => {
    const lotsOfTokens = Array(1000).fill(mockedTokens[0])
    getDatabaseTokens.mockResolvedValueOnce(lotsOfTokens)
    const content = '.token list'
    const userMessage = mockMessage(content)
    const botMessage = await listTokens(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        fields: [
          {
            name: 'Número total de Tokens',
            value: 1000
          },
          {
            inline: true,
            name: 'Tokens',
            value: expect.stringContaining('...')
          },
          {
            inline: true,
            name: '​',
            value: expect.stringContaining('...')
          }
        ]
      }
    })
  })
})
