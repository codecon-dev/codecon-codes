import { claimToken } from '../src/commands'
import { mockMessage } from './testUtils'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../src/utils/token'

jest.mock('../src/utils/token', () => ({
  getDatabaseTokenByCode: jest.fn(),
  updateDatabaseToken: jest.fn()
}))

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

describe('claimToken', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('sends a success embed when claimed successfully', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
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
          },
          {
            name: 'Pontos',
            value: 'Obtidos: 18\nTotal: 18'
          }
        ]
      }
    })
  })

  it('updates a token after its claim', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2022-09-02T12:00:00'))
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    await claimToken(userMessage)
    const expectedToken = {
      code: 'CODECON21',
      description: 'Primeiro código da CodeCon 2021!',
      value: 20,
      decreaseValue: 2,
      minimumValaue: 10,
      totalClaims: 21,
      remainingClaims: 19,
      createdBy: 'markkop',
      claimedBy: [
        {
          username: 'gabrielnunes',
          email: 'gabriel@nunes.com',
          claimedAt: '2021-03-14T21:45:59.143Z'
        },
        {
          username: 'Mark',
          email: '',
          claimedAt: '2022-09-02T15:00:00.000Z'
        }
      ],
      createdAt: '2021-03-13T21:45:59.143Z',
      expireAt: '2021-04-24T23:00:00.000Z'
    }
    expect(updateDatabaseToken).toHaveBeenCalledTimes(1)
    expect(updateDatabaseToken).toHaveBeenCalledWith(expectedToken)
  })
})
