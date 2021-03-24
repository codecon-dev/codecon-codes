import { getToken } from '../../src/commands/token/get'
import { mockMessage } from '../testUtils'
import { getDatabaseTokenByCode } from '../../src/utils/token'

jest.mock('../../src/utils/token', () => {
  const originalModule = jest.requireActual('../../src/utils/token')

  return {
    ...originalModule,
    getDatabaseTokenByCode: jest.fn()
  }
})

const mockedToken = {
  code: 'CODECON21',
  description: 'Primeiro código da CodeCon 2021!',
  value: 20,
  decreaseValue: 2,
  minimumValaue: 10,
  totalClaims: 21,
  remainingClaims: 20,
  createdBy: 'markkop',
  claimedBy: [
    {
      username: 'gabrielnunes',
      email: 'gabriel@nunes.com',
      claimedAt: '2021-03-14T21:45:59.143Z'
    }
  ],
  createdAt: '2021-03-13T21:45:59.143Z',
  expireAt: '2021-04-24T23:00:00.000Z'
}

describe('Token Get', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('sends a not found message when no token is found', async () => {
    const content = '.token get CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await getToken(userMessage)
    expect(botMessage).toEqual('Não encontrei nenhum token com esse código :(')
  })

  it('sends a token embed when a token is found', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const content = '.token get CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await getToken(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':coin: CODECON21',
        description: 'Primeiro código da CodeCon 2021!',
        fields: [
          {
            inline: true,
            name: 'Pontos',
            value: 20
          },
          {
            inline: true,
            name: 'Redução por Resgate',
            value: 2
          },
          {
            inline: true,
            name: 'Pontos mínimos',
            value: 20
          },
          {
            inline: true,
            name: 'Resgates máximos',
            value: 21
          },
          {
            inline: true,
            name: 'Resgates restantes',
            value: 20
          },
          {
            name: 'Usuários que resgataram',
            value: 'gabrielnunes'
          },
          {
            name: 'Expira em',
            value: '2021-04-24T23:00:00.000Z'
          }
        ],
        footer: {
          text: 'Criado em 3/13/2021, 6:45:59 PM (GMT-0300) por markkop'
        }
      }
    })
  })
})
