import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { history } from '../_helpers/history';

import HomePage from './HomePage';

class App extends React.Component {

  render() {
    return (
      <BrowserRouter history={history}>
      <Routes>
        <Route path = "/" element={<HomePage />}></Route>
      </Routes>
    </BrowserRouter>
    );
  }
}

export default App;
