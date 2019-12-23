import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from 'antd';

import EditarGrupoModal from './EditarGrupoModal';

import Connect from '../store/Connect';

function GerenciarGruposButton(props) {
  const {
    store,
    buttonType,
    buttonText,
    defaultData,
  } = props;
  const { empresa } = store;
  const { cnpj } = empresa;

  const [showModal, setShowModal] = useState(false);

  const disabled = cnpj === '';

  const abrirModal = () => setShowModal(true);

  const fecharModal = () => setShowModal(false);

  return (
    <div style={{ marginBottom: '5px' }}>
      <Button
        type={buttonType}
        disabled={disabled}
        onClick={abrirModal}
      >
        {buttonText}
      </Button>
      <EditarGrupoModal
        visible={showModal}
        onClose={fecharModal}
        defaultData={defaultData}
        title={buttonText}
        okText="Ok"
      />
    </div>
  );
}

GerenciarGruposButton.propTypes = {
  defaultData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nome: PropTypes.string,
    descricao: PropTypes.string,
    cor: PropTypes.string,
  }),
  buttonType: PropTypes.string,
  buttonText: PropTypes.string,
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    grupos: PropTypes.array,
  }).isRequired,
};

GerenciarGruposButton.defaultProps = {
  buttonType: 'primary',
  buttonText: 'Button',
  defaultData: {
    id: '',
    nome: '',
    descricao: '',
    cor: '',
  },
};

export default Connect(GerenciarGruposButton);
