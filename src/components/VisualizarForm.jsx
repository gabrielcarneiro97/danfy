import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Input,
  Button,
  Row,
  Col,
  DatePicker,
} from 'antd';

import qs from 'qs';

import { useLocation } from 'react-router-dom';

import Printer from './Printer';

import {
  pegarSimples,
  pegarTrimestre,
  pegarDominio,
  pegarPessoaId,
  pegarEmpresaImpostos,
  cnpjMask,
  recalcularSimples,
  getGrupos,
} from '../services';

import Connect from '../store/Connect';
import {
  carregarDominio,
  carregarMovimento,
  carregarCompetencia,
  carregarEmpresa,
  carregarGrupos,
  limparDados,
} from '../store/movimento';

import './VisualizarForm.css';

const { MonthPicker } = DatePicker;

function VisualizarForm(props) {
  const { store, dispatch } = props;
  const {
    dominio,
    empresa,
    competencia,
    trimestreData,
    simplesData,
  } = store;

  const { search } = useLocation();

  const { numParam, compParam } = qs.parse(search, { ignoreQueryPrefix: true });

  const monthPicker = useRef();

  const { movimentosPool, servicosPool } = empresa.simples ? simplesData : trimestreData;

  const [num, setNum] = useState('');
  const [submit, setSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disableNum, setDisableNum] = useState(true);
  const [acheiEmpresa, setAcheiEmpresa] = useState(false);
  const [getFromParams, setGetFromParams] = useState(false);
  const [disableRecalc, setDisableRecalc] = useState(true);

  const handleDate = (e, mesAno) => {
    if (!mesAno) dispatch(carregarCompetencia({ mes: '', ano: '' }));
    else {
      const [mes, ano] = mesAno.split('-');
      dispatch(carregarCompetencia({ ano, mes: parseInt(mes, 10).toString() }));
    }

    setSubmit(false);
  };

  const handleNum = async (e) => {
    const numInput = (e.target && e.target.value) || '';

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

        emp.formaPagamento = emp.simples ? 'SIMPLES NACIONAL' : {
          adiantamento: 'LUCRO PRESSUMIDO - PAGAMENTO ANTECIPADO',
          cotas: 'LUCRO PRESSUMIDO - PAGAMENTO EM COTAS',
          acumulado: 'LUCRO PRESSUMIDO - PAGAMENTO ACUMULADO NO FINAL DO TRIMESTRE',
        }[aliquota.formaPagamento];

        dispatch(carregarEmpresa(emp));
        setAcheiEmpresa(true);
      } catch (err) {
        const emp = {
          numeroSistema: '',
          nome: '',
          formaPagamento: '',
          cnpj: '',
          simples: false,
        };
        dispatch(carregarEmpresa(emp));
        setAcheiEmpresa(false);
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
      setAcheiEmpresa(false);
    }

    setSubmit(false);
  };

  const handleSubmit = async () => {
    setSubmit(false);
    setLoading(true);

    const dados = empresa.simples
      ? await pegarSimples(empresa.cnpj, competencia)
      : await pegarTrimestre(empresa.cnpj, competencia);

    if (dados) {
      const grupos = await getGrupos(empresa.cnpj);
      dispatch(carregarGrupos(grupos));
      dispatch(carregarMovimento(dados));
    }

    setDisableRecalc(false);
    setSubmit(true);
    setLoading(false);
  };

  const recalcular = async () => {
    setDisableRecalc(true);
    const simples = await recalcularSimples(empresa.cnpj, competencia);
    dispatch(carregarMovimento(simples));
    setDisableRecalc(false);
  };

  useEffect(() => {
    pegarDominio().then((dominioRes) => {
      dispatch(carregarDominio(dominioRes));
      setDisableNum(false);
    });
  }, []);

  useEffect(() => {
    if (numParam && compParam && dominio.length > 0) {
      monthPicker.current.picker.handleChange(moment(compParam, 'MM-YYYY'));
      (async () => {
        await handleNum({ target: { value: numParam } });
        await handleDate(null, compParam);
        setGetFromParams(true);
      })();
    }
  }, [dominio]);

  useEffect(() => {
    if (getFromParams) handleSubmit();
  }, [getFromParams]);

  useEffect(() => {
    if (empresa.cnpj && competencia.mes && competencia.ano) {
      setSubmit(true);
    } else if ((movimentosPool.length >= 0 || servicosPool.length >= 0)) {
      dispatch(limparDados());
    }
  }, [num, competencia, acheiEmpresa]);

  useEffect(() => {
    if (empresa.cnpj) {
      setDisableRecalc(true);
      dispatch(limparDados());
    }
  }, [competencia, num]);

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
          <MonthPicker
            onChange={handleDate}
            placeholder="Selecione o Mês"
            format="MM-YYYY"
            ref={monthPicker}
          />
        </Col>
        <Col span={16} className="form-input">
          <Input addonBefore="Nome" value={empresa.nome} disabled />
        </Col>
        <Col span={8} className="form-input">
          <Input addonBefore="CNPJ" value={cnpjMask(empresa.cnpj)} disabled />
        </Col>
        <Col span={16} className="form-input">
          <Input addonBefore="Tributação" value={empresa.formaPagamento} disabled />
        </Col>
      </Row>
      <Row
        type="flex"
        justify="end"
        gutter={16}
      >
        {
          empresa.simples
          && (
            <Col className="form-input">
              <Button onClick={recalcular} disabled={disableRecalc}>
                Recalcular Mês
              </Button>
            </Col>
          )
        }
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
    grupos: PropTypes.array,
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
    trimestreData: PropTypes.object,
    simplesData: PropTypes.object,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Connect(VisualizarForm);
