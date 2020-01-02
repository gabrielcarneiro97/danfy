import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';
import {
  Divider,
  Row,
  Col,
  Button,
} from 'antd';

import MovimentosTable from './MovimentosTable';
import ServicosTable from './ServicosTable';
import AcumuladosTable from './AcumuladosTable';
import CotasTable from './CotasTable';
import GuiasTable from './GuiasTable';
import SimplesTable from './SimplesTable';
import GruposTable from './GruposTable';

import {
  pegaMes,
  cnpjMask,
  eDoMes,
  temTabelaCotas,
} from '../services/calculador.service';

import './Printer.css';

import Connect from '../store/Connect';
import { MovimentoStore, MesesNum } from '../types';

type propTypes = {
  store : MovimentoStore;
}


function Printer(props : propTypes) : JSX.Element {
  const { store } = props;
  const {
    trimestreData,
    simplesData,
    competencia,
    empresa,
    grupos,
  } = store;

  if (!empresa || !competencia) return <div />;

  const { movimentosPool, servicosPool } = empresa.simples ? simplesData : trimestreData;

  const movimentosPoolMes = movimentosPool.filter((mP) => eDoMes(mP, competencia));
  const servicosPoolMes = servicosPool.filter((sP) => eDoMes(sP, competencia));

  const temMovimento = movimentosPoolMes.length > 0 && empresa.cnpj;
  const temServico = servicosPoolMes.length > 0 && empresa.cnpj;

  const printRef = useRef<HTMLDivElement>(null);

  const printStyle = `
    @page { size: auto; margin: 10mm; margin-bottom: 10mm; margin-top: 12mm; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  `;

  return (
    <div>
      <ReactToPrint
        trigger={() : JSX.Element => (
          <Button
            disabled={!trimestreData.trim && !simplesData.simples.id}
          >
              Imprimir
          </Button>
        )}
        onBeforePrint={() : void => { document.title = `${empresa.numeroSistema} PLANILHA ${competencia.mes}-${competencia.ano}`; }}
        onAfterPrint={() : void => { document.title = 'DANFY'; }}
        content={() : any => printRef.current}
        pageStyle={printStyle}
      />
      <div style={{ display: 'none' }}>
        <div
          ref={printRef}
        >
          <div style={{ fontSize: '1px', color: 'white' }}>
            {`${cnpjMask(empresa.cnpj)}`}
            <br />
            {`${pegaMes(parseInt(competencia.mes, 10) as MesesNum)}/${competencia.ano}`}
          </div>
          <h2
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '2%',
            }}
          >
            {`(${empresa.numeroSistema}) ${empresa.nome} - ${cnpjMask(empresa.cnpj)}`}
          </h2>
          <h3
            style={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            {`Competência: ${pegaMes(parseInt(competencia.mes, 10) as MesesNum)}/${competencia.ano}`}
          </h3>
          <Row type="flex" justify="center">
            {
              temMovimento
              && (
                <>
                  <Divider orientation="left">Relatório de Vendas</Divider>
                  <Col span={24} className="tables">
                    <MovimentosTable printable />
                  </Col>
                </>
              )
            }
            {
              temServico
              && (
                <>
                  <Divider orientation="left">Relatório de Serviços Prestados</Divider>
                  <Col span={24} className="tables">
                    <ServicosTable printable />
                  </Col>
                </>
              )

            }
            {
              grupos.length > 0
              && (
                <>
                  <Divider orientation="left">Divisão</Divider>
                  <Col span={24} className="tables">
                    <GruposTable printable />
                  </Col>
                </>
              )
            }
            {
              trimestreData.trim
              && (
                <>
                  <Divider orientation="left">Relatório de Guias</Divider>
                  <Col span={24} className="small tables">
                    <GuiasTable printable />
                  </Col>
                  <Divider orientation="left">Acumulados</Divider>
                  <Col span={24} className="small tables">
                    <AcumuladosTable printable />
                  </Col>
                </>
              )
            }
            {
              temTabelaCotas(empresa, competencia)
              && trimestreData.trim
              && (
                <>
                  <Divider orientation="left">Cotas</Divider>
                  <Col span={24} className="small tables">
                    <CotasTable printable />
                  </Col>
                </>
              )
            }
            {
              empresa.simples && simplesData.simples.id
              && (
                <>
                  <Divider orientation="left">Receitas (Simples)</Divider>
                  <SimplesTable printable />
                </>
              )
            }
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Connect(Printer);
