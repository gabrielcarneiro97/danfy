import React from 'react';
import { Modal, Table } from 'antd';
import PropTypes from 'prop-types';
import { AliquotasEmpresa } from '.';

class AdicionarEmpresa extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    handleOk: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    dados: PropTypes.arrayOf(PropTypes.shape({
      cnpj: PropTypes.string,
      nome: PropTypes.string,
      endereco: PropTypes.object,
    })).isRequired,
  }

  static columns = [{
    title: 'Nome',
    dataIndex: 'nome',
    key: 'nome',
  }, {
    title: 'CNPJ',
    dataIndex: 'cnpj',
    key: 'cnpj',
  }, {
    title: 'Adicionar?',
    dataIndex: 'adicionar',
    key: 'adicionar',
  }];

  state = {
    dataTable: [],
    hasDone: [],
  };


  handleEnd = (cnpj) => {
    const { hasDone } = this.state;
    const dataTable = this.state.dataTable.filter(el => el.cnpj !== cnpj);
    hasDone.push(cnpj);

    this.setState({ dataTable, hasDone });
  };

  render() {
    const { dados } = this.props;
    const { dataTable } = this.state;


    dados.forEach(({ cnpj, nome }) => {
      if (!this.state.hasDone.includes(cnpj) && dataTable.filter(el => el.key === `${cnpj}-table`).length === 0) {
        const dadosEmpresa = {
          nome,
          cnpj,
        };

        const adicionar = (
          <AliquotasEmpresa dados={dadosEmpresa} onEnd={this.handleEnd}>
            Adicionar
          </AliquotasEmpresa>
        );

        const row = {
          key: `${cnpj}-table`,
          adicionar,
          ...dadosEmpresa,
        };

        dataTable.push(row);
      }
    });

    return (
      <div>
        <Modal
          title="Adicionar Empresas"
          visible={this.props.visible}
          onOk={this.props.handleOk}
          onCancel={this.props.handleCancel}
          style={{ minWidth: '50vw' }}
        >
          <Table
            dataSource={this.state.dataTable}
            columns={AdicionarEmpresa.columns}
            style={{ overflow: 'auto', maxHeight: '50vh' }}
          />
        </Modal>
      </div>
    );
  }
}

export default AdicionarEmpresa;
