import { askToken } from '../../src/utils/wizards/askCreateToken'
import { mockMessage, mockUserAnswers } from '../testUtils'
import { askAndWait } from '../../src/utils/message'

jest.mock('../../src/utils/message', () => {
  const originalModule = jest.requireActual('../../src/utils/message')

  return {
    ...originalModule,
    askAndWait: jest.fn()
  }
})

describe('askToken', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns a token with all expected answers', async () => {
    const answers = [
      'MEUTOKEN',
      'Minha descrição',
      '100',
      '10',
      '50',
      '1000',
      '10/10/21 21:21',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual({
      code: 'MEUTOKEN',
      description: 'Minha descrição',
      value: 100,
      decreaseValue: 10,
      minimumValue: 50,
      totalClaims: 1000,
      remainingClaims: 1000,
      claimedBy: [],
      expireAt: '2021-10-11T00:21:00.000Z',
      createdBy: 'Mark'
    })
  })

  it('returns a token with all minimum expected answers', async () => {
    const answers = [
      'MEUTOKEN',
      'Minha descrição',
      '100',
      'não',
      'não',
      '10/10/21 21:21',
      'sim'
    ]
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual({
      code: 'MEUTOKEN',
      description: 'Minha descrição',
      value: 100,
      decreaseValue: 0,
      minimumValue: 100,
      totalClaims: Infinity,
      remainingClaims: Infinity,
      claimedBy: [],
      expireAt: '2021-10-11T00:21:00.000Z',
      createdBy: 'Mark'
    })
  })

  it('returns a validation error if the token code is not in the expected format', async () => {
    const answers = ['TR()LEI']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('Còdigo não bateu com a regex /[a-zA-Z0-9]+/')
  })

  it('returns a validation error if the token value is not a number', async () => {
    const answers = ['MYCODE', 'Meu código', 'trinta']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('returns a validation error if the token decrease value is not a number', async () => {
    const answers = ['MYCODE', 'Meu código', '30', 'dez']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('returns a validation error if the token minimum value is not a number', async () => {
    const answers = ['MYCODE', 'Meu código', '30', '10', 'um']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('returns a validation error if the token total claims is not a number', async () => {
    const answers = ['MYCODE', 'Meu código', '30', '10', '1', 'cem']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('O valor informado não é um número =/')
  })

  it('returns a validation error if the token expire date is not in the expected format', async () => {
    const answers = ['MYCODE', 'Meu código', '30', '10', '1', '100', '30/01/2021']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('A data não está no formato DD/MM/YY HH:MM')
  })

  it('returns a try again message if the user does not confirm the token creation', async () => {
    const answers = ['MYCODE', 'Meu código', '30', '10', '1', '100', '30/01/21 19:10', 'não']
    mockUserAnswers(askAndWait, answers)

    const userMessage = mockMessage('')
    const token = await askToken(userMessage)
    expect(token).toEqual('Vish, beleza. Quando quiser tentar de novo é só mandar o mesmo comando.')
  })
})
