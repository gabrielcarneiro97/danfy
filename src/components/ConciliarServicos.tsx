import React, { useEffect, useState } from 'react';
import {
  Table,
  Row,
  Col,
  Checkbox,
} from 'antd';

import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { R$ } from '../services/calculador.service';

import { calcularServico } from '../services/api.service';

import { carregarServicos } from '../store/importacao';
import { useStore, useDispatch } from '../store/Connect';
import { NotaServicoPool, ImportacaoStore, ServicoPoolWithIndex } from '../types';

const columns = [
  {
    title: 'Número',
    dataIndex: 'numero',
    key: 'numero',
  }, {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Valor',
    dataIndex: 'valor',
    key: 'valor',
  }, {
    title: 'Confirmar',
    dataIndex: 'confirmar',
    key: 'confirmar',
    align: 'center' as 'center',
  },
];


function ConciliarServicos() : JSX.Element {
  const store = useStore<ImportacaoStore>();
  const dispatch = useDispatch();

  const { notasServicoPool, servicosWithIndex } = store;

  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (notasServicoPool.length === 0) {
      setDataLoading(false);
      return;
    }

    Promise.all(
      notasServicoPool.map(async ({ notaServico } : NotaServicoPool, index : number) => {
        const servico = await calcularServico(notaServico);
        return {
          ...servico,
          index,
        };
      }),
    ).then((servsWithIds) => {
      dispatch(carregarServicos(servsWithIds));
      setDataLoading(false);
    });
  }, []);

  const getNotaServico = (
    chave : string,
  ) : NotaServicoPool | undefined => notasServicoPool.find(
    ({ notaServico }) => notaServico.chave === chave,
  );

  const alterarServico = (servico : ServicoPoolWithIndex) : void => {
    const servicosNovo = servicosWithIndex.map((el) => {
      if (el.index === servico.index) {
        return servico;
      }
      return el;
    });
    dispatch(carregarServicos(servicosNovo));
  };

  const dataSource = servicosWithIndex.map((servicoPoolWithIndex, id) => {
    const { servico } = servicoPoolWithIndex;
    const notaServicoPool = getNotaServico(servico.notaChave);

    if (!notaServicoPool) return undefined;

    const { notaServico } = notaServicoPool;

    return {
      key: `servico-${id}-${notaServico.emitenteCpfcnpj}`,
      numero: id + 1,
      nota: notaServico.numero,
      status: notaServico.status,
      valor: R$(notaServico.valor),
      confirmar: <Checkbox
        checked={servico.conferido}
        onChange={(e : CheckboxChangeEvent) : void => {
          const servicoPWINovo = {
            ...servicoPoolWithIndex,
          };
          servicoPWINovo.servico.conferido = e.target.checked;
          alterarServico(servicoPWINovo);
        }}
      />,
    };
  });

  return (
    <Row
      type="flex"
      justify="center"
      align="top"
    >
      <Col span={23} style={{ textAlign: 'center' }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={dataLoading}
        />
      </Col>
    </Row>
  );
}

export default ConciliarServicos;
