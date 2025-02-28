import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './index.css'
import Store from './Redux/Slices/Store.js'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n.js';
import reportWebVitals from './reportWebVitals.js'
import { Provider } from 'react-redux'

const root =ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
      <Provider store={Store}>
      <I18nextProvider i18n={i18n}>
    <App />
    </I18nextProvider>
     </Provider>
  </React.StrictMode>,
)
reportWebVitals();
