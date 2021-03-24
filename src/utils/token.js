import { openFile, saveFile } from './files'
import { truncateFieldValue } from './message'

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
 * @property {number} minimumValue
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
 * @returns {boolean}
 */
export async function createDatabaseToken (token) {
  try {
    const { code } = token
    const tokens = openFile('data/tokens.json')
    const existingToken = tokens.find(token => token.code === code)
    if (existingToken) {
      throw new Error(`Error on Token Creation: Token ${code} already exists`)
    }

    const date = new Date(Date.now())
    const dateString = date.toISOString()
    token.createdAt = dateString
    tokens.push(token)
    saveFile(tokens, 'data/tokens.json')
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

/**
 * Update a token.
 *
 * @param {Token} token
 * @returns {boolean}
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
    saveFile(tokens, 'data/tokens.json')
    return true
  } catch (error) {
    console.log(error)
    return false
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

/**
 * @typedef ValidationResult
 * @property {boolean} valid
 * @property {string} [message]
 */

/**
 * Check if the date provided by the user is valid.
 *
 * @param {string} string - DD/MM/YY HH:MM.
 * @returns {ValidationResult}
 */
export function validateAnswerDate (string) {
  const dateRegex = /^([1-9]|([012][0-9])|(3[01]))\/([0]{0,1}[1-9]|1[012])\/\d\d\s([0-1]?[0-9]|2?[0-3]):([0-5]\d)$/
  if (!dateRegex.test(string)) {
    return {
      valid: false,
      message: 'A data não está no formato DD/MM/YY HH:MM'
    }
  }
  return {
    valid: true
  }
}

/**
 * Check if the a given value is a number.
 *
 * @param {string} number
 * @returns {ValidationResult}
 */
export function validateNumber (number) {
  if (Number.isNaN(number) && typeof number === 'number') {
    return {
      valid: false,
      message: 'O valor informado não é um número =/'
    }
  }
  return {
    valid: true
  }
}

/**
 * Creates the Token message embed.
 *
 * @param {Token} token
 * @returns {import('discord.js').MessageEmbed}
 */
export function mountTokenEmbed (token) {
  const { claimedBy, createdAt, expireAt } = token
  const claimedByText = (claimedBy || []).map(user => user.username).join(', ') || 'Ninguém'
  const createdAtText = createdAt ? new Date(createdAt) : 'Ainda não foi criado'
  const expireAtText = expireAt ? new Date(expireAt) : 'Não expira'
  return {
    title: `:coin: ${token.code.toUpperCase()}`,
    description: token.description,
    fields: [
      {
        name: 'Pontos',
        value: token.value,
        inline: true
      },
      {
        name: 'Redução por Resgate',
        value: token.decreaseValue || 0,
        inline: true
      },
      {
        name: 'Pontos mínimos',
        value: token.minimumValue || token.value,
        inline: true
      },
      {
        name: 'Resgates máximos',
        value: token.totalClaims,
        inline: true
      },
      {
        name: 'Resgates restantes',
        value: token.remainingClaims || token.totalClaims,
        inline: true
      },
      {
        name: 'Usuários que resgataram',
        value: truncateFieldValue(claimedByText)
      },
      {
        name: 'Expira em',
        value: expireAtText
      }
    ],
    footer: {
      text: `Criado em ${createdAtText.toLocaleString()} (GMT-0300) por ${token.createdBy}`
    }
  }
}
