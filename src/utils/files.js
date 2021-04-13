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
