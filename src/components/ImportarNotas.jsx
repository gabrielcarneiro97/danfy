import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Steps,
  Button,
  Icon,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd';

import {
  EnviarArquivos,
  AdicionarEmpresa,
  ConciliarMovimentos,
  ConciliarServicos,
  ImportarForm,
} from '.';
import { pegarDominio, gravarMovimentos, gravarServicos } from '../services';

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
              <Step title="Conciliar Serviços" icon={<Icon type="customer-service" />} />
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
                  >
                  Anterior
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={current === lastStep || nextDisabled}
                  >
                  Próximo
                  </Button>
                </Col>
                <Col span={2}>
                  <Popconfirm title="Confirmar envio?" okText="Sim" cancelText="Não">
                    <Button
                      type="primary"
                      disabled={!envio}
                    >
                      Enviar
                    </Button>
                  </Popconfirm>
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

class ImportarNotasClass extends Component {
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func,
    }).isRequired,
  }

  state = {
    current: 0,
    envio: false,
    dados: null,
    adicionar: false,
    adicionarArray: [],
    dominio: [],
    movimentos: [],
    movimentosIsLoading: true,
    servicos: [],
    servicosIsLoading: true,
    enviando: false,
  };

  getNfe = chave => (
    this.state.dados.nfe ?
      this.state.dados.nfe.find(el => el.chave === chave) :
      null
  )

  getNfse = chave => (
    this.state.dados.nfse ?
      this.state.dados.nfse.find(el => el.chave === chave) :
      null
  )

  fimEnvio = () => {

  }

  dominio = () => this.state.dominio;

  steps = [
    {
      title: 'Enviar Arquivos',
      content: <EnviarArquivos onEnd={this.fimEnvio} />,
      icon: <Icon type="file-add" />,
    },
    {
      title: 'Conciliar Movimentos',
      content: '',
      icon: <Icon type="car" />,
    },
    {
      title: 'Conciliar Serviços',
      content: '',
      icon: <Icon type="customer-service" />,
    },
  ];

  handleNovaNota = (nota) => {
    const { dados } = this.state;
    dados.nfe.push(nota);
    this.setState({ dados });
  }

  handleChangeMovimentos = (movimentos) => this.setState({ movimentos });

  handleChangeServicos = (servicos) => this.setState({ servicos });

  movimentosLoadEnd = () => this.setState({ movimentosIsLoading: false });

  servicosLoadEnd = () => this.setState({ servicosIsLoading: false });

  okModal = () => {
    const current = this.state.current + 1;
    this.steps[1].content = (<ConciliarMovimentos
      dominio={this.dominio}
      dados={this.state.dados}
      onChange={this.handleChangeMovimentos}
      onLoadEnd={this.movimentosLoadEnd}
      novaNota={this.handleNovaNota}
    />);
    this.steps[2].content = (<ConciliarServicos
      dominio={this.dominio}
      dados={this.state.dados}
      onChange={this.handleChangeServicos}
      onLoadEnd={this.servicosLoadEnd}
    />);
    this.setState({ current, adicionar: false });
  }

  paraMovimentos = async () => {
    try {
      const dominio = await pegarDominio();
      const dominioArray = dominio.map(o => o.cnpj);
      const pessoasArray = this.state.dados.pessoas.map(o => o.cpfcnpj);
      const adicionarArray = [];

      this.setState({ dominio });

      pessoasArray.forEach((pessoaId) => {
        if (pessoaId.length === 14) {
          if (!dominioArray.includes(pessoaId)) {
            const pessoa = this.state.dados.pessoas.find(o => o.cpfcnpj === pessoaId);
            adicionarArray.push(pessoa);
          }
        }
      });
      if (adicionarArray.length > 0) {
        this.setState({ adicionar: true, adicionarArray });
      } else {
        this.okModal();
      }
    } catch (err) {
      console.error(err);
    }
  }

  paraServicos = () => {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  voltar = () => {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  enviar = () => {
    this.setState({ enviando: true }, async () => {
      const { movimentos, servicos } = this.state;

      const movimentosConferidos = movimentos.filter((movPool) => movPool.movimento.conferido);
      const servicosConferidos = servicos.filter((servPool) => servPool.servico.conferido);

      try {
        await Promise.all([
          gravarMovimentos(movimentosConferidos),
          gravarServicos(servicosConferidos),
        ]);
      } catch (err) {
        console.error(err);
      }

      message.success('Tudo gravado com sucesso!');
      this.props.history.push('/app/visualizar');
    });
  }

  render = () => {
    const { current } = this.state;

    return (
      <ImportacaoStore>
        <AdicionarEmpresa
          visible={this.state.adicionar}
          dados={this.state.adicionarArray}
          handleCancel={() => { this.setState({ adicionar: false }); }}
          handleOk={this.okModal}
        />
        <Steps current={current}>
          {this.steps.map(item => <Step key={item.title} title={item.title} icon={item.icon} />)}
        </Steps>
        <div className="steps-action">
          {
            this.state.current === 0
            &&
            <Button type="primary" onClick={this.paraMovimentos} disabled={!this.state.envio}>Próximo</Button>
          }
          {
            this.state.current === 1
            &&
            <Popconfirm title="Tem certeza que deseja proseguir?" onConfirm={this.paraServicos} okText="Sim" cancelText="Não">
              <Button type="primary" disabled={this.state.movimentosIsLoading}>Próximo</Button>
            </Popconfirm>
          }
          {
            this.state.current === this.steps.length - 1
            &&
            <Button type="primary" onClick={this.enviar} disabled={this.state.servicosIsLoading || this.state.enviando}>Enviar</Button>
          }
        </div>
        <div className="steps-content">{this.steps[this.state.current].content}</div>
      </ImportacaoStore>
    );
  }
}

export default ImportarNotas;
