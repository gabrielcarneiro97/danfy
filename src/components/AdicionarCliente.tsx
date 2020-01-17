import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';

import AdicionarClienteFile from './AdicionarClienteFile';
import AdicionarClienteForm from './AdicionarClienteForm';

import { pegarDominio } from '../services/api.service';

import { useDispatch } from '../store/Connect';

import { carregarDominio } from '../store/clientes';
import { PessoaPool, NotaPool, NotaServicoPool } from '../types';


function AdicionarCliente() : JSX.Element {
  const dispatch = useDispatch();

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

  const recebeuXml = (data :
    { tipo : string; notaPool : NotaPool | NotaServicoPool; pessoas : PessoaPool[] }) : void => {
    const { notaPool, pessoas } = data;

    const nota = data.tipo === 'nfe' ? (notaPool as NotaPool).nota : (notaPool as NotaServicoPool).notaServico;

    const find = pessoas.find(
      (pP : PessoaPool) => pP.pessoa.cpfcnpj === nota.emitenteCpfcnpj,
    );

    if (find) {
      setEmpresaDados(find.pessoa);
      setShowModal(true);
    }
  };

  const closeModal = () : void => setShowModal(false);

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

export default AdicionarCliente;
