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
      totalClaims: 100,
      remainingClaims: 100,
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
})
