import React from 'react';

import GerenciarGruposForm from './GerenciarGruposForm';
import GerenciarGruposTable from './GerenciarGruposTable';

import { useStore } from '../store/Connect';
import { ClientesStore } from '../types';


function GerenciarGrupos() : JSX.Element {
  const store = useStore<ClientesStore>();

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

export default GerenciarGrupos;
