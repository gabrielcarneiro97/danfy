import React from 'react';
import {
  Route, Switch, Redirect, useRouteMatch,
} from 'react-router-dom';
import { Layout } from 'antd';

import MainMenu from './MainMenu';
import ImportarNotas from './ImportarNotas';
import VisualizarMovimento from './VisualizarMovimento';
import VisualizarEstoque from './VisualizarEstoque';
import GerenciarClientes from './GerenciarClientes';

const { Content, Sider } = Layout;

function MainLogged() : JSX.Element {
  const match = useRouteMatch();

  return (
    <Layout>
      <Sider width={230}>
        <MainMenu />
      </Sider>
      <Layout>
        <Content
          style={{
            background: '#ff100',
            padding: 24,
            margin: 0,
            minHeight: window.innerHeight - 64,
          }}
        >
          <Switch>
            <Route exact path={`${match.path}/importar`} component={ImportarNotas} />
            <Route exact path={`${match.path}/visualizar`} component={VisualizarMovimento} />
            <Route exact path={`${match.path}/estoque`} component={VisualizarEstoque} />
            <Route exact path={`${match.path}/clientes`} component={GerenciarClientes} />

            <Redirect from="/app" to={`${match.url}/importar`} />
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLogged;
