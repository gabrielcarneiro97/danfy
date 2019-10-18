import React, { Fragment, Component } from 'react';
import propTypes from 'prop-types';
import axios from 'axios';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

import { api } from '../services';

class MainMenu extends Component {
  static propTypes = {
    match: propTypes.shape({
      url: propTypes.string,
    }).isRequired,
    location: propTypes.shape({
      pathname: propTypes.string,
    }).isRequired,
  };

  state = {
    version: {
      api: 'un',
      db: 'un',
      node: 'un',
    },
  }

  async componentDidMount() {
    const { data: version } = await axios.get(`${api}/version`);
    this.setState({ version });
  }

  render() {
    const { match } = this.props;
    const { pathname } = this.props.location;
    const { version } = this.state;

    return (
      <Fragment>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ height: '92%', borderRight: 0, backgroundColor: 'white' }}
        >
          <Menu.Item key={`${match.url}/importar`}>
            <Link to={`${match.url}/importar`}>
              <Icon type="download" />Importar Notas
            </Link>
          </Menu.Item>
          <Menu.Item key={`${match.url}/visualizar`}>
            <Link to={`${match.url}/visualizar`}>
              <Icon type="folder-open" />Visualizar Movimento
            </Link>
          </Menu.Item>
          <Menu.Item key={`${match.url}/estoque`}>
            <Link to={`${match.url}/estoque`}>
              <Icon type="inbox" />Estoque
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
          API: {version.api} <br />
          Database: {version.db} <br />
          Node.js: {version.node}
        </div>
      </Fragment>
    );
  }
}

export default withRouter(MainMenu);
