import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Layout } from 'antd';
import PropTypes from 'prop-types';

import { MainMenu, ImportarNotas } from '.';

const { Content, Sider } = Layout;

function Moc2() {
  return <h1>M2</h1>;
}

function MainLogged({ match }) {
  return (
    <Layout>
      <Sider>
        <MainMenu />
      </Sider>
      <Layout>
        <Content
          style={{
              background: '#ff100',
              padding: 24,
              margin: 0,
            }}
        >
          <Switch>
            <Route exact path={`${match.path}/importar`} component={ImportarNotas} />
            <Route exact path={`${match.path}/moc2`} component={Moc2} />

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
