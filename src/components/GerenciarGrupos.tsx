import React from 'react';

import GerenciarGruposForm from './GerenciarGruposForm';
import GerenciarGruposTable from './GerenciarGruposTable';

import Connect from '../store/Connect';
import { ClientesStore } from '../types';

type propTypes = {
  store : ClientesStore;
}

function GerenciarGrupos(props : propTypes) : JSX.Element {
  const { store } = props;
  const { empresa } = store;

  return (
    <>
      <GerenciarGruposForm />
      {
        empresa.cnpj !== ''
        && (
          <GerenciarGruposTable />
        )
      }
    </>
  );
}

export default Connect(GerenciarGrupos);
