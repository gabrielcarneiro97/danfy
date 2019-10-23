import React, { useState } from 'react';
import {
  Button,
  Modal,
  Input,
  DatePicker,
  Row,
  Col,
} from 'antd';

import Connect from '../store/Connect';

function EstoqueAddButton(props) {
  const { store } = props;
  const { estoqueInfosGerais } = store;

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [dataEntrada, setDataEntrada] = useState(null);
  const [dataSaida, setDataSaida] = useState(null);
  const [valorEntrada, setValorEntrada] = useState('');
  const [codigoProduto, setCodigoProduto] = useState('');
  const [descricao, setDescricao] = useState('');

  const disabled = estoqueInfosGerais.cnpj === ''
  || estoqueInfosGerais.diaMesAno === null;

  const limparDados = () => {
    setDataEntrada(null);
    setDataSaida(null);
    setValorEntrada('');
    setCodigoProduto('');
    setDescricao('');
  };

  const pegarProduto = () => ({
    dataEntrada,
    dataSaida,
    valorEntrada,
    codigoProduto,
    descricao,
  });

  const addProduto = () => {
    setModalLoading(true);
    console.log(pegarProduto());
  };

  const abrirModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    limparDados();
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
