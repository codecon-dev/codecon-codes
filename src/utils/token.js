import { openFile, saveFile } from './files'

/**
 * @typedef UserClaim
 * @property {string} username
 * @property {string} email
 * @property {string} claimedAt ISO Date String.
 */

/**
 * @typedef Token
 * @property {string} code
 * @property {string} description
 * @property {number} value
 * @property {number} decreaseValue
 * @property {number} totalClaims
 * @property {number} remainingClaims
 * @property {UserClaim[]} claimedBy
 * @property {string} createdBy ISO Date String.
 * @property {string} createdAt ISO Date String.
 * @property {string} expireAt ISO Date String.
 */

/**
 * Get all tokens from database.
 *
 * @returns {Token[]}
 */
export async function getDatabaseTokens () {
  try {
    const tokens = openFile('data/tokens.json')
    return tokens
  } catch (error) {
    console.log(error)
  }
}

/**
 * Get a token from database by its code.
 *
 * @param {Token}code
 * @returns {Token}
 */
export async function getDatabaseTokenByCode (code) {
  try {
    const tokens = openFile('data/tokens.json')
    return tokens.find(token => token.code === code)
  } catch (error) {
    console.log(error)
  }
}

/**
 * Creates a new token.
 *
 * @param {Token} token
 * @returns {Token[]}
 */
export async function createDatabaseToken (token) {
  try {
    const { code } = token
    const tokens = openFile('data/tokens.json')
    const existingToken = tokens.find(token => token.code === code)
    if (existingToken) {
      throw new Error(`Error on Token Creation: Token ${code} already exists`)
    }
    tokens.push(token)
    saveFile(tokens, 'data/tokens.json')
    return tokens
  } catch (error) {
    console.log(error)
  }
}

/**
 * Update a token.
 *
 * @param {Token} token
 * @returns {Token}
 */
export async function updateDatabaseToken (token) {
  try {
    const { code } = token
    const tokens = openFile('data/tokens.json')
    const existingToken = tokens.find(token => token.code === code)
    if (!existingToken) {
      throw new Error(`Error on Token Update: Token ${code} was not found`)
    }
    const updatedToken = {
      ...existingToken,
      ...token
    }
    const existingTokenIndex = tokens.indexOf(existingToken)
    tokens[existingTokenIndex] = updatedToken
    saveFile('data/tokens.json', tokens)
    return updatedToken
  } catch (error) {
    console.log(error)
  }
}

/**
 * @typedef ValidationResult
 * @property {boolean} valid
 * @property {string} [message]
 */

/**
 * Validates Token Code.
 *
 * @param {string} code
 * @returns {ValidationResult}
 */
export function validateTokenCode (code) {
  if (!/[a-zA-Z0-9]+/.test(code)) {
    return {
      valid: false,
      message: 'Còdigo não bateu com a regex /[a-zA-Z0-9]+/'
    }
  }

  return {
    valid: true
  }
}
