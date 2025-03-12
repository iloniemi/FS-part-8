import { useMutation, useQuery } from "@apollo/client"
import { AUTHORS, UPDATE_AUTHOR } from "../queries"
import { useState } from "react"


const UpdateAuthor = ({ setError }) => {
  const [year, setYear] = useState('')
  const [authorSelected, setAuthorSelected] = useState('')
  const authorsResult = useQuery(AUTHORS)
  const [updateAuthor] = useMutation(UPDATE_AUTHOR,
    { 
      update: (cache, response) => { // For some reason  allAuthors already has the correct birthyear...
        cache.updateQuery({ query: AUTHORS }, ({ allAuthors }) => {
          const updatedAuthor = response.data.editAuthor
          return {
            allAuthors: allAuthors.map(author =>
              author.id !== updatedAuthor.id ? author : {...author, born: updatedAuthor.born})
          }
        })
      },
      //refetchQueries: [{ query: AUTHORS }],
      onError: (error) => { 
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        setError(messages)
      },
    }
  )
  if (authorsResult.loading) return <div>Loading list of authors</div>
  const authors = authorsResult.data.allAuthors

  const onSubmit = async (event) => {
    event.preventDefault()
    if (authorSelected === '' || year==='') return
    const response = await updateAuthor({ variables: {
      name: authorSelected, setBornTo: parseInt(year)
    }})
    console.log('response', response);
    
  }
  return(
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={onSubmit}>
        <div name='authorDiv'>
          author
          <select value={authorSelected} onChange={(event => setAuthorSelected(event.target.value))}>
            <option disabled value=''>Choose author</option>
            { authors.map(author => <option key={author.id} value={author.name}>{author.name}</option>) }
          </select>
        </div>
        <div>
          birthyear
          <input
            type="number"
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <div>
          <button>update author</button>
        </div>
      </form>
    </div>
  )
}

export default UpdateAuthor