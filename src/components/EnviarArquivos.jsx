import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, message, Upload, Button, Icon } from 'antd';

import { api } from '../services';

function adicionarPessoas(pessoasOld, pessoasToAdd) {
  const pessoasNew = [...pessoasOld];
  pessoasToAdd.forEach((pessoa) => {
    const pessoaId = pessoasOld.findIndex(p => p.cpfcnpj === pessoa.pessoa.cpfcnpj);
    if (pessoaId !== -1) pessoasNew[pessoaId] = pessoa.pessoa;
    else pessoasNew.push(pessoa.pessoa);
  });

  return pessoasNew;
}

class EnviarArquivos extends Component {
  static propTypes = {
    onEnd: PropTypes.func.isRequired,
  };

  state = {
    nfse: [],
    nfe: [],
    pessoas: [],
  };

  adicionarNota = dados => new Promise((resolve) => {
    if (dados.tipo === 'nfe') {
      this.setState(prevState => ({
        ...prevState,
        nfe: [...prevState.nfe, dados.notaPool],
        pessoas: adicionarPessoas(prevState.pessoas, dados.pessoas),
      }), resolve);
    } else {
      this.setState(prevState => ({
        ...prevState,
        nfse: [...prevState.nfse, dados.notaPool],
        pessoas: adicionarPessoas(prevState.pessoas, dados.pessoas),
      }), resolve);
    }
  });

  removerNota = nota => new Promise((resolve) => {
    if (nota.tipo === 'nfe') {
      this.setState(prevState => ({
        ...prevState,
        nfe: prevState.nfe.filter(el => el.nota.chave !== nota.nota.chave),
      }), resolve);
    } else {
      this.setState(prevState => ({
        ...prevState,
        nfse: prevState.nfse.filter(el => el.nota.chave !== nota.nota.chave),
      }), resolve);
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
    onChange: async (info) => {
      const data = info.file.response;

      if (info.file.status === 'done') {
        this.ended += 1;
        await this.adicionarNota(data);
      } else if (info.file.status === 'error') {
        message.error(`Arquivo: ${info.file.name} invalido!`);
        this.ended += 1;
      } else if (info.file.status === 'removed') {
        this.ended -= 1;
        await this.removerNota(data);
      }

      if (this.ended === info.fileList.length) {
        if (info.file.status === 'error') {
          message.error('Erro!');
        } else {
          message.success('Todas as notas foram importadas!');
          this.props.onEnd(this.state);
          console.log(this.state);
        }
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
