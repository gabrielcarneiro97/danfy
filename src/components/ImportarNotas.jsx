import React from 'react';
import { Steps, Button, Icon } from 'antd';

import { EnviarArquivos, AdicionarEmpresa } from '.';
import { pegarDominio } from '../services';

import './ImportarNotas.css';

const { Step } = Steps;

class ImportarNotas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      envio: false,
      notas: null,
      adicionar: false,
      adicionarArray: [],
    };
  }

  fimEnvio = (notas) => {
    this.setState({ notas }, () => {
      this.setState({ envio: this.state.notas.nfe.length > 0 || this.state.notas.nfse.length > 0 });
    });
  }

  steps = [
    {
      title: 'Enviar Arquivos',
      content: <EnviarArquivos onEnd={this.fimEnvio} />,
      icon: <Icon type="file-add" />,
    },
    {
      title: 'Conciliar Movimentos',
      content: 'Second-content',
      icon: <Icon type="check-square-o" />,
    },
  ];

  okModal = () => {
    const current = this.state.current + 1;
    this.setState({ current, adicionar: false });
  }

  proximo = () => {
    pegarDominio().then(({ empresas }) => {
      const dominioArray = Object.values(empresas);
      const pessoasArray = Object.keys(this.state.notas.pessoas);
      const adicionarArray = [];

      pessoasArray.forEach((pessoaId) => {
        if (pessoaId.length === 14) {
          if (!dominioArray.includes(pessoaId)) {
            const pessoa = this.state.notas.pessoas[pessoaId];
            pessoa.cnpj = pessoaId;
            adicionarArray.push(pessoa);
          }
        }
      });
      if (adicionarArray.length > 0) {
        console.log(adicionarArray);
        this.setState({ adicionar: true, adicionarArray });
      } else {
        this.okModal();
      }
    }).catch(err => console.error(err));
  }

  render = () => {
    const { current } = this.state;
    return (
      <div>
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
            this.state.current < this.steps.length - 1
            &&
            <Button type="primary" onClick={() => this.proximo()} disabled={!this.state.envio}>Conciliar</Button>
          }
          {
            this.state.current === this.steps.length - 1
            &&
            <Button type="primary">Done</Button>
          }
        </div>
        <div className="steps-content">{this.steps[this.state.current].content}</div>
      </div>
    );
  }
}

export default ImportarNotas;
