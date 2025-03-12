import { useQuery } from "@apollo/client"
import { BOOKS_OF_GENRE } from "../queries"
import { useState } from "react"


const Books = () => {
  const [chosenGenre, setChosenGenre] = useState(null)
  const booksResult = useQuery(BOOKS_OF_GENRE,
    {
      variables: { genre: chosenGenre }
    }
  )

  if (booksResult.loading || !booksResult.data) return <div>Loading books</div>
  const books = booksResult.data.allBooks
  const genres = books.reduce((genreSet, book) => {
    book.genres.forEach(genre => genreSet.add(genre))
    return genreSet
  }, new Set())
  
  const handleClick = (genre) => () => setChosenGenre(genre)

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        { !chosenGenre && genres.values().toArray().map(genre => (
          <button key={genre} onClickCapture={handleClick(genre)} >
            {genre}
          </button>))
        }
        {chosenGenre && <button onClick={() => setChosenGenre(null)}>all genres</button>}
      </div>
    </div>
  )
}

export default Books
