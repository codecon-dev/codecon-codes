import { downloadFile } from '../../utils/files'
import { askTokenImport } from '../../utils/wizards/askTokenImport'
import { handleMessageError } from '../../utils/handleError'
import { Message } from 'discord.js'
import csv from 'csv-parser'
import fs from 'fs'

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

    await downloadFile(csvUrl, 'data/tokenscsv.csv')
    const results = []

    fs.createReadStream('data/tokenscsv.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(results)
      })

    return message.channel.send('Token atualizado!')
  } catch (error) {
    message.channel.send('Dang, something went very wrong. Try asking for help. Anyone?')
    handleMessageError(error, message)
  }
}
