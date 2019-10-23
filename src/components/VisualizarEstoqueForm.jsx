import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Button,
  Row,
  Col,
  DatePicker,
} from 'antd';
import axios from 'axios';

import {
  pegarDominio,
  pegarPessoaId,
  cnpjMask,
  api,
} from '../services';

import Connect from '../store/Connect';
import { carregarEstoque, carregarInfosGerais } from '../store/estoque';

import './VisualizarForm.css';

function VisualizarEstoqueForm(props) {
  const { dispatch, store, printer } = props;
  const { estoqueInfosGerais } = store;
  const { diaMesAno, cnpj, nome } = estoqueInfosGerais;

  const [num, setNum] = useState(estoqueInfosGerais.numeroSistema);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [disableNum, setDisableNum] = useState(true);
  const [dominio, setDominio] = useState([]);

  useEffect(() => {
    pegarDominio().then((dom) => {
      setDominio(dom);
      setDisableNum(false);
    });
  });


  const pegarEstoque = async () => {
    setSubmitLoading(true);
    const { data } = await axios.get(`${api}/estoque/${estoqueInfosGerais.cnpj}`, {
      params: {
        data: estoqueInfosGerais.diaMesAno.format('DD-MM-YYYY'),
      },
    });

    dispatch(carregarEstoque(data));

    setSubmitLoading(false);
    return true;
  };

  const atualizarEstoque = async () => {
    setUpdateLoading(true);
    const { data } = await axios.put(
      `${api}/estoque/${estoqueInfosGerais.cnpj}`,
      {}, {
        params: {
          data: estoqueInfosGerais.diaMesAno.format('DD-MM-YYYY'),
        },
      },
    );

    dispatch(carregarEstoque(data.estoqueAtualizado));

    setUpdateLoading(false);
    return true;
  };

  const handleData = (data) => {
    dispatch(carregarInfosGerais({ diaMesAno: data }));
  };

  const handleNum = async (e) => {
    const inputNum = e.target.value;
    const empresa = dominio.find((o) => o.numero === inputNum);
    if (empresa) {
      const { cnpj: empCnpj } = empresa;
      try {
        const pessoaPg = await pegarPessoaId(empCnpj);

        const pessoa = {
          nome: pessoaPg.nome,
          cnpj: empCnpj,
          numeroSistema: num,
        };

        dispatch(carregarInfosGerais(pessoa));
        setNum(inputNum);
      } catch (err) {
        dispatch(carregarInfosGerais({
          numeroSistema: '',
          nome: '',
          cnpj: '',
        }));
        setNum(inputNum);
        console.error(err);
      }
    } else {
      dispatch(carregarInfosGerais({
        numeroSistema: '',
        nome: '',
        cnpj: '',
      }));
      setNum(inputNum);
    }
  };

  const disabled = !(diaMesAno && cnpj) || submitLoading || updateLoading;

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
          <DatePicker onChange={handleData} value={diaMesAno} placeholder="Data" format="DD-MM-YYYY" />
        </Col>
        <Col span={10} className="form-input">
          <Input addonBefore="Nome" value={nome} disabled />
        </Col>
        <Col span={6} className="form-input">
          <Input addonBefore="CNPJ" value={cnpjMask(cnpj)} disabled />
        </Col>
      </Row>
      <Row
        type="flex"
        justify="end"
        gutter={16}
      >
        <Col
          style={{
            marginTop: '5px',
          }}
        >
          {printer}
        </Col>
        <Col
          style={{
            marginTop: '5px',
          }}
        >
          <Button
            onClick={atualizarEstoque}
            disabled={disabled}
            loading={updateLoading}
          >
              Atualizar
          </Button>
        </Col>
        <Col
          style={{
            marginTop: '5px',
          }}
        >
          <Button
            type="primary"
            onClick={pegarEstoque}
            disabled={disabled}
            loading={submitLoading}
          >
            Selecionar
          </Button>
        </Col>
      </Row>
    </>
  );
}

VisualizarEstoqueForm.propTypes = {
  store: PropTypes.shape({
    estoqueInfosGerais: PropTypes.object,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  printer: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

VisualizarEstoqueForm.defaultProps = {
  printer: '',
};

export default Connect(VisualizarEstoqueForm);
