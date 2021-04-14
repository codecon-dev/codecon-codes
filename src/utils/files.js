import parseCsv from 'csv-parser'
import fetch from 'node-fetch'
import fs from 'fs'

/**
 * Open file.
 *
 * @param {string} path
 * @returns {any}
 */
export function openFile (path) {
  try {
    const file = fs.readFileSync(path)
    return JSON.parse(file)
  } catch (err) {
    console.error(err)
  }
}

/**
 * Write some data into file.
 *
 * @param {any} data
 * @param {string} path
 */
export function saveFile (data, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  } catch (err) {
    console.error(err)
  }
}

/**
 * Download a file from URL into path.
 *
 * @param {string} url
 * @param {string} path
 * @returns {Promise}
 */
export async function downloadFile (url, path) {
  const res = await fetch(url)
  const fileStream = fs.createWriteStream(path)
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream)
    res.body.on('error', reject)
    fileStream.on('finish', resolve)
  })
}

/**
 * Read tokens from CSV file path and map them to their expected format.
 *
 * @param {string} csvFilePath
 * @param {string} author
 * @returns {Promise<import('./token').Token>}
 */
export async function readAndMapCsvTokens (csvFilePath, author) {
  return new Promise((resolve, reject) => {
    const tokens = []
    fs.createReadStream(csvFilePath)
      .pipe(parseCsv())
      .on('data', (data) => {
        const mmddyyDate = data['Data de expiração'].replace(/(.*?)\/(.*?)\//, '$2/$1/')
        const utcDate = new Date(mmddyyDate)
        const expireDate = utcDate.toISOString()

        const totalClaims = Number(data['Número máximo de resgates'])
        const now = new Date(Date.now())
        const createdAt = now.toISOString()

        return tokens.push({
          code: data.Token,
          description: data['Descrição'],
          value: Number(data.Pontos),
          decreaseValue: Number(data['Quanto pontos diminui por resgate']),
          minimumValue: Number(data['Pontos mínimos de resgate']),
          totalClaims: totalClaims,
          remainingClaims: totalClaims,
          expireAt: expireDate,
          createdAt,
          createdBy: author
        })
      })
      .on('end', async () => {
        console.log('File read with success')
        resolve(tokens)
      })
  })
}
