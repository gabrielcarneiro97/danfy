import React, { useState } from 'react';
import {
  Button,
} from 'antd';

import EditarGrupoModal from './EditarGrupoModal';

import Connect from '../store/Connect';
import { ClientesStore, GrupoLite } from '../types';

type propTypes = {
  store : ClientesStore;
  defaultData?: GrupoLite;
  buttonType : 'link' | 'default' | 'ghost' | 'primary' | 'dashed' | 'danger' | undefined;
  buttonText : string;
}

function GerenciarGruposButton(props : propTypes) : JSX.Element {
  const {
    store,
    buttonType = 'default' as 'default',
    buttonText = 'Button',
    defaultData,
  } = props;
  const { empresa } = store;
  const { cnpj } = empresa;

  const [showModal, setShowModal] = useState(false);

  const disabled = cnpj === '';

  const abrirModal = () : void => setShowModal(true);

  const fecharModal = () : void => setShowModal(false);

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

export default Connect(GerenciarGruposButton);
