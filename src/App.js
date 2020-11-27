import client from './client'
import { ApolloProvider } from 'react-apollo'
import {SEARCH_REPOSITORIES} from "./graphql";
import { Query } from "react-apollo";
import {useState} from "react";


function App() {

  const [VARIABLES] = useState({
    first: 5,
    after: null,
    last: null,
    before: null,
    query: "フロントエンドエンジニア"
  });
  
  const {query,first,last,before,after} = VARIABLES;
  
  return (
    <ApolloProvider client={client}>
      <Query 
        query={SEARCH_REPOSITORIES}
        variables= {{query,first,last,before,after}}
      >
        {
          ({loading,error,data})=>{
            if(loading) return 'Loading...'
            if(error) return `Error... ${error.message}`
            console.log({data})
            return <div></div>
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
