import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import UpdateAuthor from "./components/UpdateAuthor";
import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import { useUserValue, useUserDispatch, userActionCreator } from "./UserContext";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const user = useUserValue()
  const userDispatch = useUserDispatch()

  useEffect(() => {
    const savedUserJSON = window.localStorage.getItem('loggedInLibraryUser')
    if (savedUserJSON) {
      const savedUser = JSON.parse(savedUserJSON)
      userDispatch(userActionCreator.set(savedUser))
    }
  },[])


  const logout = () => {
    userDispatch(userActionCreator.reset())
    window.localStorage.removeItem('loggedInLibraryUser')
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
    <BrowserRouter>
      <Notify errorMessage={errorMessage}/>
      <div>
        <div>
          <Link to='/authors' style={padding}>authors</Link>
          <Link to='/books' style={padding}>books</Link>
          { !user && <Link to='/login' style={padding}>login</Link> }
          { user && <Link to='/addbook' style={padding}>add book</Link> }
          { user && <Link to='/update-author' style={padding}>update author</Link> }
          { user && <span>logged in as {user.username} </span>}
          { user && <button onClick={logout}>logout</button>}
        </div>
        <Routes>
          <Route path='/' element={<h1>Library app</h1>} />
          <Route path='/authors' element={<Authors/>} />
          <Route path='/books' element={<Books />} />
          <Route path='/addbook' element={<NewBook setError={notify}/>} />
          <Route path='/update-author' element={<UpdateAuthor setError={notify} />} />
          <Route path='/login' element={<LoginForm setError={notify} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const Notify = ({ errorMessage }) => {
  if ( !errorMessage ) { return null }
  return (
    <div style={{color: 'red'}}>{errorMessage}
    </div>
  )}

export default App;
