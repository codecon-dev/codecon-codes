import { validateTokenCode, mountTokenEmbed } from '../../utils/token'
import { askAndWait } from '../../utils/message'
import { handleMessageError } from '../../utils/handleError'
import { Message } from 'discord.js'

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
function validateAnswerDate (string) {
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
async function askToken (message) {
  const negativeAnswers = ['não', 'nao', 'no', 'n']
  const isNegativeAnswer = answer => negativeAnswers.includes(answer.toLowerCase())

  const askTokenCodeText = ':label: Opa, qual o código do token que você quer criar? (`/[a-zA-Z0-9]+/`)'
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

  const askExpireDateText = ':date: Por fim, esse token terá data limite? Se sim, qual? (`DD/MM/AA HH:MM`)'
  const { content: expireDateAnswer } = await askAndWait(askExpireDateText, message)
  if (!expireDateAnswer) return {}

  let expireDate = ''
  if (!isNegativeAnswer(expireDateAnswer)) {
    const tokenValueValidation = validateAnswerDate(expireDateAnswer)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }

    const mmddyyDate = expireDateAnswer.replace(/(.*?)\/(.*?)\//, '$2/$1/')
    const utcDate = new Date(mmddyyDate)
    expireDate = utcDate
  }

  const token = {
    code,
    description,
    value,
    decreaseValue,
    totalClaims,
    expireAt: expireDate,
    createdBy: message.author.username
  }

  const tokenEmbed = mountTokenEmbed(token)
  const tokenCreateConfirmationMessage = 'Saca só como ficou. Confirma a criação desse token?'
  message.channel.send({ embed: tokenEmbed })
  const { content: tokenCreateConfirmation } = await askAndWait(tokenCreateConfirmationMessage, message)

  if (!isNegativeAnswer(tokenCreateConfirmation)) {
    return token
  }

  message.channel.send('Vish, beleza. Quando quiser tentar de novo é só mandar o mesmo comando.')
  return {}
}

/**
 * Create a party message on the parties channel.
 *
 * @param {Message} message
 * @returns {undefined}
 */
export async function createToken (message) {
  try {
    const token = await askToken(message)
    if (!token || !token.code) {
      return
    }

    await message.channel.send('Token criado!')
    return
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
