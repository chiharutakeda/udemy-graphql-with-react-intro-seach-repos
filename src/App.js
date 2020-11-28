import client from './client'
import { REMOVE_STAR, ADD_STAR, SEARCH_REPOSITORIES } from "./graphql";
import { Mutation, Query, ApolloProvider } from "react-apollo";
import { useState } from "react";


const StarButton = (props) => {
  const { node, query, first, last, before, after } = props
  const viewerHasStarred = node.viewerHasStarred
  const totalCount = props.node.stargazers.totalCount
  const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`

  const StarStatus = ({ addOrRemoveStar }) => {
    return (
      <button
        onClick={
          //ここで引数を渡して初めてmutationが実行される
          () => addOrRemoveStar({
            variables: { input: { starrableId: node.id } },
            //mutation実行後呼ばれる関数を登録できる
            update:(store,{data:{addStar,removeStar}}) => {
              const {starrable} = addStar || removeStar
              console.log({starrable})
              const data = store.readQuery({
                query: SEARCH_REPOSITORIES,
                variables:{query,first,last,after,before}
              })
              const edges = data.search.edges
              const newEdges = edges.map(edge=>{
                if(edge.node.id===node.id){
                  const totalCount = edge.node.stargazers.totalCount
                  // const diff = viewerHasStarred ? -1:1
                  const diff = starrable.viewerHasStarred ? 1:-1
                  const newTotalCount = totalCount + diff
                  edge.node.stargazers.totalCount = newTotalCount
                }
                return edge
              })
              data.search.edges = newEdges
              store.writeQuery({query:SEARCH_REPOSITORIES,data})
            }
          })
        }
      >
        {starCount} | {viewerHasStarred ? "starred" : "-"}
      </button>
    )
  }

  return (
    //実行できる形にしてmutation渡す
    <Mutation
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
    >
      {
        //コールバック関数で名前をつけたmutationを引数にとれる
        (addOrRemoveStar) => <StarStatus addOrRemoveStar={addOrRemoveStar} />
      }
    </Mutation>
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
    //どこのgraphQLサーバーにクエリをなげるかを決める。この中でquery,mutationwを使う
    //おそらくレンダリングの時に毎回クエリ投げてる
    <ApolloProvider client={client}>
      <form onSubmit={handleSubmit}>
        <input value={query} onChange={setQueryWrap} />
      </form>
      {/* クエリを投げる */}
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {
          //コールバック関数内で投げたクエリの結果が使えるようになる
          ({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error... ${error.message}`
            console.log({ data })
            //受け取ったクエリの結果からjsxを作成できる
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
                          <StarButton node={node} {...{ query, first, last, after, before }} />
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
