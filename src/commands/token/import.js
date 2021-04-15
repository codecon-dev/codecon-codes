import { downloadFile, readAndMapCsvTokens } from '../../utils/files'
import { removeOrUpdateReaction } from '../../utils/message'
import { askTokenImport } from '../../utils/wizards/askTokenImport'
import { handleMessageError } from '../../utils/handleError'
import { createDatabaseToken } from '../../utils/token'
import { Message } from 'discord.js'

/**
 * Create a party message on the parties channel.
 *
 * @param {Message} message
 * @returns {undefined}
 */
export async function importToken (message) {
  try {
    const csvUrl = await askTokenImport(message)
    if (!csvUrl || typeof csvUrl !== 'string') {
      return
    }

    const processingText = 'Boa, agora pera aí enquanto eu processo tudo...'
    const processingMessage = await message.channel.send(processingText)

    const awaitReaction = await processingMessage.react('⏳')
    const csvFilePath = 'data/tokenscsv.csv'
    await downloadFile(csvUrl, csvFilePath)
    const tokens = await readAndMapCsvTokens(csvFilePath, message.author.tag)

    const failedTokens = []
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index]
      const success = await createDatabaseToken(token)
      if (!success) {
        failedTokens.push(token.code)
        console.log(`Token ${token.code} deu ruim =/`)
        continue
      }
      console.log(`Token ${token.code} criado!`)
    }

    await removeOrUpdateReaction(awaitReaction, true)
    return message.channel.send(`Dos ${tokens.length} tokens, ${failedTokens.length} deram ruim: ${failedTokens.join(', ')}`)
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
