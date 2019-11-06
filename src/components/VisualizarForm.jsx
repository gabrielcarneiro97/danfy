import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Button,
  Row,
  Col,
  DatePicker,
} from 'antd';

import {
  Printer,
} from '.';

import {
  pegarTrimestre,
  pegarDominio,
  pegarPessoaId,
  pegarEmpresaImpostos,
  cnpjMask,
} from '../services';

import Connect from '../store/Connect';
import {
  carregarDominio,
  carregarMovimento,
  carregarCompetencia,
  carregarEmpresa,
} from '../store/movimento';

import './VisualizarForm.css';

const { MonthPicker } = DatePicker;

function VisualizarForm(props) {
  const { store, dispatch } = props;
  const { dominio, empresa, competencia } = store;

  const [num, setNum] = useState('');
  const [submit, setSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disableNum, setDisableNum] = useState(true);

  useEffect(() => {
    pegarDominio().then((dominioRes) => {
      dispatch(carregarDominio(dominioRes));
      setDisableNum(false);
    });
  }, [disableNum]);

  useEffect(() => {
    if (empresa.cnpj && competencia.mes && competencia.ano && !submit) {
      setSubmit(true);
    }
  }, [num, competencia]);

  const handleSubmit = async () => {
    setSubmit(false);
    setLoading(true);

    const dados = await pegarTrimestre(empresa.cnpj, competencia);

    dispatch(carregarMovimento(dados));

    setSubmit(true);
    setLoading(false);
  };

  const handleDate = (e, mesAno) => {
    if (!mesAno) dispatch(carregarCompetencia({ mes: '', ano: '' }));
    else {
      const [mes, ano] = mesAno.split('-');
      dispatch(carregarCompetencia({ ano, mes: parseInt(mes, 10).toString() }));
    }

    setSubmit(false);
  };

  const handleNum = async (e) => {
    const numInput = e.target.value;
    setNum(numInput);

    const empresaSelected = dominio.find((o) => o.numero === numInput);
    if (empresaSelected) {
      const { cnpj } = empresaSelected;
      try {
        const [pessoaPg, aliquota] = await Promise.all([
          pegarPessoaId(cnpj), pegarEmpresaImpostos(cnpj),
        ]);

        const emp = {
          nome: pessoaPg.nome,
          simples: aliquota.tributacao === 'SN',
          cnpj,
          numeroSistema: numInput,
        };

        if (aliquota.formaPagamento === 'adiantamento') {
          emp.formaPagamento = 'PAGAMENTO ANTECIPADO';
        } else if (aliquota.formaPagamento === 'cotas') {
          emp.formaPagamento = 'PAGAMENTO EM COTAS';
        } else if (aliquota.formaPagamento === 'acumulado') {
          emp.formaPagamento = 'PAGAMENTO ACUMULADO NO FINAL DO TRIMESTRE';
        }

        dispatch(carregarEmpresa(emp));
      } catch (err) {
        const emp = {
          numeroSistema: '',
          nome: '',
          formaPagamento: '',
          cnpj: '',
          simples: false,
        };
        dispatch(carregarEmpresa(emp));
        console.error(err);
      }
    } else {
      const emp = {
        numeroSistema: '',
        nome: '',
        formaPagamento: '',
        cnpj: '',
        simples: false,
      };
      dispatch(carregarEmpresa(emp));
    }

    setSubmit(false);
  };

  return (
    <>
      <Row
        gutter={10}
        justify="center"
        type="flex"
      >
        <Col span={4} className="form-input">
          <Input
            addonBefore="Número"
            onChange={handleNum}
            value={num}
            disabled={disableNum}
          />
        </Col>
        <Col span={4} className="form-input">
          <MonthPicker onChange={handleDate} placeholder="Selecione o Mês" format="MM-YYYY" />
        </Col>
        <Col span={16} className="form-input">
          <Input addonBefore="Nome" value={empresa.nome} disabled />
        </Col>
        <Col span={8} className="form-input">
          <Input addonBefore="CNPJ" value={cnpjMask(empresa.cnpj)} disabled />
        </Col>
        <Col span={16} className="form-input">
          <Input addonBefore="Forma de Pagamento Trimestrais" value={empresa.formaPagamento} disabled />
        </Col>
      </Row>
      <Row
        type="flex"
        justify="end"
        gutter={16}
      >
        <Col
          className="form-input"
        >
          <Printer />
        </Col>
        <Col
          className="form-input"
        >
          <Button type="primary" onClick={handleSubmit} disabled={!submit} loading={loading}>Selecionar</Button>
        </Col>
      </Row>
    </>
  );
}

VisualizarForm.propTypes = {
  store: PropTypes.shape({
    dominio: PropTypes.array,
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      formaPagamento: PropTypes.string,
      cnpj: PropTypes.string,
      simples: PropTypes.bool,
    }),
    competencia: PropTypes.shape({
      mes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      ano: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Connect(VisualizarForm);
