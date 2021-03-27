import { updateToken } from '../../src/commands/token/update'
import { askTokenUpdate } from '../../src/utils/wizards/askUpdateToken'
import { mockMessage } from '../testUtils'
import { updateDatabaseToken } from '../../src/utils/token'

jest.mock('../../src/utils/wizards/askUpdateToken', () => ({
  askTokenUpdate: jest.fn()
}))

jest.mock('../../src/utils/token', () => {
  const originalModule = jest.requireActual('../../src/utils/token')

  return {
    ...originalModule,
    updateDatabaseToken: jest.fn()
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

describe('updateToken', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates a token', async () => {
    updateDatabaseToken.mockResolvedValueOnce(true)
    askTokenUpdate.mockResolvedValueOnce(mockedAskedToken)
    const content = '.token update'
    const userMessage = mockMessage(content)
    const botMessage = await updateToken(userMessage)
    expect(botMessage).toEqual('Token atualizado!')
  })

  it('do nothing if askTokenUpdate returns a non-token object', async () => {
    askTokenUpdate.mockResolvedValueOnce({})
    const content = '.token update'
    const userMessage = mockMessage(content)
    const botMessage = await updateToken(userMessage)
    expect(botMessage).toBeFalsy()
  })

  it('returns an error message if database creation fails', async () => {
    updateDatabaseToken.mockResolvedValueOnce(false)
    askTokenUpdate.mockResolvedValueOnce(mockedAskedToken)
    const content = '.token update'
    const userMessage = mockMessage(content)
    const botMessage = await updateToken(userMessage)
    expect(botMessage).toEqual('Não foi possível atualizar o token :c Olha o log')
  })
})
