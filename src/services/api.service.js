import firebase from 'firebase';
import axios from 'axios';

import { api } from '.';
import { firebaseConfig } from './private';


export const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.database();

export function loginGoogle(/* options */) {
  const provider = new firebase.auth.GoogleAuthProvider();

  return firebase.auth().signInWithPopup(provider);
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
    }).catch(err => reject(err));
  });
}

export function pegarDominio() {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((id) => {
      axios.get(`${api}/dominio`, {
        params: {
          id,
        },
      }).then((res) => {
        resolve(res.data);
      }).catch(err => reject(err));
    }).catch(err => reject(err));
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
      }).catch(err => reject(err));
    });
  });
}

export function adicionarEmpresaImpostos(cnpj, aliquotas) {
  return new Promise((resolve, reject) => {
    axios.post(`${api}/aliquotas`, {
      cnpj,
      aliquotas,
    }).then(() => {
      resolve();
    }).catch(err => reject(err));
  });
}

export function gravarMovimentos(movimentos) {
  return new Promise((resolveEnd) => {
    const promisesEmpresas = [];
    Object.keys(movimentos).forEach((cnpj) => {
      if (movimentos[cnpj]) {
        promisesEmpresas.push(new Promise((resolveEmpresa) => {
          const atualizar = new Set();
          const promises = [];

          movimentos[cnpj].forEach((movimentoParam) => {
            promises.push(new Promise((resolve) => {
              const movimento = { ...movimentoParam };
              movimento.data = new Date(movimento.data);

              axios.post(`${api}/movimentos/push`, {
                cnpj, movimento, valorInicial: 0,
              }).then(() => {
                const mes = (movimento.data.getUTCMonth() + 1).toString();
                const ano = movimento.data.getUTCFullYear().toString();
                atualizar.add(`${mes}/${ano}`);
                resolve();
              }).catch((err) => {
                console.log('aqui');
                console.log(err);
                resolve();
              });
            }));
          });

          Promise.all(promises).then(() => {
            resolveEmpresa({
              cnpj,
              atualizar,
            });
          });
        }));
      }
    });

    Promise.all(promisesEmpresas).then((finalArray) => {
      finalArray.forEach(({
        cnpj,
        atualizar,
      }) => {
        atualizar.forEach((mesAno) => {
          const mes = mesAno.split('/')[0];
          const ano = mesAno.split('/')[1];
          console.log('atualizar', mes, ano);
          axios.get(`${api}/trimestre`, {
            params: {
              cnpj,
              mes,
              ano,
              recalcular: true,
            },
          });
        });
      });
      resolveEnd();
    });
  });
}

export function gravarServicos(servicos) {
  return new Promise((resolveEnd) => {
    Object.keys(servicos).forEach((cnpj) => {
      if (servicos[cnpj]) {
        const atualizar = new Set();
        const empresaPromises = [];

        empresaPromises.push(new Promise((resolveEmpresa) => {
          servicos[cnpj].forEach((servico) => {
            const promises = [];
            promises.push(new Promise((resolve) => {
              const date = new Date(servico.data);
              const mes = (date.getUTCMonth() + 1).toString();
              const ano = date.getUTCFullYear().toString();
              atualizar.add(`${mes}/${ano}`);

              axios.post(`${api}/servicos/push`, {
                servico,
                cnpj,
              }).then(() => {
                resolve();
              }).catch((err) => {
                resolve();
                console.error(err);
              });
            }));

            Promise.all(promises).then(() => resolveEmpresa());
          });
        }));

        Promise.all(empresaPromises).then(() => {
          atualizar.forEach((mesAno) => {
            const mes = mesAno.split('/')[0];
            const ano = mesAno.split('/')[1];
            axios.get(`${api}/trimestre`, {
              params: {
                cnpj,
                mes,
                ano,
                recalcular: true,
              },
            });
          });
          resolveEnd();
        });
      }
    });
  });
}

export function pegarPessoaId(pessoaId) {
  return new Promise((resolve, reject) => {
    axios.get(`${api}/pessoas/flat`, {
      params: {
        pessoaId,
      },
    }).then((res) => {
      const { pessoa } = res.data;
      resolve(pessoa);
    }).catch(err => reject(err));
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
    }).catch(err => reject(err));
  });
}

export function cancelarMovimento(cnpj, id) {
  return new Promise((resolve, reject) => {
    axios.put(`${api}/movimentos/cancelar`, {}, {
      params: {
        cnpj,
        movimentoId: id,
      },
    }).then(({ data }) => {
      resolve(data);
    }).catch(err => reject(err));
  });
}

export function editarMovimento(movimentoNovo, cnpj) {
  return new Promise((resolve, reject) => {
    const movimentoAntigoId = movimentoNovo.metaDados.movimentoRef;

    axios.put(`${api}/movimentos/editar`, { movimentoNovo }, {
      params: {
        cnpj, movimentoAntigoId,
      },
    }).then(({ data }) => {
      resolve(data);
    }).catch(err => reject(err));
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
    }).catch(err => reject(err));
  });
}

export function excluirServico(cnpj, servicoId) {
  return new Promise((resolve, reject) => {
    axios.delete(`${api}/servicos/id`, {
      params: {
        cnpj,
        servicoId,
      },
    }).then(({ data }) => {
      resolve(data);
    }).catch(err => reject(err));
  });
}
