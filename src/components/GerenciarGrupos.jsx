import React, { useState } from 'react';

import GerenciarGruposForm from './GerenciarGruposForm';
import GerenciarGruposTable from './GerenciarGruposTable';


function GerenciarGrupos() {
  const [temEmpresa, setTemEmpresa] = useState(false);

  return (
    <>
      <GerenciarGruposForm onSubmit={() => setTemEmpresa(true)} />
      {
        temEmpresa
        && (
          <GerenciarGruposTable />
        )
      }
    </>
  );
}

export default GerenciarGrupos;
