import { getArgumentsAndOptions, getCommand } from '../src/utils/message'
import { handleMessageError, handleReactionError } from '../src/utils/handleError'
import { mockMessage } from './testUtils'

describe('getArgumentsAndOptions', () => {
  it('get arguments and options correctly', () => {
    const message = { content: '.equip o eterno raridade=mítico' }
    const { args, options } = getArgumentsAndOptions(message, '=')
    expect(args).toEqual(['o', 'eterno'])
    expect(options).toEqual({ raridade: 'mítico' })
  })

  it('get options with quotes', () => {
    const message = { content: '.comando algum argumento opcao1="azul claro" opcao2="banana"' }
    const { args, options } = getArgumentsAndOptions(message, '=')
    expect(args).toEqual(['algum', 'argumento'])
    expect(options).toEqual({ opcao1: 'azul claro', opcao2: 'banana' })
  })

  it('get options with and without quotes', () => {
    const message = { content: '.comando algum argumento opcao1=azul opcao2="banana"' }
    const { args, options } = getArgumentsAndOptions(message, '=')
    expect(args).toEqual(['algum', 'argumento'])
    expect(options).toEqual({ opcao1: 'azul', opcao2: 'banana' })
  })

  it('get command correctly', () => {
    const message = { content: '.calc base 20 dmg 30 res 10' }
    const command = getCommand('.', message)
    expect(command).toEqual('calc')
  })
})

describe('handleError functions', () => {
  it('handleMessageError calls console log', () => {
    const spy = jest.spyOn(global.console, 'log').mockImplementation()
    const message = mockMessage('')
    const error = { toString: jest.fn() }
    handleMessageError(error, message)
    expect(spy).toHaveBeenCalled()
  })

  it("handleMessageError doesn't brake if message comes without enough properties", () => {
    const spy = jest.spyOn(global.console, 'log').mockImplementation()
    const error = { toString: jest.fn() }
    handleMessageError(error, {})
    expect(spy).toHaveBeenCalled()
  })

  it('handleReactionError calls console log', () => {
    const spy = jest.spyOn(global.console, 'log').mockImplementation()
    const reaction = { message: mockMessage('') }
    const user = { username: '' }
    const error = { toString: jest.fn() }
    handleReactionError(error, reaction, user)
    expect(spy).toHaveBeenCalled()
  })
})