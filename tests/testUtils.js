/**
 * Mocks a channel message to match properties from a Discord Message.
 * Note that channel messages has actually Collection type and here we're treating them
 * as arrays and enriching their properties to have the same as a Discord Collection.
 *
 * @param {string} content
 * @param {object[]} channelMessages
 * @returns {object}
 */
export function mockMessage (content, channelMessages = []) {
  channelMessages.forEach(channelMessages => { channelMessages.edit = jest.fn(message => message) })
  channelMessages.nativeFilter = channelMessages.filter
  channelMessages.filter = (func) => {
    const filtered = channelMessages.nativeFilter(func)
    filtered.first = () => filtered[0]
    filtered.size = filtered.length
    return filtered
  }
  return {
    react: jest.fn(() => ({
      remove: jest.fn(),
      message: {
        channel: {
          type: 'text'
        }
      }
    })),
    content: content,
    channel: {
      send: jest.fn(message => {
        if (typeof message === 'object') {
          message.react = jest.fn()
        }
        return message
      })
    },
    author: {
      id: 111,
      username: 'Mark'
    },
    guild: {
      id: 100,
      name: 'GuildName',
      channels: {
        cache: [
          {
            messages: {
              fetch: jest.fn().mockResolvedValue(channelMessages)
            },
            send: jest.fn(message => {
              message.react = jest.fn()
              return message
            })
          }
        ]
      }
    }
  }
}

/**
 * Mock the answers that the user provides to askAndWait function.
 *
 * @param {Function} askAndWaitFunction
 * @param {string[] }answers
 */
export function mockUserAnswers (askAndWaitFunction, answers) {
  answers.forEach(answer => {
    askAndWaitFunction.mockResolvedValueOnce({
      content: answer
    })
  })
}
