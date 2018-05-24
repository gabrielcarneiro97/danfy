import * as React from 'react';
import { BrowserRouter, /* Route, */ Switch } from 'react-router-dom';
import { Layout } from 'antd';
import moment from 'moment';

import 'moment/locale/pt-br';
import 'antd/dist/antd.css';

import { PrivateRoute, MainLogged } from './components';

moment.locale('pt-br');

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <PrivateRoute path="/app" component={MainLogged} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
