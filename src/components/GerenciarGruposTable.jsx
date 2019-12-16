import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'antd';

import Connect from '../store/Connect';

import GerenciarGruposAddButton from './GerenciarGruposAddButton';
import ShowColor from './ShowColor';


function GerenciarGruposTable(props) {
  const { store } = props;
  const { grupos } = store;

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
    },
    {
      title: 'Cor',
      dataIndex: 'cor',
      key: 'cor',
      render(hex) {
        return <ShowColor hex={hex} />;
      },
    },
  ];

  const dataSource = grupos.map((g) => ({ ...g, key: g.id }));

  return (
    <>
      <GerenciarGruposAddButton />
      <Table
        columns={columns}
        dataSource={dataSource}
      />
    </>
  );
}

GerenciarGruposTable.propTypes = {
  store: PropTypes.shape({
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
    grupos: PropTypes.array,
  }).isRequired,
};

export default Connect(GerenciarGruposTable);
