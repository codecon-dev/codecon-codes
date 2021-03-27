import { validateTokenCode } from '../src/utils/token'

describe('validateTokenCode', () => {
  it('passes with a good code', () => {
    const code = 'CODECON21'
    const validation = validateTokenCode(code)
    expect(validation.valid).toBe(true)
  })

  it('fails with special characters', () => {
    const code = 'TR()LEI'
    const validation = validateTokenCode(code)
    expect(validation.valid).toBe(false)
  })

  it('fails with whitespace characters', () => {
    const code = 'TRO LEI'
    const validation = validateTokenCode(code)
    expect(validation.valid).toBe(false)
  })
})
