import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, message, Upload, Button, Icon } from 'antd';

import { api } from '../services';

class EnviarArquivos extends React.Component {
  static propTypes = {
    onEnd: PropTypes.func.isRequired,
  };

  state = {
    nfse: [],
    nfe: [],
    pessoas: {},
  };

  adicionarNota = dados => new Promise((resolve) => {
    if (dados.tipo === 'nfe') {
      this.setState((prevState) => { // eslint-disable-line
        return {
          ...prevState,
          nfe: [...prevState.nfe, dados.nota],
          pessoas: { ...prevState.pessoas, ...dados.pessoas },
        };
      }, resolve);
    } else {
      this.setState((prevState) => { // eslint-disable-line
        return {
          ...prevState,
          nfse: [...prevState.nfse, dados.nota],
          pessoas: { ...prevState.pessoas, ...dados.pessoas },
        };
      }, resolve);
    }
  });

  removerNota = nota => new Promise((resolve) => {
    if (nota.tipo === 'nfe') {
      this.setState((prevState) => { // eslint-disable-line
        return {
          ...prevState,
          nfe: prevState.nfe.filter(el => el.nota.chave !== nota.nota.chave),
        };
      }, resolve);
    } else {
      this.setState((prevState) => { // eslint-disable-line
        return {
          ...prevState,
          nfse: prevState.nfse.filter(el => el.nota.chave !== nota.nota.chave),
        };
      }, resolve);
    }
  });

  ended = 0;

  upProps = {
    name: 'file',
    action: `${api}/file`,
    accept: '.xml',
    headers: {
      authorization: 'authorization-text',
      'Access-Control-Allow-Origin': '*',
    },
    multiple: true,
    onChange: (info) => {
      let promise;
      const nota = info.file.response;

      if (info.file.status === 'done') {
        this.ended += 1;
        promise = this.adicionarNota(nota);
      } else if (info.file.status === 'error') {
        message.error(`Arquivo: ${info.file.name} invalido!`);
        this.ended += 1;
      } else if (info.file.status === 'removed') {
        this.ended -= 1;
        promise = this.removerNota(nota);
      }

      if (this.ended === info.fileList.length) {
        message.success('Todas as notas foram importadas!');
        promise.then(() => {
          this.props.onEnd(this.state);
        });
      }
    },
  };

  render() {
    return (
      <Row
        type="flex"
        justify="center"
        align="top"
      >
        <Col span={12} style={{ textAlign: 'center' }}>
          <Upload {...this.upProps}>
            <Button>
              <Icon type="plus" /> Selecionar Arquivos
            </Button>
          </Upload>
        </Col>
      </Row>
    );
  }
}

export default EnviarArquivos;
