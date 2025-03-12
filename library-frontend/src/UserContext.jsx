import { createContext, useContext, useReducer } from "react"

const reducer = (state, action) => {
  switch (action.type) {
  case 'SET_USER':
    return action.payload
  case 'RESET_USER':
    return undefined
  default: return state
  }
}

const UserContext = createContext()

export const UserContextProvider = (props) => {
  const [user, userDispatch] = useReducer(reducer, undefined)
  return (<UserContext.Provider value={[user, userDispatch]}>
    {props.children}
  </UserContext.Provider>)
}

export const useUserValue = () => {
  const valueAndDispatch = useContext(UserContext)
  return valueAndDispatch[0]
}

export const useUserDispatch = () => {
  const valueAndDispatch = useContext(UserContext)
  return valueAndDispatch[1]
}

export const userActionCreator = {
  reset: () => ({ type: 'RESET_USER' }),
  set: (newUser) => ({ type: 'SET_USER' , payload: newUser })
}

export default UserContext