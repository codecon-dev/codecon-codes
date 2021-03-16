import { validateTokenCode } from '../../utils/token'
import { askAndWait } from '../../utils/message'
import { handleMessageError } from '../../utils/handleError'
import { Message } from 'discord.js'

/**
 * @typedef ValidationResult
 * @property {boolean} valid
 * @property {string} [message]
 */

/**
 * Check if the a given value is a number.
 *
 * @param {string} number
 * @returns {ValidationResult}
 */
function validateNumber (number) {
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
 * Get options by user input.
 *
 * @param { Message } message
 * @returns {object} Options.
 */
async function askOptions (message) {
  const negativeAnswers = ['não', 'nao', 'no', 'n']
  const isNegativeAnswer = answer => negativeAnswers.includes(answer.toLowerCase())

  const askTokenCodeText = ':label: Opa, qual o código do token que você quer criar? (/[a-zA-Z0-9]+/)'
  const { content: code } = await askAndWait(askTokenCodeText, message)
  if (!code) return {}

  const tokenCodeValidation = validateTokenCode(code)
  if (!tokenCodeValidation.valid) {
    return message.channel.send(tokenCodeValidation.message)
  }

  const askTokenDescriptionText = ':speech_balloon: Manda aí uma descrição curta pra esse token:'
  const { content: description } = await askAndWait(askTokenDescriptionText, message)
  if (!description) return {}

  const askTokenValueText = ':coin: Boa, quantos pontos esse token vale?'
  const { content: valueAnswer } = await askAndWait(askTokenValueText, message)
  if (!valueAnswer) return {}

  const value = Number(valueAnswer)
  const tokenValueValidation = validateNumber(value)
  if (!tokenValueValidation.valid) {
    return message.channel.send(tokenValueValidation.message)
  }

  const askTokenDecreaseValueText = ':chart_with_downwards_trend: Entendi. E esse token vai valer menos a cada resgate? Se sim, quantos pontos?'
  const { content: decreaseValueText } = await askAndWait(askTokenDecreaseValueText, message)
  if (!decreaseValueText) return {}

  let decreaseValue = 0
  let minimumValue = value
  if (!isNegativeAnswer(decreaseValueText)) {
    decreaseValue = Number(decreaseValueText)
    const tokenDecreaseValueValidation = validateNumber(decreaseValue)
    if (!tokenDecreaseValueValidation.valid) {
      return message.channel.send(tokenDecreaseValueValidation.message)
    }

    const askTokenMinimumValueText = ':third_place: Melhor a galera resgatar rápido então. Qual o valor mínimo para os pontos?'
    const { content: minimumValueAnswer } = await askAndWait(askTokenMinimumValueText, message)
    if (!minimumValueAnswer) return {}

    minimumValue = Number(minimumValueAnswer)
    const tokenMinimumValueValidation = validateNumber(minimumValue)
    if (!tokenMinimumValueValidation.valid) {
      return message.channel.send(tokenMinimumValueValidation.message)
    }
  }

  const askTokenTotalClaimsText = ':busts_in_silhouette: Esse token terá limite de usos? Se sim, quantos?'
  const { content: totalClaimsAnswer } = await askAndWait(askTokenTotalClaimsText, message)
  if (!totalClaimsAnswer) return {}

  let totalClaims = Infinity
  if (!isNegativeAnswer(totalClaimsAnswer)) {
    totalClaims = Number(valueAnswer)
    const tokenValueValidation = validateNumber(totalClaims)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }
  }

  const askExpireDateText = ':date: Por fim, esse token terá data limite? Se sim, qual? (DD/MM/AA HH:MM)'
  const { content: expireDateAnswer } = await askAndWait(askExpireDateText, message)
  if (!expireDateAnswer) return {}

  let expireDate = ''
  if (!isNegativeAnswer(expireDateAnswer)) {
    expireDate = Number(valueAnswer)
    const tokenValueValidation = validateNumber(expireDate)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }
  }

  return {
    code,
    description,
    value,
    decreaseValue,
    totalClaims,
    expireAt: expireDate
  }
}

/**
 * Create a party message on the parties channel.
 *
 * @param {object} message
 * @returns {object}
 */
export async function createToken (message) {
  try {
    const options = await askOptions(message)
    if (!options.name) {
      return
    }
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
