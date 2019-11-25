import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Input,
  Row,
  Col,
  Select,
  Checkbox,
  Divider,
  message,
} from 'antd';

import {
  adicionarEmpresaDominio,
  adicionarEmpresaImpostos,
  cnpjMask,
  pegarDominio,
} from '../services';

import Connect from '../store/Connect';

import { carregarDominio } from '../store/clientes';

const { Option } = Select;

const aliquotasPadrao = {
  icmsAliquota: 0.18,
  icmsReducao: 0.2778,
  pis: 0.0065,
  cofins: 0.03,
  csll: 0.0288,
  irpj: 0.048,
  iss: 0.03,
};

const aliquotasLiminar = {
  icmsAliquota: 0.18,
  icmsReducao: 0.2778,
  pis: 0.0065,
  cofins: 0.03,
  csll: 0.0108,
  irpj: 0.012,
  iss: 0.03,
};

function AdicionarClienteForm(props) {
  const {
    empresaDados,
    store,
    onEnd,
    dispatch,
  } = props;
  const { cpfcnpj, nome } = empresaDados;
  const { dominio } = store;

  const [numero, setNumero] = useState('');
  const [impostosEmpresa, setImpostosEmpresa] = useState(aliquotasPadrao);
  const [tributacao, setTributacao] = useState('LP');
  const [formaPagamento, setFormaPagamento] = useState('adiantamento');

  const [enviarDisabled, setEnviarDisabled] = useState(true);

  useEffect(() => {
    setEnviarDisabled(
      Number.isNaN(parseInt(numero, 10))
      || parseInt(numero, 10) < 0
      || parseFloat(impostosEmpresa.iss) < 0,
    );
  }, [numero, impostosEmpresa.iss]);

  const setLiminar = (e) => {
    const liminar = e.target.checked;
    if (liminar) setImpostosEmpresa(aliquotasLiminar);
    else setImpostosEmpresa(aliquotasPadrao);
  };

  const setIss = (e) => {
    const iss = e.target.value;
    setImpostosEmpresa({ ...impostosEmpresa, iss });
  };

  const enviar = () => {
    if (dominio.find((e) => e.numero === numero)) {
      message.error(`Número ${numero} já utilizado!`);
      return;
    }

    setEnviarDisabled(true);

    const aliquotas = {
      ...impostosEmpresa,
      formaPagamento,
      tributacao,
      donoCpfcnpj: cpfcnpj,
      ativo: true,
    };

    Promise.all([
      adicionarEmpresaDominio(cpfcnpj, numero),
      adicionarEmpresaImpostos(aliquotas),
    ]).then(() => {
      pegarDominio().then((dom) => {
        dispatch(carregarDominio(dom));
        setEnviarDisabled(false);
        message.success(`Empresa ${nome} adicionada ao número ${numero} com sucesso!`);
      });
      onEnd();
    }).catch(console.error);
  };

  return (
    <>
      <Row
        gutter={8}
        className="row"
      >
        <Col span={12}>
          <Input addonBefore="Nome" value={nome} disabled />
        </Col>
        <Col span={12}>
          <Input addonBefore="CNPJ" value={cnpjMask(cpfcnpj)} disabled />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Divider>Informações Gerais</Divider>
          <Row
            gutter={8}
            className="row"
          >
            <Col span={12}>
              <Input addonBefore="Número" defaultValue={numero} onChange={(e) => setNumero(e.target.value)} />
            </Col>
            <Col span={12}>
              <Select onChange={setTributacao} defaultValue={tributacao} style={{ width: '100%' }}>
                <Option value="LP">Lucro Presumido</Option>
                <Option value="SN">Simples Nacional</Option>
              </Select>
            </Col>
          </Row>
          <Row className="row">
            <Col span={12} style={{ marginTop: '5px', marginBottom: '5px' }}>
              <Checkbox
                onChange={setLiminar}
                style={{
                  width: '100%',
                }}
              >
                Liminar de Redução
              </Checkbox>
            </Col>
            <Col span={12}>
              <Select onChange={setFormaPagamento} defaultValue={formaPagamento} style={{ width: '100%' }}>
                <Option value="adiantamento">Adiantamento</Option>
                <Option value="acumulado">Acumulado por Trimestre</Option>
                <Option value="cotas">Pagamento em Cotas</Option>
              </Select>
            </Col>
          </Row>
          <Divider dashed>Impostos Estaduais (ICMS)</Divider>
          <Row
            gutter={8}
            className="row"
          >
            <Col span={12}>
              <Input addonBefore="Aliquota" value={impostosEmpresa.icmsAliquota} disabled />
            </Col>
            <Col span={12}>
              <Input addonBefore="Redução" value={impostosEmpresa.icmsReducao} disabled />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Divider dashed>Impostos Federais</Divider>
          <Row
            gutter={8}
            className="row"
          >
            <Col span={12}>
              <Input addonBefore="IRPJ" value={impostosEmpresa.irpj} disabled />
            </Col>
            <Col span={12}>
              <Input addonBefore="CSLL" value={impostosEmpresa.csll} disabled />
            </Col>
          </Row>
          <Row
            gutter={8}
            className="row"
          >
            <Col span={12}>
              <Input addonBefore="PIS" value={impostosEmpresa.pis} disabled />
            </Col>
            <Col span={12}>
              <Input addonBefore="COFINS" value={impostosEmpresa.cofins} disabled />
            </Col>
          </Row>
          <Divider dashed>Impostos Municipais</Divider>
          <Row
            gutter={8}
            className="row"
          >
            <Col span={24}>
              <Input addonBefore="ISS" defaultValue={impostosEmpresa.iss} onChange={setIss} />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row type="flex" justify="end">
        <Divider />
        <Button
          onClick={enviar}
          disabled={enviarDisabled}
          type="primary"
        >
          Cadastrar
        </Button>
      </Row>
    </>
  );
}

AdicionarClienteForm.propTypes = {
  empresaDados: PropTypes.shape({
    cpfcnpj: PropTypes.string,
    nome: PropTypes.string,
  }),
  store: PropTypes.shape({
    dominio: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  onEnd: PropTypes.func,
};

AdicionarClienteForm.defaultProps = {
  empresaDados: {
    cpfcnpj: '',
    nome: '',
  },
  onEnd: () => true,
};


export default Connect(AdicionarClienteForm);
