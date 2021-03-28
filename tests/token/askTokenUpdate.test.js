import { askTokenUpdate } from '../../src/utils/wizards/askUpdateToken'
import { mockMessage, mockUserAnswers } from '../testUtils'
import { askAndWait } from '../../src/utils/message'
import { getDatabaseTokenByCode } from '../../src/utils/token'

jest.mock('../../src/utils/message', () => {
  const originalModule = jest.requireActual('../../src/utils/message')

  return {
    ...originalModule,
    askAndWait: jest.fn()
  }
})

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

describe('askTokenUpdate', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns a not found message if a token is not found by code', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce()
    const answers = [
      'AUSTRALOPITECO'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('Vish, não achei esse token aí não')
  })

  it('returns an error if an invalid option is provided', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'createdAt'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('Foi mal, não entendi. Tem certeza que tentou uma opção válida?')
  })

  it('updates a token description', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'description',
      'new desc',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual({
      ...mockedToken,
      description: 'new desc'
    })
  })

  it('updates a token value', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'value',
      '1234',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual({
      ...mockedToken,
      value: 1234
    })
  })

  it('returns an error if trying to update a token with a non-number value', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'value',
      'trinta'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('updates a token decreaseValue', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'decreaseValue',
      '1234',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual({
      ...mockedToken,
      decreaseValue: 1234
    })
  })

  it('returns an error if trying to update a token with a non-number decreaseValue', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'decreaseValue',
      'trinta'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('updates a token minimumValue', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'minimumValue',
      '1234',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual({
      ...mockedToken,
      minimumValue: 1234
    })
  })

  it('returns an error if trying to update a token with a non-number minimumValue', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'minimumValue',
      'trinta'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('updates a token totalClaims', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'totalClaims',
      '1234',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual({
      ...mockedToken,
      totalClaims: 1234
    })
  })

  it('returns an error if trying to update a token with a non-number totalClaims', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'minimumValue',
      'trinta'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('updates a token expireAt', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'expireAt',
      '10/10/22 19:00',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual({
      ...mockedToken,
      expireAt: '2022-10-10T22:00:00.000Z'
    })
  })

  it('returns an error if trying to update a token with a non-number expireAt', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'expireAt',
      '11 de Abril'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('A data não está no formato DD/MM/YY HH:MM')
  })

  it('returns a try again message if the user doest not confirm its update', async () => {
    getDatabaseTokenByCode.mockResolvedValueOnce(mockedToken)
    const answers = [
      'CODECON21',
      'description',
      'new desc',
      'não'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askTokenUpdate(userMessage)
    expect(token).toEqual('Vish, beleza. Quando quiser tentar de novo é só mandar o mesmo comando.')
  })
})
