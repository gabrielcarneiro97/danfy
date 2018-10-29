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
      console.log({
        cnpj,
        numero,
        dominioId,
      });
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

export function teste(cnpj) {

}

export function gravarMovimentos(movimentos) {
  return new Promise((resolveEnd) => {
    const promisesEmpresas = [];
    Object.keys(movimentos).forEach((cnpj) => {
      const erros = [];
      if (movimentos[cnpj]) {
        promisesEmpresas.push(new Promise((resolveEmpresa) => {
          const atualizar = new Set();
          const promises = [];

          movimentos[cnpj].forEach((movimentoParam) => {
            promises.push(new Promise((resolve) => {
              let movimento = { ...movimentoParam };
              movimento.data = new Date(movimento.data);

              axios.get(`${api}/movimentos/notaFinal`, {
                params: {
                  notaFinalChave: movimento.notaFinal,
                  cnpj,
                },
              }).then(({ data: movimentoRegistrado }) => {
                if (movimentoRegistrado) {
                  const erro = {
                    ...new Error(`Nota já registrada em outro movimento! ID: ${movimentoExists._id}`), // eslint-disable-line
                    idMovimento: movimentoExists._id, // eslint-disable-line
                  };
                  erros.push(erro);
                } else {
                  const mes = (movimento.data.getUTCMonth() + 1).toString();
                  const ano = movimento.data.getUTCFullYear().toString();
                  atualizar.add(`${mes}/${ano}`);

                  if (movimento.notaInicial) {
                    axios.post(`${api}/movimentos/push`, {
                      cnpj, movimento,
                    }).then(() => {
                      resolve();
                    });
                  } else {
                    axios.get(`${api}/movimentos/slim`, {
                      params: {
                        valorInicial: 0,
                        notaFinal: movimento.notaFinal,
                        cnpj,
                      },
                    }).then(({ data }) => {
                      const { valores, notaInicial } = data;
                      const notaInicialChave = notaInicial.chave;

                      movimento = {
                        ...movimento,
                        valores,
                        notaInicial: notaInicialChave,
                      };

                      axios.post(`${api}/movimentos/push`, {
                        cnpj, movimento,
                      }).then(() => {
                        resolve();
                      });
                    });
                  }
                }
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
  return new Promise((resolveEnd, reject) => {
    const erros = [];
    Object.keys(servicos).forEach((cnpj, index, arr) => {
      if (servicos[cnpj]) {
        const atualizar = new Set();
        const promises = [];

        servicos[cnpj].forEach((servico) => {
          promises.push(new Promise((resolve) => {
            const date = new Date(servico.data);
            const mes = (date.getUTCMonth() + 1).toString();
            const ano = date.getUTCFullYear().toString();
            atualizar.add(`${mes}/${ano}`);

            db.ref(`Servicos/${cnpj}`).orderByChild('nota').equalTo(servico.nota).once('value', (snap) => {
              if (snap.val()) {
                const erro = new Error(`Nota já registrada em outro serviço! ID: ${Object.keys(snap.val())[0]}`);
                [erro.idMovimento] = Object.keys(snap.val());
                erros.push(erro);
                resolve();
              } else {
                db.ref(`Servicos/${cnpj}`).push(servico, (err) => {
                  if (arr.length - 1 === index && err) {
                    reject(err);
                  } else if (arr.length - 1 === index && erros.length > 0) {
                    reject(erros);
                  } else if (arr.length - 1 === index) {
                    resolve();
                  }
                });
              }
            });
          }));
        });

        Promise.all(promises).then(() => {
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
  return axios.put(`${api}/movimentos/cancelar`, {}, {
    params: {
      cnpj,
      movimentoId: id,
    },
  });
}

export function editarMovimento(movimentoNovo, cnpj) {
  return new Promise((resolve, reject) => {
    const idMovimentoAntigo = movimentoNovo.metaDados.movimentoRef;

    if (!idMovimentoAntigo) {
      reject(new Error('O movimento não tem movimento referenciado nos meta dados'));
    } else {
      cancelarMovimento(cnpj, idMovimentoAntigo).then(() => {
        axios.post(`${api}/movimentos/push`, {
          cnpj, movimentoNovo,
        }).then(() => {
          const data = new Date(movimentoNovo.data);
          const mes = data.getMonth() + 1;
          const ano = data.getFullYear();
          axios.get(`${api}/trimestre`, {
            params: {
              cnpj,
              mes,
              ano,
              recalcular: true,
            },
          }).then((res) => {
            resolve(res.data);
          });
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    }
  });
}

export function pegarServico(cnpj, id) {
  return new Promise((resolve, reject) => {
    db.ref(`Servicos/${cnpj}/${id}`).once('value', (snap) => {
      resolve(snap.val());
    }, err => reject(err));
  });
}

export function excluirServico(cnpj, id) {
  return new Promise((resolve, reject) => {
    pegarServico(cnpj, id).then((servico) => {
      db.ref(`Servicos/${cnpj}/${id}`).set({}, (err) => {
        if (err) {
          reject(err);
        } else {
          const data = new Date(servico.data);
          const mes = data.getMonth() + 1;
          const ano = data.getFullYear();
          axios.get(`${api}/trimestre`, {
            params: {
              cnpj,
              mes,
              ano,
              recalcular: true,
            },
          }).then((response) => {
            resolve(response.data);
          });
        }
      });
    });
  });
}
