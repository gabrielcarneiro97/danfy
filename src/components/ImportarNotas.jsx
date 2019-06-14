import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Steps, Button, Icon, Popconfirm, message } from 'antd';

import { EnviarArquivos, AdicionarEmpresa, ConciliarMovimentos, ConciliarServicos } from '.';
import { pegarDominio, gravarMovimentos, gravarServicos, pegarDominioId } from '../services';

import './ImportarNotas.css';

const { Step } = Steps;

class ImportarNotas extends Component {
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

  fimEnvio = (dados) => {
    this.setState({ dados }, () => {
      this.setState({ envio: this.state.dados.nfe.length > 0 || this.state.dados.nfse.length > 0 });
    });
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

  handleChangeMovimentos = movimentos => this.setState({ movimentos });

  handleChangeServicos = servicos => this.setState({ servicos });

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
    this.setState({ enviando: true }, () => {
      const { movimentos, servicos } = this.state;

      const movimentosParaGravar = {};
      const servicosParaGravar = {};

      movimentos.forEach((movimento) => {
        if (movimento.conferido) {
          const nota = this.getNfe(movimento.notaFinal);

          const empresa = nota.emitente;
          if (!movimentosParaGravar[empresa]) {
            movimentosParaGravar[empresa] = [];
          }
          movimentosParaGravar[empresa].push(movimento);
        }
      });

      servicos.forEach((servico) => {
        if (servico.conferido) {
          const nota = this.getNfse(servico.nota);

          const empresa = nota.emitente;
          if (!servicosParaGravar[empresa]) {
            servicosParaGravar[empresa] = [];
          }
          servicosParaGravar[empresa].push(servico);
        }
      });

      Promise.all([
        gravarMovimentos(movimentosParaGravar),
        gravarServicos(servicosParaGravar),
      ]).then(() => {
        message.success('Tudo gravado com sucesso!');
        this.props.history.push('/app/visualizar');
      });
    });
  }

  render = () => {
    const { current } = this.state;

    return (
      <Fragment>
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
      </Fragment>
    );
  }
}

export default ImportarNotas;
