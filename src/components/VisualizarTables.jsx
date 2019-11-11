import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';

import MovimentosTable from './MovimentosTable';
import ServicosTable from './ServicosTable';
import AcumuladosTable from './AcumuladosTable';
import CotasTable from './CotasTable';
import GuiasTable from './GuiasTable';

import { eDoMes, temTabelaCotas } from '../services';

import Connect from '../store/Connect';

import './VisualizarTables.css';

function VisualizarTables(props) {
  const { store } = props;
  const { trimestreData, competencia, empresa } = store;

  const { movimentosPool, servicosPool } = trimestreData;

  const movimentosPoolMes = movimentosPool.filter((mP) => eDoMes(mP, competencia));
  const servicosPoolMes = servicosPool.filter((sP) => eDoMes(sP, competencia));

  const temMovimento = movimentosPoolMes.length > 0 && empresa.cnpj;
  const temServico = servicosPoolMes.length > 0 && empresa.cnpj;

  const temMovimentoOuServico = temMovimento || temServico;

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
          temMovimentoOuServico
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
      </div>
    </>
  );
}

VisualizarTables.propTypes = {
  store: PropTypes.shape({
    dominio: PropTypes.array,
    trimestreData: PropTypes.object,
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
