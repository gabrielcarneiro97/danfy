import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';

import MovimentosTable from './MovimentosTable';
import ServicosTable from './ServicosTable';
import AcumuladosTable from './AcumuladosTable';
import CotasTable from './CotasTable';
import GuiasTable from './GuiasTable';
import SimplesTable from './SimplesTable';
import GruposTable from './GruposTable';

import { eDoMes, temTabelaCotas } from '../services';

import Connect from '../store/Connect';

import './VisualizarTables.css';

function VisualizarTables(props) {
  const { store } = props;
  const {
    trimestreData,
    simplesData,
    competencia,
    empresa,
    grupos,
  } = store;

  const { movimentosPool, servicosPool } = empresa.simples ? simplesData : trimestreData;

  const movimentosPoolMes = movimentosPool.filter((mP) => eDoMes(mP, competencia));
  const servicosPoolMes = servicosPool.filter((sP) => eDoMes(sP, competencia));

  const temMovimento = movimentosPoolMes.length > 0 && empresa.cnpj;
  const temServico = servicosPoolMes.length > 0 && empresa.cnpj;

  return (
    <>
      <div className="steps-content-tables">
        {
          temMovimento
          && (
            <>
              <Divider orientation="left">Movimentos</Divider>
              <MovimentosTable />
            </>
          )
        }
        {
          temServico
          && (
            <>
              <Divider orientation="left">Serviços</Divider>
              <ServicosTable />
            </>
          )
        }
        {
          grupos.length > 0
          && (
            <>
              <Divider orientation="left">Divisão</Divider>
              <GruposTable />
            </>
          )
        }
        {
          trimestreData.trim
          && (
            <>
              <Divider orientation="left">Guias</Divider>
              <GuiasTable />
              <Divider orientation="left">Acumulados</Divider>
              <AcumuladosTable />
            </>
          )
        }
        {
          temTabelaCotas(empresa, competencia)
          && (
            <>
              <Divider orientation="left">Cotas</Divider>
              <CotasTable />
            </>
          )
        }
        {
          empresa.simples && simplesData.simples.id
          && (
            <>
              <Divider orientation="left">Receitas (Simples)</Divider>
              <SimplesTable />
            </>
          )
        }
      </div>
    </>
  );
}

VisualizarTables.propTypes = {
  store: PropTypes.shape({
    dominio: PropTypes.array,
    trimestreData: PropTypes.object,
    simplesData: PropTypes.object,
    grupos: PropTypes.array,
    notasPool: PropTypes.array,
    notasServicoPool: PropTypes.array,
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      formaPagamento: PropTypes.string,
      cnpj: PropTypes.string,
      simples: PropTypes.bool,
    }),
    competencia: PropTypes.shape({
      mes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      ano: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
};

export default Connect(VisualizarTables);
