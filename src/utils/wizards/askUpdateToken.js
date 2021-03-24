import { validateTokenCode, mountTokenEmbed, validateAnswerDate, validateNumber, getDatabaseTokenByCode } from '../../utils/token'
import { askAndWait, isNegativeAnswer } from '../../utils/message'
import { Message } from 'discord.js'

/**
 * Get options by user input.
 *
 * @param { Message } message
 * @returns {object} Options.
 */
export async function askTokenUpdate (message) {
  const editOptions = ['code', 'description', 'value', 'decreaseValue', 'minimumValue', 'totalClaims', 'expireAt']

  const askTokenCodeText = ':label: E aí, qual o token que você quer atualizar?'
  const { content: code } = await askAndWait(askTokenCodeText, message)
  if (!code) return {}

  const token = await getDatabaseTokenByCode(code)
  if (!token) {
    const notFoundTokenMessage = 'Vish, não achei esse token aí não'
    return message.channel.send(notFoundTokenMessage)
  }

  const tokenEmbed = mountTokenEmbed(token)
  await message.channel.send({ embed: tokenEmbed })
  const tokenFoundText = 'Beleza, achei esse aqui. O que você quer editar nele?'
  const tokenUpdateOptionsText = `Escolha entre:\n${editOptions.join(', ')}`
  const { content: editOption } = await askAndWait(`${tokenFoundText}\n${tokenUpdateOptionsText}`, message)

  const isValidOption = editOptions.some(option => option === editOption)
  if (!isValidOption) {
    const invalidOptionMessage = 'Foi mal, não entendi. Tem certeza que tentou uma opção válida?'
    return message.channel.send(invalidOptionMessage)
  }

  if (editOption === 'code') {
    const askTokenCodeText = ':label: Qual será o novo código? (`/[a-zA-Z0-9]+/`)'
    const { content: code } = await askAndWait(askTokenCodeText, message)
    if (!code) return {}

    const tokenCodeValidation = validateTokenCode(code)
    if (!tokenCodeValidation.valid) {
      return message.channel.send(tokenCodeValidation.message)
    }

    token.code = code
  }

  if (editOption === 'description') {
    const askTokenDescriptionText = ':speech_balloon: Qual será a nova descrição?'
    const { content: description } = await askAndWait(askTokenDescriptionText, message)
    if (!description) return {}

    token.description = description
  }

  if (editOption === 'value') {
    const askTokenValueText = ':coin: Quantos pontos esse token valerá daqui pra frente?'
    const { content: valueAnswer } = await askAndWait(askTokenValueText, message)
    if (!valueAnswer) return {}

    const value = Number(valueAnswer)
    const tokenValueValidation = validateNumber(value)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }

    token.value = value
  }

  if (editOption === 'decreaseValue') {
    const askTokenDecreaseValueText = ':chart_with_downwards_trend: Quantos pontos esse token vai passar a valer menos a cada resgate?'
    const { content: decreaseValueText } = await askAndWait(askTokenDecreaseValueText, message)
    if (!decreaseValueText) return {}

    const decreaseValue = Number(decreaseValueText)
    const tokenDecreaseValueValidation = validateNumber(decreaseValue)
    if (!tokenDecreaseValueValidation.valid) {
      return message.channel.send(tokenDecreaseValueValidation.message)
    }

    token.decreaseValue = decreaseValue
  }

  if (editOption === 'minimumValue') {
    const askTokenMinimumValueText = ':third_place: Qual o novo valor mínimo para os pontos?'
    const { content: minimumValueAnswer } = await askAndWait(askTokenMinimumValueText, message)
    if (!minimumValueAnswer) return {}

    const minimumValue = Number(minimumValueAnswer)
    const tokenMinimumValueValidation = validateNumber(minimumValue)
    if (!tokenMinimumValueValidation.valid) {
      return message.channel.send(tokenMinimumValueValidation.message)
    }

    token.minimumValue = minimumValue
  }

  if (editOption === 'totalClaims') {
    const askTokenTotalClaimsText = ':busts_in_silhouette: Qual o novo limite de usos?'
    const { content: totalClaimsAnswer } = await askAndWait(askTokenTotalClaimsText, message)
    if (!totalClaimsAnswer) return {}

    const totalClaims = Number(totalClaimsAnswer)
    const tokenValueValidation = validateNumber(totalClaims)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }

    token.totalClaims = totalClaims
  }

  if (editOption === 'expireAt') {
    const askExpireDateText = ':date: Qual a nova data limite? (`DD/MM/AA HH:MM` em GMT -3)'
    const { content: expireDateAnswer } = await askAndWait(askExpireDateText, message)
    if (!expireDateAnswer) return {}

    const tokenValueValidation = validateAnswerDate(expireDateAnswer)
    if (!tokenValueValidation.valid) {
      return message.channel.send(tokenValueValidation.message)
    }

    const mmddyyDate = expireDateAnswer.replace(/(.*?)\/(.*?)\//, '$2/$1/')
    const utcDate = new Date(mmddyyDate)
    const expireDate = utcDate.toISOString()
    token.expireAt = expireDate
  }

  const updatedTokenEmbed = mountTokenEmbed(token)
  await message.channel.send({ embed: updatedTokenEmbed })
  const tokenCreateConfirmationMessage = 'Ficou assim, ó. Confirma a atualização desse token?'
  const { content: tokenCreateConfirmation } = await askAndWait(tokenCreateConfirmationMessage, message)

  if (!isNegativeAnswer(tokenCreateConfirmation)) {
    return token
  }

  message.channel.send('Vish, beleza. Quando quiser tentar de novo é só mandar o mesmo comando.')
  return {}
}
