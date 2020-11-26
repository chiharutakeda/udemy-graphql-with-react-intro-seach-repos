import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;
console.log(GITHUB_TOKEN);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
