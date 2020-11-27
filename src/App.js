import client from './client'
import { ApolloProvider } from 'react-apollo'
import { SEARCH_REPOSITORIES } from "./graphql";
import { Query } from "react-apollo";
import { useState } from "react";


const StarButton = (props) => {

  const totalCount = props.node.stargazers.totalCount

  return (
    <button>
      {totalCount === 1 ? "1 star" : `${totalCount} stars`}
    </button>
  )

}


function App() {

  const PER_PAGE = 5

  const [DEFAULT_STATE, handleChange] = useState({
    first: PER_PAGE,
    after: null,
    last: null,
    before: null,
    query: "フロントエンドエンジニア"
  });

  const setQueryWrap = (e) => {
    const queryValue = e.target.value
    handleChange({
      ...DEFAULT_STATE,
      query: queryValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const goNext = (search, query) => {
    handleChange({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null,
      query: query
    });
  }

  const goPrevious = (search, query) => {
    handleChange({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
      query: query
    });
  }

  const { query, first, last, before, after } = DEFAULT_STATE;

  console.log(query)
  return (
    <ApolloProvider client={client}>
      <form onSubmit={handleSubmit}>
        <input value={query} onChange={setQueryWrap} />
      </form>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {
          ({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error... ${error.message}`
            console.log({ data })

            const search = data.search
            const repositoryCount = search.repositoryCount
            const repositoryUnit = repositoryCount === 1 ? 'Repository' : "Repositories"
            const title = `GitHub repositories Search Results - ${repositoryCount} ${repositoryUnit}`
            return (
              <>
                <h2>{title}</h2>
                <ul>
                  {
                    search.edges.map((edge) => {
                      const node = edge.node
                      return (
                        <li key={node.id}>
                          <a href={node.url} target="_blank" rel="noreferrer">{node.name}</a>
                          &nbsp;
                          <StarButton node={node} />
                        </li>
                      )
                    })
                  }
                </ul>
                {console.log(search.pageInfo)}
                {
                  search.pageInfo.hasPreviousPage === true ?
                    <button
                      onClick={() => goPrevious(search, query)}
                    >
                      Previous
                    </button> :
                    null
                }
                {
                  search.pageInfo.hasNextPage === true ?
                    <button
                      onClick={() => goNext(search, query)}
                    >
                      Next
                    </button> :
                    null
                }
              </>
            )
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
