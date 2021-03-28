/* istanbul ignore file */
import mongoose from 'mongoose'
import TokenModel from '../models/token'
import { Token } from './token'

/**
 * Connects mongoose to remote MongoDB.
 *
 * @returns {Promise<void>}
 */
export async function connectMongoose () {
  try {
    if (mongoose.connection.readyState === 0) {
      const mongoAddress = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`
      return mongoose.connect(mongoAddress, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * Disconnects mongoose from remote MongoDB.
 *
 * @returns {Promise<void>}
 */
export async function disconnectMongoose () {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.disconnect()
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * Update or create a token.
 *
 * @param {string} tokenCode
 * @param {Token} tokenContent
 * @returns {Promise<TokenModel>}
 */
export async function createOrUpdateToken (tokenCode, tokenContent) {
  try {
    await connectMongoose()
    const token = await TokenModel.findOneAndUpdate({ code: tokenCode }, tokenContent, {
      new: true,
      upsert: true
    })
    await token.save()
    await disconnectMongoose()
    return token
  } catch (error) {
    console.log(error)
  }
}

/**
 * Get a token from DB.
 *
 * @param {string} tokenCode
 * @returns {Promise<TokenModel|null>}
 */
export async function getTokenFromMongo (tokenCode) {
  try {
    await connectMongoose()
    const [token] = await TokenModel.find({ code: tokenCode }).lean()
    if (!token) {
      return null
    }
    delete token._id
    delete token.__v
    delete token.id
    await disconnectMongoose()
    return token
  } catch (error) {
    console.log(error)
  }
}

/**
 * Get all guilds config.
 *
 * @returns {Promise<TokenModel[]>}
 */
export async function getTokensFromMongo () {
  try {
    await connectMongoose()
    const allTokens = await TokenModel.find({})
    await disconnectMongoose()
    return allTokens
  } catch (error) {
    console.log(error)
  }
}
