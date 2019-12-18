import firebase from 'firebase';
import axios from 'axios';

import { api } from './publics';
import { firebaseConfig } from './private';

export const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.database();

export async function loginGoogle(/* options */) {
  const provider = new firebase.auth.GoogleAuthProvider();

  const { user } = await auth.signInWithPopup(provider);

  if (!user.email.endsWith('@andreacontabilidade.com')
  && user.email !== 'gabriel.carneiro.castro@gmail.com') {
    await auth.signOut();
  }

  return true;
}

export async function getEstoque(estoqueInfosGerais) {
  const { data } = await axios.get(`${api}/estoque/${estoqueInfosGerais.cnpj}`, {
    params: {
      data: estoqueInfosGerais.diaMesAno.format('DD-MM-YYYY'),
    },
  });

  return data;
}

export async function pegarDominioId() {
  if (!auth.currentUser) throw new Error('Nenum usuário logado!');

  const { uid } = auth.currentUser;
  const { data } = await axios.get(`${api}/dominio/id/${uid}`);

  return data;
}

export async function pegarDominio() {
  const codigo = await pegarDominioId();
  const { data } = await axios.get(`${api}/dominio/codigo/${codigo}`);

  return data;
}

export async function adicionarEmpresaDominio(cnpj, numero) {
  const dominioId = await pegarDominioId();

  return axios.post(`${api}/dominio/empresa`, {
    cnpj,
    numero,
    dominioId,
  });
}

export async function adicionarEmpresaImpostos(aliquota) {
  return axios.post(`${api}/aliquotas`, {
    aliquota,
  });
}

export async function pegarEmpresaImpostos(cnpj) {
  const { data } = await axios.get(`${api}/aliquotas/${cnpj}`);

  return data;
}

export async function gravarMovimentos(movimentos, cnpj) {
  const atualizar = new Set();
  try {
    await Promise.all(movimentos.map(async (movimentoPool) => {
      const { dataHora, donoCpfcnpj } = movimentoPool.movimento;
      const data = new Date(dataHora);
      const mes = (data.getUTCMonth() + 1).toString();
      const ano = data.getUTCFullYear().toString();

      atualizar.add(`${mes}/${ano}`);
      return axios.post(`${api}/movimentos/push`, {
        donoCpfcnpj, movimentoPool, valorInicial: 0,
      });
    }));

    const { tributacao } = await pegarEmpresaImpostos(cnpj);

    const simples = tributacao === 'SN';


    const route = simples ? 'simples' : 'trimestre';

    await Promise.all(Array.from(atualizar).map(async (mesAno) => {
      const [mes, ano] = mesAno.split('/');

      return axios.put(`${api}/${route}/${cnpj}/${mes}/${ano}`);
    }));

    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function calcularServico(notaServico) {
  const { data } = await axios.get(`${api}/servicos/calcular/${notaServico.chave}`);

  return data;
}

export async function gravarServicos(servicos, cnpj) {
  const atualizar = new Set();
  try {
    await Promise.all(servicos.map(async (servicoPool) => {
      const { dataHora, donoCpfcnpj } = servicoPool.servico;
      const data = new Date(dataHora);
      const mes = (data.getUTCMonth() + 1).toString();
      const ano = data.getUTCFullYear().toString();

      atualizar.add(`${mes}/${ano}`);
      return axios.post(`${api}/servicos/push`, {
        donoCpfcnpj, servicoPool,
      });
    }));

    const { tributacao } = await pegarEmpresaImpostos(cnpj);

    const simples = tributacao === 'SN';

    const route = simples ? 'simples' : 'trimestre';

    await Promise.all(Array.from(atualizar).map(async (mesAno) => {
      const [mes, ano] = mesAno.split('/');

      return axios.put(`${api}/${route}/${cnpj}/${mes}/${ano}`);
    }));

    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function pegarPessoaId(pessoaId) {
  try {
    const { data } = await axios.get(`${api}/pessoas/${pessoaId}`);
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function calcularMovimentos(notasFinaisChave, usuario) {
  const { data } = await axios.post(`${api}/movimentos/calcular`, { notasFinaisChave, usuario });
  return data;
}

export async function movimentoSlim(movimento, notaFinal, valorInicial) {
  const { data } = await axios.get(`${api}/movimentos/slim/${notaFinal.emitenteCpfcnpj}`, {
    params: {
      valorInicial,
      notaFinalChave: movimento.notaFinalChave,
    },
  });

  return data;
}

export async function cancelarMovimento(cnpj, movimentoId) {
  const { data } = await axios.put(`${api}/movimentos/cancelar/${cnpj}/${movimentoId}`);

  return data;
}

export async function editarMovimento(movimentoPoolNovo) {
  const { metaDados } = movimentoPoolNovo;
  const movimentoAntigoId = metaDados.refMovimentoId;
  const cnpj = movimentoPoolNovo.movimento.donoCpfcnpj;

  const { data } = await axios.put(
    `${api}/movimentos/editar/${cnpj}/${movimentoAntigoId}`,
    { movimentoNovoObj: movimentoPoolNovo },
  );

  return data;
}

export async function pegarServico(cnpj, servicoId) {
  const { data } = await axios.get(`${api}/servicos/id/${cnpj}/${servicoId}`);

  return data;
}

export async function excluirServico(servicoPool) {
  const { servico } = servicoPool;
  const cnpj = servico.donoCpfcnpj;
  const servicoId = servico.id;

  const { data } = await axios.delete(`${api}/servicos/${cnpj}/${servicoId}`);

  return data;
}

export async function pegarTrimestre(cnpj, { mes, ano }) {
  const { data } = await axios.get(`${api}/trimestre/${cnpj}/${mes}/${ano}`);

  return data;
}

export async function criarEstoqueProduto(cnpj, produto) {
  return axios.post(`${api}/estoque/${cnpj}`, produto);
}

export async function atualizarEstoque(estoqueInfosGerais) {
  const { data } = await axios.put(
    `${api}/estoque/${estoqueInfosGerais.cnpj}`, null,
    {
      params: {
        data: estoqueInfosGerais.diaMesAno.format('DD-MM-YYYY'),
      },
    },
  );

  return data;
}

export async function editarEstoqueProduto(id, produto) {
  return axios.put(
    `${api}/estoque/${produto.donoCpfcnpj}/${id}`,
    produto,
  );
}

export async function pegarSimples(cnpj, { mes, ano }) {
  const { data } = await axios.get(`${api}/simples`, {
    params: {
      cnpj,
      mes,
      ano,
    },
  });

  return data;
}

export async function recalcularSimples(cnpj, { mes, ano }) {
  const { data } = await axios.put(`${api}/simples`, {}, {
    params: {
      cnpj, mes, ano,
    },
  });

  return data;
}

export async function getGrupos(cnpj) {
  const { data } = await axios.get(`${api}/grupo/${cnpj}`);

  return data;
}

export async function criarGrupo(cnpj, grupo) {
  return axios.post(`${api}/grupo/${cnpj}`, grupo);
}

export async function editarGrupo(cnpj, grupo) {
  return axios.put(`${api}/grupo/${cnpj}`, grupo);
}

export async function alterarGrupoServico(servicoPool, novoGrupoId) {
  const { id } = servicoPool.servico;

  const { data } = await axios.put(`${api}/servicos/${id}`, { grupoId: novoGrupoId });

  return data;
}

export async function getVersion() {
  const { data } = await axios.get(`${api}/version`);

  return data;
}
