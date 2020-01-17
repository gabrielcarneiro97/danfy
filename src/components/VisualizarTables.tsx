import React from 'react';
import { Divider } from 'antd';

import MovimentosTable from './MovimentosTable';
import ServicosTable from './ServicosTable';
import AcumuladosTable from './AcumuladosTable';
import CotasTable from './CotasTable';
import GuiasTable from './GuiasTable';
import SimplesTable from './SimplesTable';
import GruposTable from './GruposTable';

import { eDoMes, temTabelaCotas } from '../services/calculador.service';

import { useStore } from '../store/Connect';

import './VisualizarTables.css';
import { MovimentoStore } from '../types';


function VisualizarTables() : JSX.Element {
  const store = useStore<MovimentoStore>();
  const {
    trimestreData,
    simplesData,
    competencia,
    empresa,
    grupos,
  } = store;

  const { movimentosPool, servicosPool } = empresa?.simples ? simplesData : trimestreData;

  const movimentosPoolMes = movimentosPool.filter((mP) => eDoMes(mP, competencia));
  const servicosPoolMes = servicosPool.filter((sP) => eDoMes(sP, competencia));

  const temMovimento = movimentosPoolMes.length > 0 && empresa?.cnpj;
  const temServico = servicosPoolMes.length > 0 && empresa?.cnpj;

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
          && trimestreData.trim
          && (
            <>
              <Divider orientation="left">Cotas</Divider>
              <CotasTable />
            </>
          )
        }
        {
          empresa?.simples && simplesData.simples.id
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

export default VisualizarTables;
