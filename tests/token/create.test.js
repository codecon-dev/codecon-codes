import { createToken } from '../../src/commands/token/create'
import { askToken } from '../../src/utils/wizards/askCreateToken'
import { mockMessage } from '../testUtils'
import { createDatabaseToken } from '../../src/utils/token'

jest.mock('../../src/utils/wizards/askCreateToken', () => ({
  askToken: jest.fn()
}))

jest.mock('../../src/utils/token', () => {
  const originalModule = jest.requireActual('../../src/utils/token')

  return {
    ...originalModule,
    createDatabaseToken: jest.fn()
  }
})

const mockedAskedToken = {
  code: 'CODECON21',
  description: 'Primeiro código da CodeCon 2021!',
  value: 20,
  decreaseValue: 2,
  minimumValaue: 10,
  totalClaims: 21,
  remainingClaims: 21,
  createdBy: 'markkop',
  claimedBy: [],
  createdAt: '2021-03-13T21:45:59.143Z',
  expireAt: '2021-04-24T23:00:00.000Z'
}

describe('createToken', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates a token', async () => {
    createDatabaseToken.mockResolvedValueOnce(true)
    askToken.mockResolvedValueOnce(mockedAskedToken)
    const content = '.token create'
    const userMessage = mockMessage(content)
    const botMessage = await createToken(userMessage)
    expect(botMessage).toEqual('Token criado!')
  })

  it('do nothing if askToken returns a non-token object', async () => {
    askToken.mockResolvedValueOnce({})
    const content = '.token create'
    const userMessage = mockMessage(content)
    const botMessage = await createToken(userMessage)
    expect(botMessage).toBeFalsy()
  })

  it('returns an error message if database creation fails', async () => {
    createDatabaseToken.mockResolvedValueOnce(false)
    askToken.mockResolvedValueOnce(mockedAskedToken)
    const content = '.token create'
    const userMessage = mockMessage(content)
    const botMessage = await createToken(userMessage)
    expect(botMessage).toEqual('Não foi possível criar o token :c Olha o log')
  })
})
