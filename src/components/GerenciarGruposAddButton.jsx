import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Button,
  Modal,
  Input,
  Row,
  Col,
  message,
} from 'antd';
import { CompactPicker } from 'react-color';

import { api, getGrupos } from '../services';

import { carregarGrupos } from '../store/clientes';

import Connect from '../store/Connect';

import colors from '../assets/colors';

function GerenciarGruposAddButton(props) {
  const { store, dispatch } = props;
  const { empresa } = store;
  const { cnpj } = empresa;

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState('');

  const disabled = cnpj === '';

  const limparDados = () => {
    setNome('');
    setDescricao('');
    setCor('');
    setModalLoading(false);
  };

  const grupo = () => ({
    nome,
    descricao,
    cor,
  });

  const abrirModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    limparDados();
  };

  const addGrupo = async () => {
    setModalLoading(true);
    const g = grupo();

    try {
      await axios.post(`${api}/grupo/${cnpj}`, g);
      const gps = await getGrupos(cnpj);

      dispatch(carregarGrupos(gps));
      message.success(`Grupo ${nome} adicionado com sucesso!`);
      closeModal();
    } catch (err) {
      console.error(err);
      message.error(`Falha ao adicionar o produto: ${nome}`);
    }
  };

  const onChangeInput = (setState) => (e) => setState(e.target.value);

  return (
    <div style={{ marginBottom: '5px' }}>
      <Button
        type="primary"
        disabled={disabled}
        onClick={abrirModal}
      >
        Adicionar Grupo
      </Button>
      <Modal
        title="Adicionar Grupo"
        visible={showModal}
        onOk={addGrupo}
        okText="Adicionar"
        cancelText="Cancelar"
        confirmLoading={modalLoading}
        onCancel={closeModal}
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
    </div>
  );
}

GerenciarGruposAddButton.propTypes = {
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

export default Connect(GerenciarGruposAddButton);
