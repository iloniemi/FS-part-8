import { useMutation } from "@apollo/client"
import { useEffect, useState } from "react"
import { LOGIN, ME } from "../queries"
import { useNavigate } from "react-router-dom"

const LoginForm = ({setError, setToken}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  
  const [login, result] = useMutation(LOGIN,
    {
      onError: (error) => { 
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        setError(messages)
      },
      refetchQueries: [{ query: ME }],
    }
  )

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      navigate('/')
    }
  }, [result.data])

  const handleSubmit = async (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
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