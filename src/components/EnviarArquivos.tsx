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

import { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { api } from '../services/publics';

import { useStore, useDispatch } from '../store/Connect';
import {
  addNota,
  addNotaServico,
  addPessoa,
  removeNota,
  removeNotaServico,
  carregarArquivos,
} from '../store/importacao';
import {
  ImportacaoStore, PessoaPool, FileZ, NotaPool, NotaServicoPool,
} from '../types';

type propTypes = {
  onEnd : Function;
}

function EnviarArquivos(props : propTypes) : JSX.Element {
  const store = useStore<ImportacaoStore>();
  const dispatch = useDispatch();

  const { onEnd } = props;

  const [ended, setEnded] = useState(0);
  const { fileList } = store;

  useEffect(() => {
    if (fileList.length > 0 && fileList.length === ended) {
      message.success('Arquivos Importados com Sucesso!');
      if (onEnd) onEnd();
    }
  }, [ended, fileList]);

  const { pessoasPool } = store;

  const addEnded = () : void => setEnded(ended + 1);
  const subEnded = () : void => setEnded(ended - 1);

  const addPessoas = (pessoasToAdd : PessoaPool[]) : void => {
    pessoasToAdd.forEach((pessoaPool) => {
      const pessoaId = pessoasPool.findIndex(
        (pP) => pP.pessoa.cpfcnpj === pessoaPool.pessoa.cpfcnpj,
      );
      if (pessoaId === -1) dispatch(addPessoa(pessoaPool));
    });
  };

  const adicionarNota = (dados : FileZ) : boolean => {
    if (dados.tipo === 'nfe') dispatch(addNota(dados.notaPool as NotaPool));
    else if (dados.tipo === 'nfse') dispatch(addNotaServico(dados.notaPool as NotaServicoPool));
    else return false;

    addPessoas(dados.pessoas);
    return true;
  };

  const removerNota = (dados : FileZ) : boolean => {
    if (dados.tipo === 'nfe') dispatch(removeNota(dados.notaPool as NotaPool));
    else if (dados.tipo === 'nfse') dispatch(removeNotaServico(dados.notaPool as NotaServicoPool));
    else return false;

    return true;
  };

  const uploadChange = (info : UploadChangeParam<UploadFile<FileZ[]>>) : void => {
    const data = info.file.response;

    if (info.fileList.length !== fileList.length) {
      dispatch(carregarArquivos(info.fileList));
    }

    if (!data) return;

    if (info.file.status === 'done') {
      addEnded();
      data.forEach(adicionarNota);
    } else if (info.file.status === 'error') {
      message.error(`Arquivo: ${info.file.name} invalido!`);
      addEnded();
    } else if (info.file.status === 'removed') {
      subEnded();
      removerNota(data[0]);
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

export default EnviarArquivos;
