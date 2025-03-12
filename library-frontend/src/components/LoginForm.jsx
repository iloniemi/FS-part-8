import { useMutation } from "@apollo/client"
import { useState } from "react"
import { LOGIN } from "../queries"
import { userActionCreator, useUserDispatch } from "../UserContext"
import { useNavigate } from "react-router-dom"

const LoginForm = ({setError}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const userDispatch = useUserDispatch()
  const navigate = useNavigate()
  
  const [login] = useMutation(LOGIN,
    {
      onError: (error) => { 
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        setError(messages)
      }
    }
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('log in attempt', username)
    const loginResult = await login({ variables: { username, password } })
    if (!(loginResult.data && loginResult.data.login && loginResult.data.login.value)) return
    const tokenValue = loginResult.data.login.value
    console.log('token', tokenValue)
    const newUser = {
      username,
      token: `Bearer ${tokenValue}`
    }
    const action = userActionCreator.set(newUser)
    userDispatch(action)
    window.localStorage.setItem(
      'loggedInLibraryUser', JSON.stringify(newUser)
    )
    setUsername('')
    setPassword('')
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        username
        <input value={username} onChange={event => setUsername(event.target.value)} />
      </div>
      <div>
        password
        <input value={password} type='password' onChange={event => setPassword(event.target.value)} />
      </div>
      <div>
        <button>login</button>
      </div>
    </form>
  )
}


export default LoginForm