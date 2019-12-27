import React from 'react';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { Layout } from 'antd';
import moment from 'moment';

import 'moment/locale/pt-br';
import 'antd/dist/antd.css';

import PrivateRoute from './components/PrivateRoute';
import MainLogged from './components/MainLogged';
import Login from './components/Login';
import Navbar from './components/Navbar';

const { Header } = Layout;

moment.locale('pt-br');

function Main() {
  return <Redirect to="/login" />;
}

function App() {
  return (
    <>
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
    </>
  );
}

export default App;
