import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  Modal,
  Input,
  DatePicker,
  Row,
  Col,
  message,
} from 'antd';

import { api, getEstoque } from '../services';
import { carregarEstoque } from '../store/estoque';
import Connect from '../store/Connect';
import { floating } from '../services/calculador.service';

function EstoqueAddButton(props) {
  const { store, dispatch } = props;
  const { estoqueInfosGerais } = store;
  const { cnpj, diaMesAno } = estoqueInfosGerais;

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [dataEntrada, setDataEntrada] = useState(null);
  const [dataSaida, setDataSaida] = useState(null);
  const [valorEntrada, setValorEntrada] = useState('');
  const [codigoProduto, setCodigoProduto] = useState('');
  const [descricao, setDescricao] = useState('');

  const disabled = cnpj === '' || diaMesAno === null;

  const limparDados = () => {
    setDataEntrada(null);
    setDataSaida(null);
    setValorEntrada('');
    setCodigoProduto('');
    setDescricao('');
    setModalLoading(false);
  };

  const produto = () => ({
    dataEntrada,
    dataSaida,
    valorEntrada: floating(valorEntrada),
    codigoProduto,
    descricao,
    donoCpfcnpj: cnpj,
    ativo: true,
  });

  const abrirModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    limparDados();
  };

  const addProduto = async () => {
    setModalLoading(true);
    const prod = produto();

    try {
      await axios.post(`${api}/estoque/${cnpj}`, prod);
      const estoque = await getEstoque(estoqueInfosGerais);

      dispatch(carregarEstoque(estoque));
      message.success(`Produto ${codigoProduto} adicionado com sucesso!`);
      closeModal();
    } catch (err) {
      console.error(err);
      message.error(`Falha ao adicionar o produto: ${codigoProduto}`);
    }
    message.success('TOP');
  };

  const onChangeDatePicker = (setState) => (data) => setState(data);
  const onChangeInput = (setState) => (e) => setState(e.target.value);

  return (
    <div style={{ marginBottom: '5px' }}>
      <Button
        type="primary"
        disabled={disabled}
        onClick={abrirModal}
      >
        Adicionar Produto
      </Button>
      <Modal
        title="Adicionar Produto"
        visible={showModal}
        onOk={addProduto}
        okText="Adicionar"
        cancelText="Cancelar"
        confirmLoading={modalLoading}
        onCancel={closeModal}
      >
        <div>
          <Row
            type="flex"
            justify="center"
            align="top"
            gutter={8}
            style={{ marginBottom: '5px' }}
          >
            <Col span={12} style={{ textAlign: 'center' }}>
              <DatePicker
                placeholder="Data Entrada"
                format="DD-MM-YYYY"
                value={dataEntrada}
                onChange={onChangeDatePicker(setDataEntrada)}
              />
            </Col>
            <Col span={12} style={{ textAlign: 'center' }}>
              <DatePicker
                placeholder="Data Saída"
                format="DD-MM-YYYY"
                value={dataSaida}
                onChange={onChangeDatePicker(setDataSaida)}
              />
            </Col>
          </Row>
          <Row
            gutter={8}
            style={{ marginBottom: '5px' }}
          >
            <Col span={8}>
              <Input
                placeholder="Código"
                value={codigoProduto}
                onChange={onChangeInput(setCodigoProduto)}
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
          <Row>
            <Col>
              <Input
                placeholder="Valor"
                value={valorEntrada}
                onChange={onChangeInput(setValorEntrada)}
              />
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
}

export default Connect(EstoqueAddButton);
