import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Row,
  Col,
  message,
} from 'antd';

import { CompactPicker, ColorResult } from 'react-color';

import colors from '../assets/colors';

import { getGrupos, editarGrupo, criarGrupo } from '../services/api.service';

import { carregarGrupos } from '../store/clientes';

import Connect from '../store/Connect';
import { ClientesStore, GrupoLite } from '../types';

type propTypes = {
  store : ClientesStore;
  dispatch : Function;
  onClose? : (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  visible? : boolean;
  title? : string;
  okText? : string;
  defaultData? : GrupoLite;
}


function EditarGrupoModal(props : propTypes) : JSX.Element {
  const {
    dispatch,
    store,
    onClose,
    visible = false,
    title = 'Modal',
    okText = 'Ok',
    defaultData = {
      id: '',
      nome: '',
      cor: '',
      descricao: '',
    },
  } = props;

  const { empresa } = store;
  const { cnpj } = empresa;

  const [okDisabled, setOkDisabled] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  const [id, setId] = useState(defaultData.id);
  const [nome, setNome] = useState(defaultData.nome);
  const [descricao, setDescricao] = useState(defaultData.descricao);
  const [cor, setCor] = useState(defaultData.cor);

  useEffect(() => {
    if (nome !== '' && descricao !== '' && cor !== '') setOkDisabled(false);
  }, [nome, descricao, cor]);

  useEffect(() => {
    if (visible) {
      setId(defaultData.id);
      setNome(defaultData.nome);
      setDescricao(defaultData.descricao);
      setCor(defaultData.cor);
    }
  }, [visible]);

  const limparDados = () : void => {
    setId('');
    setNome('');
    setDescricao('');
    setCor('');
    setModalLoading(false);
  };

  const grupo = () : GrupoLite => ({
    id,
    nome,
    descricao,
    cor,
  });

  const addGrupo = async () : Promise<void> => {
    setModalLoading(true);
    const g = grupo();

    try {
      if (id) await editarGrupo(cnpj, g);
      else await criarGrupo(cnpj, g);

      const gps = await getGrupos(cnpj);

      dispatch(carregarGrupos(gps));
      message.success(`Grupo ${nome} modificado com sucesso!`);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      message.error(`Falha ao modificadar o grupo: ${nome}`);
    }
  };

  const onChangeInput = (setState : Function) => (
    e : React.ChangeEvent<HTMLInputElement>,
  ) : void => setState(e.target.value);

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={addGrupo}
      okButtonProps={{ disabled: okDisabled }}
      okText={okText}
      cancelText="Cancelar"
      afterClose={limparDados}
      confirmLoading={modalLoading}
      onCancel={onClose}
    >
      <div>
        <Row
          gutter={8}
          style={{ marginBottom: '20px' }}
        >
          <Col span={8}>
            <Input
              placeholder="Nome"
              value={nome}
              onChange={onChangeInput(setNome)}
            />
          </Col>
          <Col span={16}>
            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={onChangeInput(setDescricao)}
            />
          </Col>
        </Row>
        <Row
          gutter={8}
          style={{ marginBottom: '5px' }}
          type="flex"
          justify="center"
        >
          <Col>
            <CompactPicker
              color={cor}
              colors={colors}
              onChangeComplete={(color : ColorResult) : void => setCor(color.hex)}
            />
          </Col>
        </Row>
      </div>
    </Modal>
  );
}

export default Connect(EditarGrupoModal);
