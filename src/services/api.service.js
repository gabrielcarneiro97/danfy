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

export function pegarDominioId() {
  return new Promise((resolve, reject) => {
    if (!auth.currentUser) {
      reject(new Error('Nenum usuário logado!'));
    }

    const { uid } = auth.currentUser;

    axios.get(`${api}/dominio/id`, {
      params: {
        uid,
      },
    }).then((res) => {
      resolve(res.data);
    }).catch(reject);
  });
}

export function pegarDominio() {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((codigo) => {
      axios.get(`${api}/dominio`, {
        params: {
          codigo,
        },
      }).then((res) => {
        resolve(res.data);
      }).catch(reject);
    }).catch(reject);
  });
}

export function adicionarEmpresaDominio(cnpj, numero) {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((dominioId) => {
      axios.post(`${api}/dominio/empresa`, {
        cnpj,
        numero,
        dominioId,
      }).then(() => {
        resolve();
      }).catch(reject);
    });
  });
}

export function adicionarEmpresaImpostos(aliquota) {
  return axios.post(`${api}/aliquotas`, {
    aliquota,
  });
}

export function pegarEmpresaImpostos(cnpj) {
  return new Promise((resolve, reject) => {
    axios.get(`${api}/aliquotas`, {
      params: {
        cnpj,
      },
    }).then((res) => {
      resolve(res.data);
    }).catch(reject);
  });
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

      return axios.put(`${api}/${route}`, {}, {
        params: {
          cnpj, mes, ano,
        },
      });
    }));

    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
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

      return axios.put(`${api}/${route}`, {}, {
        params: {
          cnpj, mes, ano,
        },
      });
    }));

    return true;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function pegarPessoaId(pessoaId) {
  try {
    const { data } = await axios.get(`${api}/pessoas/flat`, {
      params: {
        pessoaId,
      },
    });
    return data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export function cancelarMovimento(cnpj, movimentoId) {
  return new Promise((resolve, reject) => {
    axios.put(`${api}/movimentos/cancelar`, {}, {
      params: {
        cnpj,
        movimentoId,
      },
    }).then(({ data }) => {
      resolve(data);
    }).catch(reject);
  });
}

export function editarMovimento(movimentoPoolNovo) {
  const { metaDados } = movimentoPoolNovo;
  return new Promise((resolve, reject) => {
    const movimentoAntigoId = metaDados.refMovimentoId;

    axios.put(`${api}/movimentos/editar`, { movimentoNovoObj: movimentoPoolNovo }, {
      params: {
        movimentoAntigoId,
        cnpj: movimentoPoolNovo.movimento.donoCpfcnpj,
      },
    }).then(({ data }) => {
      resolve(data);
    }).catch(reject);
  });
}

export function pegarServico(cnpj, servicoId) {
  return new Promise((resolve, reject) => {
    axios.get(`${api}/servicos/id`, {
      params: {
        cnpj,
        servicoId,
      },
    }).then(({ data: servico }) => {
      resolve(servico);
    }).catch(reject);
  });
}

export function excluirServico(servicoPool) {
  const { servico } = servicoPool;
  const cnpj = servico.donoCpfcnpj;
  const servicoId = servico.id;
  return new Promise((resolve, reject) => {
    axios.delete(`${api}/servicos/id`, {
      params: {
        cnpj,
        servicoId,
      },
    }).then(({ data }) => {
      resolve(data);
    }).catch(reject);
  });
}

export async function pegarTrimestre(cnpj, { mes, ano }) {
  const { data } = await axios.get(`${api}/trimestre`, {
    params: {
      cnpj,
      mes,
      ano,
    },
  });

  return data;
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
