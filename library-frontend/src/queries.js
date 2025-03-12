import { gql } from '@apollo/client'

export const AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      bookCount
      born
      name
      id
    }
  }
`
export const BOOKS = gql`
  query AllBooks {
    allBooks {
      id
      published
      title
      author {
        name
        id
        born
      }
    }
  }
`

export const CREATE_BOOK = gql`
mutation addNewBook($title: String!, $author: String!, $published: Int!, $genres: [String]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
      author
      genres
      id
      published
      title
    }
}
`

export const UPDATE_AUTHOR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      id
      born
      name
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    value
  }
}
`