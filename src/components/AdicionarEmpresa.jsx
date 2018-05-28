import React from 'react';
import { Modal, Table, Button } from 'antd';
import PropTypes from 'prop-types';

const columns = [{
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

function AdicionarEmpresa(props) {
  const dataTable = [];

  props.dados.forEach(({ cnpj, nome }, id) => {
    const adicionar = <Button size="small">Adicionar</Button>;

    const row = {
      key: `${id}-table`,
      cnpj,
      nome,
      adicionar,
    };

    dataTable.push(row);
  });

  return (
    <div>
      <Modal
        title="Adicionar Empresas"
        visible={props.visible}
        onOk={props.handleOk}
        onCancel={props.handleCancel}
        style={{ minWidth: '50vw' }}
      >
        <Table
          dataSource={dataTable}
          columns={columns}
          style={{ overflow: 'auto', maxHeight: '50vh' }}
        />
      </Modal>
    </div>
  );
}

AdicionarEmpresa.propTypes = {
  visible: PropTypes.bool.isRequired,
  handleOk: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  dados: PropTypes.arrayOf(PropTypes.shape({
    cnpj: PropTypes.string,
    nome: PropTypes.string,
    endereco: PropTypes.object,
  })).isRequired,
};

export default AdicionarEmpresa;
