import React from 'react';
import moment from 'moment';
import {
  Table,
  Row,
  Col,
  Popconfirm,
  Button,
} from 'antd';

import TableToPrint from './TableToPrint';

import {
  excluirServico,
  alterarGrupoServico,
} from '../services/api.service';

import {
  R$,
  somaTotalServico,
  eDoMes,
} from '../services/calculador.service';

import GrupoSelect from './GrupoSelect';

import { useStore, useDispatch } from '../store/Connect';
import { carregarMovimento } from '../store/movimento';

import '../assets/colors.css';
import { NotaServico, MovimentoStore, ServicoPool } from '../types';

function eCancelada(nota?: NotaServico) : boolean {
  if (!nota) return false;
  return nota.status === 'CANCELADA';
}

function sorter(a : NotaServico, b : NotaServico) : number {
  if (!a.numero || (parseInt(a.numero, 10) > parseInt(b.numero, 10))) {
    return 1;
  }
  return -1;
}

function grupoSorter(
  a : any,
  b : any,
) : number {
  if (!a.grupoId || (parseInt(a.grupoId, 10) > parseInt(b.grupoId, 10))) {
    return 1;
  }
  return -1;
}

function numRender(numero : any, data : any) : JSX.Element | string {
  if (data.$$typeof) return data;
  if (!numero) return '';

  return (
    <Popconfirm
      title="Deseja mesmo excluir esse serviço?"
      okText="Sim"
      cancelText="Não"
      onConfirm={data.excluir}
    >
      <Button type="ghost" style={{ width: '100%' }}>{numero}</Button>
    </Popconfirm>
  );
}

const lpColumns = [
  {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    fixed: true,
    defaultSortOrder: 'ascend',
    sorter,
    render: numRender,
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Data',
    dataIndex: 'data',
    key: 'data',
  }, {
    title: 'Valor do Serviço',
    dataIndex: 'valorServico',
    key: 'valorServico',
  }, {
    title: 'Retenções',
    children: [{
      title: 'ISS',
      dataIndex: 'issRetido',
      key: 'issRetido',
    }, {
      title: 'PIS',
      dataIndex: 'pisRetido',
      key: 'pisRetido',
    }, {
      title: 'COFINS',
      dataIndex: 'cofinsRetido',
      key: 'cofinsRetido',
    }, {
      title: 'CSLL',
      dataIndex: 'csllRetido',
      key: 'csllRetido',
    }, {
      title: 'IRPJ',
      dataIndex: 'irpjRetido',
      key: 'irpjRetido',
    }, {
      title: 'Total',
      dataIndex: 'totalRetido',
      key: 'totalRetido',
    }],
  }, {
    title: 'ISS',
    dataIndex: 'iss',
    key: 'iss',
  }, {
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
  }, {
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
  }, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

const simplesColumns = [
  {
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    defaultSortOrder: 'ascend',
    sorter,
    render: numRender,
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Data',
    dataIndex: 'data',
    key: 'data',
  }, {
    title: 'Valor do Serviço',
    dataIndex: 'valorServico',
    key: 'valorServico',
  }, {
    title: 'Retenções',
    children: [{
      title: 'ISS',
      dataIndex: 'issRetido',
      key: 'issRetido',
    }],
  }, {
    title: 'ISS',
    dataIndex: 'iss',
    key: 'iss',
  }, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  },
];

type propTypes = {
  printable? : boolean;
}

function ServicosTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();
  const dispatch = useDispatch();

  const {
    printable = false,
  } = props;
  const {
    simplesData,
    trimestreData,
    notasServico,
    competencia,
    empresa,
    grupos,
  } = store;

  const { simples } = empresa || { simples: false };

  const { servicosPool } = simples ? simplesData : trimestreData;

  const columns : any[] = simples ? [...simplesColumns] : [...lpColumns];

  if (grupos.length > 0) {
    columns.push({
      title: 'Grupo',
      dataIndex: 'grupoId',
      key: 'grupoId',
      width: 150,
      sorter: grupoSorter,
      render: (value : any, row : any) => (
        row.key === 'total-servicos'
          ? '' : <GrupoSelect initialValue={value} onChange={row.mudarGrupo} />
      ),
    });
  }

  const update = (dados : MovimentoStore) : void => dispatch(carregarMovimento(dados));

  const apagaServico = (
    servicoPool : ServicoPool,
  ) => () : Promise<void> => excluirServico(servicoPool).then(update);

  const mudarGrupo = (
    servicoPool : ServicoPool,
  ) => (novoGrupoId : string) : Promise<void> => alterarGrupoServico(
    servicoPool, novoGrupoId,
  ).then(update);

  let totais : any = null;

  const servicosPoolMes = simples ? servicosPool : servicosPool.filter(
    (sP) => eDoMes(sP, competencia),
  );

  const dataSource : any[] = servicosPoolMes.map((servicoPool) => {
    const { servico, imposto, retencao } = servicoPool;

    const numero = parseInt(servico.notaChave.substring(18), 10);
    const nota = notasServico.find((n) => n.chave === servico.notaChave);

    const grupo = grupos.find((g) => g.id === servico.grupoId);

    const issRetido = eCancelada(nota) ? 0 : retencao.iss || 0;
    const pisRetido = eCancelada(nota) ? 0 : retencao.pis || 0;
    const cofinsRetido = eCancelada(nota) ? 0 : retencao.cofins || 0;
    const csllRetido = eCancelada(nota) ? 0 : retencao.csll || 0;
    const irpjRetido = eCancelada(nota) ? 0 : retencao.irpj || 0;
    const totalRetido = eCancelada(nota) ? 0 : retencao.total || 0;

    const valorIss = imposto.iss - issRetido;
    const valorPis = imposto.pis - pisRetido;
    const valorCofins = imposto.cofins - cofinsRetido;
    const valorCsll = imposto.csll - csllRetido;
    const valorIrpj = imposto.irpj - irpjRetido;
    const valorTotal = valorIss + valorPis + valorCofins + valorCsll + valorIrpj;
    
    const valores = {
      cor: grupo && grupo.cor,
      key: servico.notaChave,
      numero,
      grupoId: printable ? (grupo && grupo.nome) || '' : servico.grupoId,
      nota: numero,
      status: nota?.status,
      data: moment(servico.dataHora).format('DD[/]MMM'),
      valorServico: R$(servico.valor),
      issRetido: R$(issRetido),
      pisRetido: R$(pisRetido),
      cofinsRetido: R$(cofinsRetido),
      csllRetido: R$(csllRetido),
      irpjRetido: R$(irpjRetido),
      totalRetido: R$(totalRetido),
      iss: R$(valorIss),
      pis: R$(valorPis),
      cofins: R$(valorCofins),
      csll: R$(valorCsll),
      irpj: R$(valorIrpj),
      total: R$(valorTotal),
      excluir: apagaServico(servicoPool),
      mudarGrupo: mudarGrupo(servicoPool),
    };

    totais = somaTotalServico(valores, totais);

    return valores;
  });

  if (totais) {
    dataSource.push(totais);
  }

  if (printable) {
    dataSource.sort(sorter);
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={columns}
      />
    );
  }

  return (
    <Row
      type="flex"
      justify="center"
    >
      <Col span={23}>
        <Table
          bordered
          size="small"
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: simples ? 'max-content' : '110%' }}
          pagination={{ position: 'top', simple: true }}
          rowClassName={({ cor }) => (cor ? cor.replace('#', 'color-') : '')}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

export default ServicosTable;
