import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Layout } from 'antd';

const { Content, Sider } = Layout;

function Moc1() {
  return <h1>M1</h1>;
}

function Moc2() {
  return <h1>M2</h1>;
}

function MainLogged({ match }) { // eslint-disable-line
  return (
    <Layout>
      <Sider style={{ background: '#fff' }} collapsed />
      <Layout>
        <Content
          style={{
              background: '#ff100',
              padding: 24,
              margin: 0,
              minHeight: '92vh',
            }}
        >
          <Switch>
            <Route exact path={`${match.path}/moc1`} component={Moc1} />
            <Route exact path={`${match.path}/moc2`} component={Moc2} />

            <Redirect from="/app" to={`${match.url}/moc1`} />
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLogged;
