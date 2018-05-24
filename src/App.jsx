import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import moment from 'moment';

import 'moment/locale/pt-br';
import 'antd/dist/antd.css';

import { PrivateRoute, MainLogged, Login } from './components';

moment.locale('pt-br');

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/login" component={Login} />
          <PrivateRoute path="/app" component={MainLogged} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
