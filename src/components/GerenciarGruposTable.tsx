import React from 'react';

import { Table } from 'antd';

import { useStore } from '../store/Connect';

import GerenciarGruposButton from './GerenciarGruposButton';
import ShowColor from './ShowColor';
import { ClientesStore, GrupoLite } from '../types';


function GerenciarGruposTable() : JSX.Element {
  const store = useStore<ClientesStore>();

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
      render(hex : string | undefined) : JSX.Element {
        return <ShowColor hex={hex} />;
      },
    },
    {
      title: 'Editar',
      key: 'editar',
      render: (t : any, row : any) : JSX.Element => (
        <GerenciarGruposButton
          defaultData={row as GrupoLite}
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

export default GerenciarGruposTable;
