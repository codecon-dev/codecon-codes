import { askAndWait } from '../../utils/message'
import { Message, MessageAttachment } from 'discord.js'

/**
 * Get csv file url with tokens to import.
 *
 * @param { Message } message
 * @returns {string} Attachment url.
 */
export async function askTokenImport (message) {
  const imageAttachment = new MessageAttachment(process.env.CSV_EXAMPLE_URL)
  message.channel.send(imageAttachment)

  const askTokenCodeText = 'Fala, meu bom. Manda aí o arquivo .CSV no formato como no exemplo'
  const { attachments } = await askAndWait(askTokenCodeText, message)

  if (!attachments || !attachments.size) {
    const notFoundAttachmentMessage = 'Opa, faltou anexar um arquivo aí'
    return message.channel.send(notFoundAttachmentMessage)
  }

  const userAttachment = attachments.first()
  const userAttachmentUrl = userAttachment.url
  const hasCSVType = userAttachmentUrl.includes('.csv')
  if (!hasCSVType) {
    const wrongFileTypeMessage = 'Precisa ser um arquivo CSV, fera.'
    return message.channel.send(wrongFileTypeMessage)
  }

  return userAttachmentUrl
}
