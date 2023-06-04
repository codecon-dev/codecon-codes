import { claimToken } from '../src/commands'
import { mockMessage } from './testUtils'
import { getDatabaseTokenByCode, updateDatabaseToken } from '../src/utils/token'
import { getDatabaseUserById, updateDatabaseUser } from '../src/utils/user'

jest.mock('../src/config', () => ({
  prefix: '.',
  canClaim: true,
  watchedTokens: []
}))

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
  minimumValue: 10,
  totalClaims: 21,
  remainingClaims: 20,
  createdBy: 'markkop',
  claimedBy: [
    {
      tag: 'gabrielnunes',
      id: '588160538110984193',
      claimedAt: '2021-03-14T21:45:59.143Z'
    }
  ],
  createdAt: '2021-03-13T21:45:59.143Z',
  expireAt: '2030-04-24T23:00:00.000Z'
}

const mockedUser = {
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
}

describe('claimToken', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('sends a help message if no token is provided', async () => {
    const content = '.claim'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':grey_question: Ajuda: `.help claim`'
      }
    })
  })

  it('sends a not found message if no token was found to be claimed', async () => {
    const content = '.claim LOLZINH'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toEqual('Não encontrei nenhum token com esse código :(')
  })

  it('claims a token successfully for a new user', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    updateDatabaseToken.mockResolvedValueOnce(true)
    getDatabaseUserById.mockResolvedValueOnce(null)
    updateDatabaseUser.mockResolvedValueOnce(true)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':trophy: Código CODECON21 resgatado!',
        fields: [
          {
            name: 'Usuário',
            value: 'Mark'
          },
          {
            name: 'Pontos obtidos',
            value: 18
          },
          {
            name: 'Total',
            value: 18
          }
        ]
      }
    })
  })

  it('claims a token successfully for an existing user', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    updateDatabaseToken.mockResolvedValueOnce(true)
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    updateDatabaseUser.mockResolvedValueOnce(true)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toMatchObject({
      embed: {
        title: ':trophy: Código CODECON21 resgatado!',
        fields: [
          {
            name: 'Usuário',
            value: 'Mark'
          },
          {
            name: 'Pontos obtidos',
            value: 18
          },
          {
            name: 'Total',
            value: 118
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
          tag: 'gabrielnunes',
          id: '588160538110984193',
          claimedAt: '2021-03-14T21:45:59.143Z'
        },
        {
          tag: 'Mark',
          id: '111',
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

  it('updates a user after its claim', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2022-09-02T12:00:00Z'))
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    await claimToken(userMessage)

    expect(updateDatabaseUser).toHaveBeenCalledTimes(1)
    expect(updateDatabaseUser).toHaveBeenCalledWith(expect.objectContaining({
      userId: 111,
      tag: 'Mark',
      score: 118,
      tokens: [
        {
          code: 'TOKEN',
          claimedAt: '2021-04-24T23:00:00.000Z',
          value: 100
        },
        {
          code: 'CODECON21',
          claimedAt: '2022-09-02T12:00:00.000Z',
          value: 18
        }
      ]
    }))
  })

  it('scores the minimum value for a user', async () => {
    const token = {
      ...mockedToken,
      value: 100,
      decreaseValue: 10,
      minimumValue: 90,
      totalClaims: 3,
      remainingClaims: Infinity,
      claimedBy: Array(3).fill(mockedToken.claimedBy[0])
    }
    getDatabaseTokenByCode.mockResolvedValueOnce(token)
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    await claimToken(userMessage)

    expect(updateDatabaseUser).toHaveBeenCalledTimes(1)
    expect(updateDatabaseUser).toHaveBeenCalledWith(expect.objectContaining({
      userId: 111,
      tag: 'Mark',
      score: 190,
      tokens: [
        {
          code: 'TOKEN',
          claimedAt: '2021-04-24T23:00:00.000Z',
          value: 100
        },
        {
          code: 'CODECON21',
          claimedAt: '2022-09-02T12:00:00.000Z',
          value: 90
        }
      ]
    }))
  })

  it('sends an error message if it fails to update the user', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    updateDatabaseUser.mockResolvedValueOnce(false)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toEqual('Putz, deu ruim ao atualizar o usuário')
  })

  it('sends an error message if it fails to update the token', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    updateDatabaseUser.mockResolvedValueOnce(true)
    updateDatabaseToken.mockResolvedValueOnce(false)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toEqual('Putz, deu ruim ao atualizar o token')
  })

  it('sends an already claimed message if the user has already claimed the token', async () => {
    const claimedToken = {
      ...mockedToken,
      claimedBy: [
        {
          tag: 'Mark',
          id: '111',
          claimedAt: '2021-03-14T21:45:59.143Z'
        }
      ]
    }
    getDatabaseTokenByCode.mockResolvedValueOnce(claimedToken)
    getDatabaseUserById.mockResolvedValueOnce(mockedUser)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toEqual('Você já resgatou esse token :eyes:')
  })

  it('sends an expired token message if it does not have remaining claims', async () => {
    const expiredToken = {
      ...mockedToken,
      remainingClaims: 0
    }
    getDatabaseTokenByCode.mockResolvedValueOnce(expiredToken)
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toEqual('Vish, acabaram os resgates disponíveis para esse token :(')
  })

  it('sends an expired token message if its date is expired', async () => {
    const expiredToken = {
      ...mockedToken,
      expireAt: '2022-09-02T12:00:00Z'
    }
    getDatabaseTokenByCode.mockResolvedValueOnce(expiredToken)
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2022-09-02T12:00:01Z'))
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    const botMessage = await claimToken(userMessage)
    expect(botMessage).toEqual('Esse token expirou :(')
  })

  it('calls a console log if an unexpected error happens', async () => {
    const spy = jest.spyOn(global.console, 'log').mockImplementation()
    const content = '.claim CODECON21'
    const userMessage = mockMessage(content)
    delete userMessage.content
    await claimToken(userMessage)
    expect(spy).toHaveBeenCalled()
  })
})
