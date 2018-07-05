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

    db.ref(`Usuarios/${uid}`)
      .once('value')
      .then((snap) => {
        const { dominio } = snap.val();
        resolve(dominio);
      });
  });
}

export function pegarDominio() {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((dominio) => {
      db.ref(`Dominios/${dominio}`)
        .once('value')
        .then((snap) => {
          resolve(snap.val());
        });
    }).catch(err => reject(err));
  });
}

export function adicionarEmpresaDominio(cnpj, num) {
  return new Promise((resolve, reject) => {
    pegarDominioId().then((dominio) => {
      db.ref(`Dominios/${dominio}/empresas/${num}`)
        .set(cnpj)
        .then(snap => resolve(snap))
        .catch(err => reject(err));
    });
  });
}

export function adicionarEmpresaImpostos(cnpj, aliquotas) {
  return new Promise((resolve, reject) => {
    db.ref(`Impostos/${cnpj}`)
      .set(aliquotas)
      .then(snap => resolve(snap))
      .catch(err => reject(err));
  });
}

export function gravarMovimentos(movimentos) {
  return new Promise((resolveEnd, reject) => {
    Object.keys(movimentos).forEach((cnpj, index, arr) => {
      const erros = [];
      if (movimentos[cnpj]) {
        const atualizar = new Set();
        const promises = [];

        movimentos[cnpj].forEach((mov) => {
          promises.push(new Promise((resolve) => {
            let movimento = mov;
            const gravar = () => {
              const date = new Date(movimento.data);
              const mes = (date.getUTCMonth() + 1).toString();
              const ano = date.getUTCFullYear().toString();
              atualizar.add(`${mes}/${ano}`);

              if (movimento.notaInicial) {
                db.ref(`Movimentos/${cnpj}`).push(movimento, (err) => {
                  if (arr.length - 1 === index && err) {
                    reject(err);
                  } else if (arr.length - 1 === index && erros.length > 0) {
                    reject(erros);
                  } else if (arr.length - 1 === index) {
                    resolve();
                  }
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

                  db.ref(`Movimentos/${cnpj}`).push(movimento, (err) => {
                    if (arr.length - 1 === index && err) {
                      reject(err);
                    } else if (arr.length - 1 === index && erros.length > 0) {
                      reject(erros);
                    } else if (arr.length - 1 === index) {
                      resolve();
                    }
                  });
                });
              }
            };

            let erro;
            db.ref(`Movimentos/${cnpj}`).orderByChild('notaFinal').equalTo(movimento.notaFinal).once('value', (snap) => {
              const movimentosRelacionados = snap.val();
              if (movimentosRelacionados) {
                Object.keys(movimentosRelacionados).forEach((key) => {
                  const movimentoRel = movimentosRelacionados[key];
                  if (movimentoRel.metaDados) {
                    if (movimentoRel.metaDados.status !== 'CANCELADO') {
                      erro = new Error(`Nota já registrada em outro movimento! ID: ${Object.keys(snap.val())[0]}`);
                      erro.idMovimento = key;
                      erros.push(erro);
                    } else {
                      movimento.metaDados.movimentoRef = key;
                      movimento.metaDados.tipo = 'SUB';
                    }
                  } else {
                    erro = new Error(`Nota já registrada em outro movimento! ID: ${Object.keys(snap.val())[0]}`);
                    erro.idMovimento = key;
                    erros.push(erro);
                  }
                });
                gravar();
              } else {
                gravar();
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

export function pegarPessoaId(id) {
  return new Promise((resolve, reject) => {
    db.ref(`Pessoas/${id}`).once('value').then((snap) => {
      resolve(snap.val());
    }, (err) => {
      reject(err);
    });
  });
}

export function pegarEmpresaImpostos(cnpj) {
  return new Promise((resolve, reject) => {
    db.ref(`Impostos/${cnpj}`).once('value', (snap) => {
      resolve(snap.val());
    }, (err) => {
      reject(err);
    });
  });
}

export function cancelarMovimento(cnpj, id) {
  return new Promise((resolve, reject) => {
    db.ref(`Movimentos/${cnpj}/${id}`).once('value', (snap) => {
      const movimento = snap.val();
      if (movimento.metaDados) {
        movimento.metaDados.status = 'CANCELADO';
      } else {
        movimento.metaDados = {
          criadoPor: 'DESCONHECIDO',
          dataCriacao: new Date('07/19/1997').toISOString(),
          status: 'CANCELADO',
          tipo: 'PRIM',
        };
      }
      db.ref(`Movimentos/${cnpj}/${id}`).set(movimento, (err) => {
        if (err) {
          reject(err);
        } else {
          const data = new Date(movimento.data);
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

export function editarMovimento(movimentoNovo, cnpj) {
  return new Promise((resolve, reject) => {
    const idMovimentoAntigo = movimentoNovo.metaDados.movimentoRef;

    if (!idMovimentoAntigo) {
      reject(new Error('O movimento não tem movimento referenciado nos meta dados'));
    } else {
      cancelarMovimento(cnpj, idMovimentoAntigo).then(() => {
        db.ref(`Movimentos/${cnpj}`).push(movimentoNovo).then(() => {
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
          }).then((response) => {
            resolve(response.data);
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
