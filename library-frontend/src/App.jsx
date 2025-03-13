import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import UpdateAuthor from "./components/UpdateAuthor";
import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import { useApolloClient, useSubscription } from "@apollo/client";
import Recommended from "./components/Recommended";
import { BOOK_ADDED, BOOKS_OF_GENRE } from "./queries";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const navigate = useNavigate()

  useEffect(() => {
    const tokenInMemory = localStorage.getItem('library-user-token')
    if (tokenInMemory) setToken(tokenInMemory)
  }, [])

  useSubscription(BOOK_ADDED, {
    onData: ({data}) => {
      notify(`book added: ${data.data.bookAdded.title}`)
      client.refetchQueries({ // This is the proper way to refetch queries
        include: ['genreBooks'],
      })
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    navigate('/')
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)  }

  const padding = {
    padding: 5
  }
  return (
    <div>
      <Notify errorMessage={errorMessage}/>
      <div>
        <div>
          <Link to='/' style={padding}>home</Link>
          <Link to='/authors' style={padding}>authors</Link>
          <Link to='/books' style={padding}>books</Link>
          { token && <Link to='/addbook' style={padding}>add book</Link> }
          { token && <Link to='/update-author' style={padding}>update author</Link> }
          { token && <Link to='/recommend' style={padding}>recommend</Link> }
          { token && <button onClick={logout}>logout</button>}
          { !token && <Link to='/login' style={padding}>login</Link> }
        </div>
        <Routes>
          <Route path='/' element={<h1>Library app</h1>} />
          <Route path='/authors' element={<Authors/>} />
          <Route path='/books' element={<Books />} />
          <Route path='/addbook' element={<NewBook setError={notify}/>} />
          <Route path='/update-author' element={<UpdateAuthor setError={notify} />} />
          <Route path='/login' element={<LoginForm setError={notify} setToken={setToken} />} />
          <Route path='/recommend' element={<Recommended />} />
        </Routes>
      </div>
    </div>
  );
};

const Notify = ({ errorMessage }) => {
  if ( !errorMessage ) { return null }
  return (
    <div style={{color: 'red'}}>{errorMessage}
    </div>
  )}

export default App;
