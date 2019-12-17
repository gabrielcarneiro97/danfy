import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'antd';

import Connect from '../store/Connect';

import GerenciarGruposButton from './GerenciarGruposButton';
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
    {
      title: 'Editar',
      key: 'editar',
      render: (t, row) => (
        <GerenciarGruposButton
          defaultData={row}
          buttonType="link"
          buttonText="Editar"
        />
      ),
    },
  ];

  const dataSource = grupos.map((g) => ({ ...g, key: g.id }));

  dataSource.sort((a, b) => a.id - b.id);

  return (
    <>
      <GerenciarGruposButton
        buttonText="Adicionar Grupo"
      />
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
