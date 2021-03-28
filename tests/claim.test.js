import { claimToken } from '../src/commands'
import { mockMessage } from './testUtils'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../src/utils/token'
import { getDatabaseUserById, updateDatabaseUser } from '../src/utils/user'

jest.mock('../src/utils/token', () => ({
  getDatabaseTokenByCode: jest.fn(),
  updateDatabaseToken: jest.fn()
}))

jest.mock('../src/utils/user', () => ({
  getDatabaseUserById: jest.fn(),
  updateDatabaseUser: jest.fn()
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
    updateDatabaseToken.mockResolvedValueOnce(true)
    getDatabaseUserById.mockResolvedValueOnce(null)
    updateDatabaseUser.mockResolvedValueOnce(true)
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
    getDatabaseUserById.mockResolvedValueOnce(null)
    updateDatabaseUser.mockResolvedValueOnce(true)
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2022-09-02T12:00:00Z'))
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    await claimToken(userMessage)

    expect(updateDatabaseToken).toHaveBeenCalledTimes(1)
    expect(updateDatabaseToken).toHaveBeenCalledWith(expect.objectContaining({
      remainingClaims: 19,
      claimedBy: [
        {
          username: 'gabrielnunes',
          claimedAt: '2021-03-14T21:45:59.143Z'
        },
        {
          username: 'Mark',
          claimedAt: '2022-09-02T12:00:00.000Z'
        }
      ]
    }))
  })

  it('updates a token with infinite uses after its claim', async () => {
    const infinityToken = {
      ...mockedToken,
      totalClaims: Infinity,
      remainingClaims: Infinity
    }
    getDatabaseTokenByCode.mockResolvedValueOnce(infinityToken)
    getDatabaseUserById.mockResolvedValueOnce(null)
    updateDatabaseUser.mockResolvedValueOnce(true)
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2022-09-02T12:00:00Z'))
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    await claimToken(userMessage)

    expect(updateDatabaseToken).toHaveBeenCalledTimes(1)
    expect(updateDatabaseToken).toHaveBeenCalledWith(expect.objectContaining({
      remainingClaims: Infinity
    }))
  })
})
