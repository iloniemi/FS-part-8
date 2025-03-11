const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
const { GraphQLError } = require('graphql')
require('dotenv').config()
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET


let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB', error.message))

const typeDefs = `
type Book {
  title: String!
  published: Int
  author: Author!
  id: ID!
  genres: [String]
}
type Author {
  name: String!
  id: ID!
  born: Int
  bookCount: Int
}
type Query {
  bookCount: Int
  authorCount: Int
  allBooks(author: String, genre: String): [Book]!
  allAuthors: [Author]

  me: User
}
type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String]!
  ): Book
  editAuthor(name: String!, setBornTo: Int!): Author

  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}
type Token {
  value: String!
}
`

const testFunction = async () => {
  const args = { author: "Mika Waltari" }
  let authorInDB = await Author.findOne({ name: args.author })
      if (!authorInDB) {
        console.log('Ei loytyn')
        
        authorInDB = await new Author({ name: args.author }).save()
  }
  console.log('author', authorInDB)
  
  //const author = new Author({ name: "Reijo Mäki" }).save()
  //console.log('finding')
  
  //const foundAuthor = await Author.findOne({ name: "Reijdo Mäki" })
  //console.log('found', foundAuthor)
}
//testFunction()

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
      return  Book.find(filter)
    },
    allAuthors: async () => Author.find({}),
    me: async (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: async ({ _id }) => {
      const allAuthorsBooks = await Book.find({ author: _id })
      return allAuthorsBooks.length
    } 
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    //console.log('Kontekstissa')
    if (!req.headers.authorization) return
    //console.log('auth', req.headers.authorization)

    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      console.log('finding user in context')
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
