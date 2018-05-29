import React from 'react';
import { Steps, Button, Icon } from 'antd';

import { EnviarArquivos, AdicionarEmpresa, ConciliarMovimentos, ConciliarServicos } from '.';
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
      dominio: [],
    };
  }

  fimEnvio = (notas) => {
    this.setState({ notas }, () => {
      this.setState({ envio: this.state.notas.nfe.length > 0 || this.state.notas.nfse.length > 0 });
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

  okModal = () => {
    const current = this.state.current + 1;
    this.steps[1].content = <ConciliarMovimentos dominio={this.dominio} dados={this.state.notas} />;
    this.setState({ current, adicionar: false });
  }

  paraMovimentos = () => {
    pegarDominio().then(({ empresas }) => {
      const dominioArray = Object.values(empresas);
      const pessoasArray = Object.keys(this.state.notas.pessoas);
      const adicionarArray = [];

      this.setState({ dominio: empresas });

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
        this.setState({ adicionar: true, adicionarArray });
      } else {
        this.okModal();
      }
    }).catch(err => console.error(err));
  }

  paraServicos = () => {
    const current = this.state.current + 1;
    this.steps[2].content = <ConciliarServicos dominio={this.dominio} dados={this.state.notas} />;
    this.setState({ current });
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
            this.state.current === 0
            &&
            <Button type="primary" onClick={() => this.paraMovimentos()} disabled={!this.state.envio}>Próximo</Button>
          }
          {
            this.state.current === 1
            &&
            <Button type="primary" onClick={() => this.paraServicos()} disabled={!this.state.envio}>Próximo</Button>
          }
          {
            this.state.current === this.steps.length - 1
            &&
            <Button type="primary">Enviar</Button>
          }
        </div>
        <div className="steps-content">{this.steps[this.state.current].content}</div>
      </div>
    );
  }
}

export default ImportarNotas;
