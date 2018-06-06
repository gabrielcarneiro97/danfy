import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import PropTypes from 'prop-types';

import { MainMenu, ImportarNotas, VisualizarMovimento } from '.';

const { Content, Sider } = Layout;


function MainLogged({ match }) {
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

            <Redirect from="/app" to={`${match.url}/importar`} />
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
}

MainLogged.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
};

export default MainLogged;
