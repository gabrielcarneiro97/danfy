import * as React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Layout } from 'antd';
import PrintProvider, { NoPrint } from 'react-easy-print';
import moment from 'moment';

import 'moment/locale/pt-br';
import 'antd/dist/antd.css';

import {
  PrivateRoute,
  MainLogged,
  Login,
  Navbar,
} from './components';

const { Header } = Layout;

moment.locale('pt-br');

function Main() {
  return <Redirect to="/login" />;
}

function App() {
  return (
    <>
      <PrintProvider>
        <NoPrint>
          <BrowserRouter>
            <Layout>
              <Header>
                <Navbar />
              </Header>
              <Switch>
                <Route exact path="/" component={Main} />
                <Route exact path="/login" component={Login} />
                <PrivateRoute path="/app" component={MainLogged} />
              </Switch>
            </Layout>
          </BrowserRouter>
        </NoPrint>
      </PrintProvider>
    </>
  );
}

export default App;
