import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

import AdicionarClienteFile from './AdicionarClienteFile';
import AdicionarClienteForm from './AdicionarClienteForm';

import { pegarDominio } from '../services';

import Connect from '../store/Connect';

import { carregarDominio } from '../store/clientes';

function AdicionarCliente(props) {
  const { dispatch } = props;

  const [empresaDados, setEmpresaDados] = useState({
    cpfcnpj: '',
    nome: '',
  });
  const [selFileDisabled, setSelFileDisabled] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    pegarDominio().then((dom) => {
      dispatch(carregarDominio(dom));
      setSelFileDisabled(false);
    });
  }, []);

  const recebeuXml = (data) => {
    const { notaPool, pessoas } = data;
    const nota = data.tipo === 'nfe' ? notaPool.nota : notaPool.notaServico;
    const emitente = pessoas.find((pP) => pP.pessoa.cpfcnpj === nota.emitenteCpfcnpj).pessoa;

    setEmpresaDados(emitente);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <>
      <AdicionarClienteFile onData={recebeuXml} disabled={selFileDisabled} />
      <Modal
        title="Adicionar Cliente"
        visible={showModal}
        style={{
          marginTop: '40px',
          position: 'static',
        }}
        footer=""
        destroyOnClose
        width={700}
        onCancel={closeModal}
      >
        <AdicionarClienteForm
          empresaDados={empresaDados}
          onEnd={closeModal}
        />
      </Modal>
    </>
  );
}

AdicionarCliente.propTypes = {
  dispatch: PropTypes.func.isRequired,
  store: PropTypes.shape({
    dominio: PropTypes.array,
  }).isRequired,
};


export default Connect(AdicionarCliente);
