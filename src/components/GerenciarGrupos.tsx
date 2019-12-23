import React from 'react';
import PropTypes from 'prop-types';

import GerenciarGruposForm from './GerenciarGruposForm';
import GerenciarGruposTable from './GerenciarGruposTable';

import Connect from '../store/Connect';

function GerenciarGrupos(props) {
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

GerenciarGrupos.propTypes = {
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
  }).isRequired,
};


export default Connect(GerenciarGrupos);
