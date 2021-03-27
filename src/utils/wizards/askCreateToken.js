
import { validateTokenCode, mountTokenEmbed, validateAnswerDate, validateNumber } from '../token'
import { askAndWait, isNegativeAnswer } from '../message'
import { Message } from 'discord.js'

/**
 * Get options by user input.
 *
 * @param { Message } message
 * @returns {object} Options.
 */
export async function askToken (message) {
  const askTokenCodeText = ':label: Opa, qual o código do token que você quer criar? (`/^[a-zA-Z0-9]+$/`)'
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
    totalClaims = Number(totalClaimsAnswer)
    const tokenValueValidation = validateNumber(totalClaims)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }
  }

  const askExpireDateText = ':date: Por fim, esse token terá data limite? Se sim, qual? (`DD/MM/AA HH:MM` em GMT -3)'
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
    expireDate = utcDate.toISOString()
  }
  const token = {
    code,
    description,
    value,
    decreaseValue,
    minimumValue,
    totalClaims,
    remainingClaims: totalClaims,
    claimedBy: [],
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

  return message.channel.send('Vish, beleza. Quando quiser tentar de novo é só mandar o mesmo comando.')
}
