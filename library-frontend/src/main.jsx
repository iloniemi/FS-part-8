import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { UserContextProvider } from "./UserContext";

const apolloclient = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserContextProvider>
      <ApolloProvider client={apolloclient}>
        <App />
      </ApolloProvider>
    </UserContextProvider>
  </React.StrictMode>
);
