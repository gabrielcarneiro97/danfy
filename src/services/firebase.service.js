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
  return new Promise((resolve, reject) => {
    Object.keys(movimentos).forEach((cnpj, index, arr) => {
      const erros = [];

      if (movimentos[cnpj]) {
        movimentos[cnpj].forEach((mov) => {
          let movimento = mov;
          const gravar = () => {
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
              axios.get(`${api}/movimentoSlim`, {
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
        });
      }
    });
  });
}

export function gravarServicos(servicos) {
  return new Promise((resolve, reject) => {
    const erros = [];
    Object.keys(servicos).forEach((cnpj, index, arr) => {
      if (servicos[cnpj]) {
        servicos[cnpj].forEach((servico) => {
          db.ref(`Servicos/${cnpj}`).orderByChild('nota').equalTo(servico.nota).once('value', (snap) => {
            if (snap.val()) {
              const erro = new Error(`Nota já registrada em outro serviço! ID: ${Object.keys(snap.val())[0]}`);
              [erro.idMovimento] = Object.keys(snap.val());
              erros.push(erro);
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
          resolve();
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
        db.ref(`Movimentos/${cnpj}`).push(movimentoNovo).then((snap) => {
          resolve(snap.key);
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    }
  });
}

export function excluirServico(cnpj, id) {
  return new Promise((resolve, reject) => {
    db.ref(`Servicos/${cnpj}/${id}`).set({}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
