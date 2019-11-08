import React, { useState } from 'react';
import {
  Steps,
  Button,
  Icon,
  Row,
  Col,
} from 'antd';

import {
  EnviarArquivos,
  ConciliarMovimentos,
  ConciliarServicos,
  ImportarForm,
  EnvioFimButton,
} from '.';

import './ImportarNotas.css';

import { ImportacaoStore } from '../store/Store';

const { Step } = Steps;

function ImportarNotas() {
  const [current, setCurrent] = useState(0);
  const [temEmpresa, setTemEmpresa] = useState(false);
  const [envio, setEnvio] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(true);

  const lastStep = 2;

  const nextStep = () => {
    const next = current + 1;
    if (next === lastStep) setEnvio(true);
    setCurrent(next);
  };
  const prevStep = () => setCurrent(current - 1);

  return (
    <ImportacaoStore>
      <ImportarForm onSubmit={() => setTemEmpresa(true)} />
      {
        temEmpresa
        && (
          <>
            <Steps current={current}>
              <Step title="Enviar Arquivos" icon={<Icon type="file-add" />} />
              <Step title="Conciliar Movimentos" icon={<Icon type="car" />} />
              <Step title="Conciliar Serviços" icon={<Icon type="tool" />} />
            </Steps>
            <div className="steps-action">
              <Row
                justify="end"
                type="flex"
                style={{
                  marginBottom: '5%',
                }}
              >
                <Col span={4}>
                  <Button
                    onClick={prevStep}
                    disabled={current === 0}
                    icon="left"
                    shape="circle"
                  />
                  &nbsp;
                  <Button
                    onClick={nextStep}
                    disabled={current === lastStep || nextDisabled}
                    icon="right"
                    shape="circle"
                  />
                </Col>
                <Col span={2}>
                  <EnvioFimButton disabled={!envio} />
                </Col>
              </Row>
            </div>
            <div className="steps-content">
              {
                current === 0
                && (
                  <EnviarArquivos onEnd={() => setNextDisabled(false)} />
                )
              }
              {
                current === 1
                && (
                  <ConciliarMovimentos />
                )
              }
              {
                current === 2
                && (
                  <ConciliarServicos />
                )
              }
            </div>
          </>
        )
      }
    </ImportacaoStore>
  );
}

export default ImportarNotas;
