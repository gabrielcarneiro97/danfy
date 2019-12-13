import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  message,
  Upload,
  Button,
  Icon,
} from 'antd';

import { api } from '../services';

import Connect from '../store/Connect';
import {
  addNota,
  addNotaServico,
  addPessoa,
  removeNota,
  removeNotaServico,
  carregarArquivos,
} from '../store/importacao';

function EnviarArquivos(props) {
  const { store, dispatch, onEnd } = props;
  const [ended, setEnded] = useState(0);
  const { fileList } = store;

  console.log(store);

  useEffect(() => {
    if (fileList.length > 0 && fileList.length === ended) {
      message.success('Arquivos Importados com Sucesso!');
      onEnd();
    }
  }, [ended, fileList]);

  const { pessoasPool } = store;

  const addEnded = () => setEnded(ended + 1);
  const subEnded = () => setEnded(ended - 1);

  const addPessoas = (pessoasToAdd) => {
    pessoasToAdd.forEach((pessoaPool) => {
      const pessoaId = pessoasPool.findIndex(
        (pP) => pP.pessoa.cpfcnpj === pessoaPool.pessoa.cpfcnpj,
      );
      if (pessoaId === -1) dispatch(addPessoa(pessoaPool));
    });
  };

  const adicionarNota = (dados) => {
    if (dados.tipo === 'nfe') dispatch(addNota(dados.notaPool));
    else if (dados.tipo === 'nfse') dispatch(addNotaServico(dados.notaPool));
    else return false;

    addPessoas(dados.pessoas);
    return true;
  };

  const removerNota = async (dados) => {
    if (dados.tipo === 'nfe') dispatch(removeNota(dados.notaPool));
    else if (dados.tipo === 'nfse') dispatch(removeNotaServico(dados.notaPool));
    else return false;

    return true;
  };

  const uploadChange = async (info) => {
    const data = info.file.response;

    if (info.fileList.length !== fileList.length) {
      dispatch(carregarArquivos(info.fileList));
    }

    if (info.file.status === 'done') {
      addEnded();
      data.forEach(adicionarNota);
    } else if (info.file.status === 'error') {
      message.error(`Arquivo: ${info.file.name} invalido!`);
      addEnded();
    } else if (info.file.status === 'removed') {
      subEnded();
      await removerNota(data);
    }
  };

  return (
    <Row
      type="flex"
      justify="center"
      align="top"
    >
      <Col span={12} style={{ textAlign: 'center' }}>
        <Upload
          name="file"
          action={`${api}/file`}
          accept=".xml"
          headers={{
            authorization: 'authorization-text',
            'Access-Control-Allow-Origin': '*',
          }}
          multiple
          onChange={uploadChange}
          defaultFileList={fileList}
        >
          <Button>
            <Icon type="plus" />
            Selecionar Arquivos
          </Button>
        </Upload>
      </Col>
    </Row>
  );
}

EnviarArquivos.propTypes = {
  store: PropTypes.shape({
    pessoasPool: PropTypes.array,
    fileList: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  onEnd: PropTypes.func,
};

EnviarArquivos.defaultProps = {
  onEnd: () => true,
};

export default Connect(EnviarArquivos);
