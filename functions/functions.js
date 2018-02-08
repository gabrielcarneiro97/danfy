'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _firebaseFunctions = require('firebase-functions');

var functions = _interopRequireWildcard(_firebaseFunctions);

var _firebaseAdmin = require('firebase-admin');

var admin = _interopRequireWildcard(_firebaseAdmin);

var _services = require('../../src/components/services');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cors = require('cors')({ origin: true });
admin.initializeApp(functions.config().firebase);

var db = admin.database();

exports.gerarMovimentos = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    let notasFinais = req.body.notasFinais;
    let usuario = req.body.usuario;

    let promises = [];

    notasFinais.forEach(chave => {
      let p = new Promise(resolve => {
        db.ref('Notas/' + chave).once('value', snap => {
          let nota = snap.val();
          let movimento = {
            notaFinal: chave,
            notaInicial: null,
            data: nota.geral.dataHora,
            conferido: false,
            dominio: usuario.dominio,
            valores: {},
            metaDados: {
              criadoPor: usuario.email,
              dataCriacao: new Date().toISOString(),
              status: 'ATIVO',
              tipo: 'PRIM',
              movimentoRef: ''
            }
          };
          let query = db.ref('Notas/').orderByChild('emitente').equalTo(nota.emitente);
          query.on('child_added', snap => {
            let nota2 = snap.val();
            if (nota2.chave !== nota.chave) {
              let produtos = Object.keys(nota.produtos);
              let produtos2 = Object.keys(nota2.produtos);
              if (!movimento.notaInicial) {
                produtos2.forEach(produto => {
                  if (produtos.includes(produto)) {
                    (0, _services.validarMovimento)(nota2, nota, err => {
                      if (!err) {
                        movimento.notaInicial = nota2.chave;
                        (0, _services.pegarEmpresaImpostos)(nota.emitente, (err, aliquotas) => {
                          if (err) {
                            console.error(err);
                          } else {
                            (0, _services.calcularImpostosMovimento)(nota2, nota, aliquotas, (err, valores) => {
                              if (err) {
                                console.error(err);
                              } else {
                                movimento.valores = valores;
                                movimento.conferido = true;
                                resolve(movimento);
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            }
          });
          query.once('value', snap => {
            if (!movimento.notaInicial) {
              (0, _services.pegarEmpresaImpostos)(nota.emitente, (err, aliquotas) => {
                if (err) {
                  console.error(err);
                } else {
                  (0, _services.calcularImpostosMovimento)(null, nota, aliquotas, (err, valores) => {
                    if (err) {
                      console.error(err);
                    } else {
                      movimento.valores = valores;
                      resolve(movimento);
                    }
                  });
                }
              });
            }
          });
        });
      });
      promises.push(p);
    });

    Promise.all(promises).then(arr => {
      return res.send({ movimentos: arr });
    }).catch(err => {
      console.error(err);
    });
  });
});

exports.pegarNotaProduto = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let notas = {};

    let prodsId = decodeURI(request.query.prodId);

    let arrProds = prodsId.split('|*|');

    arrProds.forEach(id => {
      if (id !== '') {
        notas[id] = {};
      }
    });

    let query = db.ref('Notas/').orderByChild('emitente');
    query.on('child_added', snap => {
      let nota = snap.val();
      let chave = snap.key;
      let listaProdutos = Object.keys(nota.produtos);

      listaProdutos.forEach(prodId => {
        if (arrProds.includes(prodId)) {
          notas[prodId][chave] = nota;
        }
      });
    });
    query.once('value', snap => {
      let data = {};
      data.notas = notas;
      response.send(data);
    });
  });
});

exports.pegarTudoTrimestre = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let data = {};
    let cnpj = request.query.cnpj; // '10224776000149'
    let mes = request.query.mes;
    let ano = request.query.ano;
    let notas = {};
    let notasEnd = false;

    let end = () => {
      if (notasEnd) {
        response.send(data);
      }
    };

    (0, _services.pegarMovimentosMes)(cnpj, { mes: mes, ano: ano }, (err, movs) => {
      if (err) {
        data.err = err;
      } else {
        data.movimentos = movs;
        if (_lodash2.default.isEmpty(movs)) {
          notasEnd = true;
        }
        Object.keys(movs).forEach((k, i, arr) => {
          let m = movs[k];
          pegarNotaChave(m.notaInicial, (err, n1) => {
            if (err) {
              data.err = err;
            } else {
              pegarNotaChave(m.notaFinal, (err, n2) => {
                if (err) {
                  data.err = err;
                } else {
                  notas[n1.chave] = n1;
                  notas[n2.chave] = n2;

                  if (arr.length - 1 === i) {
                    data.notas = notas;
                    notasEnd = true;
                    end();
                  }
                }
              });
            }
          });
        });
      }
      (0, _services.pegarServicosMes)(cnpj, { mes: mes, ano: ano }, (err, servs) => {
        if (err) {
          data.err = err;
        } else {
          data.servicos = servs;
          (0, _services.totaisTrimestrais)(cnpj, { mes: mes, ano }, (err, trim) => {
            if (err) {
              data.err = err;
            } else {
              data.trimestre = trim;
              end();
            }
          });
        }
      });
    });
  });
});

function pegarNotaChave(chave, callback) {
  let nota;
  db.ref('Notas/' + chave).once('value', value => {
    nota = value.val();
    callback(null, nota);
  });
}