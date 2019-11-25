import React, { useState, useEffect } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

import { api } from '../services';

function MainMenu(props) {
  const { match, location } = props;
  const { pathname } = location;

  const [apiVer, setApiVer] = useState('');
  const [nodeVer, setNodeVer] = useState('');
  const [dbVer, setDbVer] = useState('');

  useEffect(() => {
    axios.get(`${api}/version`).then(({ data: version }) => {
      setApiVer(version.api);
      setNodeVer(version.node);
      setDbVer(version.db);
    });
  }, []);

  return (
    <>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        style={{ height: '92%', borderRight: 0, backgroundColor: 'white' }}
      >
        <Menu.Item key={`${match.url}/importar`}>
          <Link to={`${match.url}/importar`}>
            <Icon type="download" />
            Importar Notas
          </Link>
        </Menu.Item>
        <Menu.Item key={`${match.url}/clientes`}>
          <Link to={`${match.url}/clientes`}>
            <Icon type="team" />
            Gerenciar Clientes
          </Link>
        </Menu.Item>
        <Menu.Item key={`${match.url}/visualizar`}>
          <Link to={`${match.url}/visualizar`}>
            <Icon type="folder-open" />
            Visualizar Movimento
          </Link>
        </Menu.Item>
        <Menu.Item key={`${match.url}/estoque`}>
          <Link to={`${match.url}/estoque`}>
            <Icon type="inbox" />
            Estoque
          </Link>
        </Menu.Item>
      </Menu>
      <div style={{
        height: '8%',
        borderRight: 0,
        fontSize: '9px',
        backgroundColor: 'white',
        paddingLeft: '3%',
      }}
      >
        API:&nbsp;
        {apiVer}
        <br />
        Database:&nbsp;
        {dbVer.split('(')[0]}
        <br />
        Node.js:&nbsp;
        {nodeVer}
      </div>
    </>
  );
}
MainMenu.propTypes = {
  match: propTypes.shape({
    url: propTypes.string,
  }).isRequired,
  location: propTypes.shape({
    pathname: propTypes.string,
  }).isRequired,
};

export default withRouter(MainMenu);
