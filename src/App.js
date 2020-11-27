import client from './client'
import { ApolloProvider } from 'react-apollo'
import {SEARCH_REPOSITORIES} from "./graphql";
import { Query } from "react-apollo";
import {useState} from "react";


function App() {

  const [DEFAULT_STATE,handleChange] = useState({
    first: 5,
    after: null,
    last: null,
    before: null,
    query: "フロントエンドエンジニア"
  });
  
  const setQueryWrap = (e) => {
      const queryValue = e.target.value
      handleChange({
        ...DEFAULT_STATE,
        query:queryValue
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault()
  }
  
  const {query,first,last,before,after} = DEFAULT_STATE;
  
  console.log(query)
  return (
    <ApolloProvider client={client}>
      <form onSubmit={handleSubmit}>
        <input value={query} onChange={setQueryWrap}/>
      </form>
      <Query 
        query={SEARCH_REPOSITORIES}
        variables= {{query,first,last,before,after}}
      >
        {
          ({loading,error,data})=>{
            if(loading) return 'Loading...'
            if(error) return `Error... ${error.message}`
            console.log({data})

            const search = data.search
            const repositoryCount = search.repositoryCount
            const repositoryUnit = repositoryCount === 1 ? 'Repository':"Repositories"
            const title = `GitHub repositories Search Results - ${repositoryCount} ${repositoryUnit}`
            return <h2>{title}</h2>
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
