import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './_components/App';
import { history } from './_helpers/history';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter history={history}>
    <Routes>
      <Route path = "/" element={<App />}></Route>
    </Routes>
  </BrowserRouter>
);