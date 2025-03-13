require('dotenv').config()
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const JWT_SECRET = process.env.JWT_SECRET
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()



const resolvers = {
  Mutation:{
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      console.log('user at edit author', currentUser)
      
      if (!currentUser) { throw new GraphQLError('not authenticated',
        { 
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        }
      )}
      
      console.log('Adding book', args)
      let authorInDB = await Author.findOne({ name: args.author })
      if (!authorInDB) {
        console.log('Author not in DB')
        const newAuthor = new Author({ name: args.author })
        try {
          await newAuthor.save()
        } catch (error) {
          console.log('Error saving author')
          
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error
            }
          })
        }
        authorInDB = newAuthor
        console.log('created author', authorInDB)
      } else { console.log('Author found in DB') }

      const book = new Book({ ...args, author: authorInDB._id })
      console.log('tallennetaan kirja')
      
      try {
        await book.save()
      } catch (error) {
        console.log('Error saving book')
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      await book.populate('author')
      
      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, {name, setBornTo}, context) => {
      // TODO: require token
      const currentUser = context.currentUser
      console.log('user at edit author', currentUser)
      
      if (!currentUser) { throw new GraphQLError('not authenticated',
        { 
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        }
      )}

      console.log(`editAuthor(name=${name} setBornTo=${setBornTo})`)
      const author = await Author.findOne({ name })
      author.born = setBornTo
      return  author.save()
    },

    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre })
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: username,
              error
            }
          })
        })
    },
    login: async (root, {username, password}) => {
      console.log('login', username)
      
      const user = await User.findOne({ username })
      
      if ( !user || password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      const userForToken = {
        username,
        id: user._id
      }

      const token = { value: jwt.sign(userForToken, JWT_SECRET)}
      return token
    },
  },
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log('allBooks', args)
      const filter = {}
      const authorName = args.author
      if (authorName) {
        const author = await Author.findOne({ name: authorName })
        if (author) filter.author = author._id
      }
      if (args.genre) filter.genres = args.genre
      const result = await Book.find(filter).populate('author')
      return  result
    },
    allAuthors: async () => Author.find({}),
    me: async (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: async ({ _id }) => {
      const allAuthorsBooks = await Book.find({ author: _id })
      return allAuthorsBooks.length
    } 
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
    },
  },
}

module.exports = resolvers