import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Button,
  Row,
  Col,
  DatePicker,
} from 'antd';

import moment from 'moment';

import PrintEstoque from './PrintEstoque';

import {
  pegarDominio,
  pegarPessoaId,
  getEstoque,
  atualizarEstoque,
} from '../services/api.service';

import { cnpjMask } from '../services/calculador.service';

import Connect from '../store/Connect';
import { carregarEstoque, carregarInfosGerais } from '../store/estoque';

import './VisualizarForm.css';
import { EstoqueStore, Dominio } from '../types';

type propTypes = {
  store : EstoqueStore;
  dispatch : Function;
}

function VisualizarEstoqueForm(props : propTypes) : JSX.Element {
  const { dispatch, store } = props;
  const { estoqueInfosGerais } = store;
  const { diaMesAno, cnpj, nome } = estoqueInfosGerais;

  const [num, setNum] = useState(estoqueInfosGerais.numeroSistema);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [disableNum, setDisableNum] = useState(true);
  const [dominio, setDominio] = useState(new Array<Dominio>());

  useEffect(() => {
    pegarDominio().then((dom) => {
      setDominio(dom);
      setDisableNum(false);
    });
  }, []);


  const pegarEstoque = async () : Promise<boolean> => {
    setSubmitLoading(true);
    const estoque = await getEstoque(estoqueInfosGerais);

    dispatch(carregarEstoque(estoque));

    setSubmitLoading(false);
    return true;
  };

  const atualizar = async () : Promise<boolean> => {
    setUpdateLoading(true);
    const data = await atualizarEstoque(estoqueInfosGerais);

    dispatch(carregarEstoque(data.estoqueAtualizado));

    setUpdateLoading(false);
    return true;
  };

  const handleData = (data : moment.Moment | null) : void => {
    dispatch(carregarInfosGerais({ diaMesAno: data }));
  };

  const handleNum = async (e : React.ChangeEvent<HTMLInputElement>) : Promise<void> => {
    const inputNum = e.target.value;
    setNum(inputNum);
    const empresa = dominio.find((o) => o.numero === inputNum);
    if (empresa) {
      const { cnpj: empCnpj } = empresa;
      try {
        const pessoaPg = await pegarPessoaId(empCnpj);

        const pessoa = {
          nome: pessoaPg.nome,
          cnpj: empCnpj,
          numeroSistema: inputNum,
        };

        dispatch(carregarInfosGerais(pessoa));
      } catch (err) {
        dispatch(carregarInfosGerais({
          numeroSistema: '',
          nome: '',
          cnpj: '',
        }));
        console.error(err);
      }
    } else {
      dispatch(carregarInfosGerais({
        numeroSistema: '',
        nome: '',
        cnpj: '',
      }));
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
          <Input addonBefore="CNPJ" value={cnpjMask(cnpj || '')} disabled />
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
          <PrintEstoque />
        </Col>
        <Col
          style={{
            marginTop: '5px',
          }}
        >
          <Button
            onClick={atualizar}
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

export default Connect(VisualizarEstoqueForm);
