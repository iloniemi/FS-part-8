import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import UpdateAuthor from "./components/UpdateAuthor";
import { useState } from "react";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)

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
          <Link to='/addbook' style={padding}>add book</Link>
          <Link to='/update-author' style={padding}>update author</Link>
        </div>
        <Routes>
          <Route path='/authors' element={<Authors/>} />
          <Route path='/books' element={<Books />} />
          <Route path='/addbook' element={<NewBook setError={notify}/>} />
          <Route path='/update-author' element={<UpdateAuthor setError={notify} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const Notify = ({errorMessage}) => {
  if ( !errorMessage ) { return null }
  return (
    <div style={{color: 'red'}}>{errorMessage}
    </div>
  )}

export default App;
