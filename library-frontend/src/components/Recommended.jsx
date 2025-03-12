import { useQuery } from "@apollo/client"
import { BOOKS_OF_GENRE, ME } from "../queries"
import { useEffect, useState } from "react"

const Recommended = () =>{
  const meResult = useQuery(ME, { fetchPolicy: 'no-cache' } )
  const [favoriteGenre, setFavoriteGenre] = useState('null')
  const booksResult = useQuery(BOOKS_OF_GENRE, {
    variables: { genre: favoriteGenre }
  })

  useEffect(() => {
    console.log('meResult', meResult);
    
    if ( !meResult.data || !meResult.data.me ) return
    setFavoriteGenre(meResult.data.me.favoriteGenre)
  }, [ meResult.data ])

  if (meResult.loading ) return <div>loading your data</div>
  if (!meResult.data) return <div>log in to see recommendations</div>
  if (booksResult.loading) return <div>loading recommendations</div>

  const books = booksResult.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>
      <div>books in your  favourite genre {favoriteGenre}</div>
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
      <div></div>
    </div>
  )
} 
  

export default Recommended