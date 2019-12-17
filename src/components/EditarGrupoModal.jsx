import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Modal,
  Input,
  Row,
  Col,
  message,
} from 'antd';

import { CompactPicker } from 'react-color';

import colors from '../assets/colors';

import { api, getGrupos } from '../services';

import { carregarGrupos } from '../store/clientes';

import Connect from '../store/Connect';


function EditarGrupoModal(props) {
  const {
    onClose,
    visible,
    title,
    okText,
    dispatch,
    store,
    defaultData,
  } = props;

  const { empresa } = store;
  const { cnpj } = empresa;

  const [okDisabled, setOkDisabled] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const [id, setId] = useState(defaultData.id);
  const [nome, setNome] = useState(defaultData.nome);
  const [descricao, setDescricao] = useState(defaultData.descricao);
  const [cor, setCor] = useState(defaultData.cor);

  useEffect(() => {
    if (nome !== '' && descricao !== '' && cor !== '') setOkDisabled(false);
  }, [nome, descricao, cor]);

  const limparDados = () => {
    setId('');
    setNome('');
    setDescricao('');
    setCor('');
    setModalLoading(false);
  };

  const grupo = () => ({
    id,
    nome,
    descricao,
    cor,
  });

  const addGrupo = async () => {
    setModalLoading(true);
    const g = grupo();

    try {
      if (id) await axios.put(`${api}/grupo/${cnpj}`, g);
      else await axios.post(`${api}/grupo/${cnpj}`, g);

      const gps = await getGrupos(cnpj);

      dispatch(carregarGrupos(gps));
      message.success(`Grupo ${nome} modificado com sucesso!`);
      onClose();
    } catch (err) {
      console.error(err);
      message.error(`Falha ao modificadar o grupo: ${nome}`);
    }
  };

  const onChangeInput = (setState) => (e) => setState(e.target.value);


  return (
    <Modal
      title={title}
      visible={visible}
      onOk={addGrupo}
      okButtonProps={{ disabled: okDisabled }}
      okText={okText}
      cancelText="Cancelar"
      afterClose={limparDados}
      confirmLoading={modalLoading}
      onCancel={onClose}
    >
      <div>
        <Row
          gutter={8}
          style={{ marginBottom: '20px' }}
        >
          <Col span={8}>
            <Input
              placeholder="Nome"
              value={nome}
              onChange={onChangeInput(setNome)}
            />
          </Col>
          <Col span={16}>
            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={onChangeInput(setDescricao)}
            />
          </Col>
        </Row>
        <Row
          gutter={8}
          style={{ marginBottom: '5px' }}
          type="flex"
          justify="center"
        >
          <Col>
            <CompactPicker
              color={cor}
              colors={colors}
              onChangeComplete={(color) => setCor(color.hex)}
            />
          </Col>
        </Row>
      </div>
    </Modal>
  );
}

EditarGrupoModal.propTypes = {
  onClose: PropTypes.func,
  visible: PropTypes.bool,
  title: PropTypes.string,
  okText: PropTypes.string,
  defaultData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nome: PropTypes.string,
    descricao: PropTypes.string,
    cor: PropTypes.string,
  }),
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    grupos: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

EditarGrupoModal.defaultProps = {
  onClose: () => true,
  visible: false,
  title: 'Modal',
  okText: 'Ok',
  defaultData: {
    id: '',
    nome: '',
    descricao: '',
    cor: '',
  },
};


export default Connect(EditarGrupoModal);
