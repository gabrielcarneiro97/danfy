import firebase from 'firebase';
import axios from 'axios';

import { api, apiv2 } from './publics';
import { firebaseConfig } from './private';
import {
  EstoqueInformacoesGerais,
  ProdutoEstoqueLite,
  Dominio,
  MovimentoPool, NotaServico,
  Investimentos,
  ServicoPool, MovimentoStore,
  Grupo, Competencia,
  NotaPool, Movimento,
  Nota, Pessoa, Aliquotas, GrupoLite,
} from '../types';

export const firebaseApp = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.database();

export async function loginGoogle(/* options */) : Promise<boolean> {
  const provider = new firebase.auth.GoogleAuthProvider();

  const { user } = await auth.signInWithPopup(provider);

  if (!user?.email?.endsWith('@andreacontabilidade.com')
  && user?.email !== 'gabriel.carneiro.castro@gmail.com') {
    await auth.signOut();
  }

  return true;
}

export async function getEstoque(estoqueInfosGerais : EstoqueInformacoesGerais)
  : Promise<ProdutoEstoqueLite[]> {
  const { data } = await axios.get(`${api}/estoque/${estoqueInfosGerais.cnpj}`, {
    params: {
      data: estoqueInfosGerais?.diaMesAno?.format('DD-MM-YYYY') || '00-00-0000',
    },
  });

  return data;
}

export async function pegarDominioId() : Promise<string> {
  if (!auth.currentUser) throw new Error('Nenum usuário logado!');

  const { uid } = auth.currentUser;
  const { data } = await axios.get(`${api}/dominio/id/${uid}`);

  return data;
}

export async function pegarDominio() : Promise<Dominio[]> {
  const codigo = await pegarDominioId();
  const { data } = await axios.get(`${api}/dominio/codigo/${codigo}`);

  return data;
}

export async function adicionarEmpresaDominio(cnpj : string, numero : string) : Promise<any> {
  const dominioId = await pegarDominioId();

  return axios.post(`${api}/dominio/empresa`, {
    cnpj,
    numero,
    dominioId,
  });
}

export async function adicionarEmpresaImpostos(aliquota : Aliquotas) : Promise<any> {
  return axios.post(`${api}/aliquotas`, {
    aliquota,
  });
}

export async function pegarEmpresaImpostos(cnpj : string) : Promise<Aliquotas> {
  const { data } = await axios.get(`${api}/aliquotas/${cnpj}`);

  return data;
}

export async function gravarMovimentos(movimentos : MovimentoPool[], cnpj : string) : Promise<any> {
  const atualizar = new Set<string>();
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
    console.error(err);
    throw err;
  }
}

export async function calcularServico(notaServico : NotaServico) : Promise<ServicoPool> {
  const { data } = await axios.get(`${api}/servicos/calcular/${notaServico.chave}`);

  return data;
}

export async function gravarServicos(servicos : ServicoPool[], cnpj : string) : Promise<any> {
  const atualizar = new Set<string>();
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
    console.error(err);
    throw err;
  }
}

export async function pegarPessoaId(pessoaId : string | number) : Promise<Pessoa> {
  try {
    const { data } = await axios.get(`${api}/pessoas/${pessoaId}`);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function calcularMovimentos(
  notasFinaisChave : string[],
  usuario : { dominioCodigo : string; email : string | null },
) : Promise<{ movimentos : MovimentoPool[]; notasIniciais : NotaPool[] }> {
  const { data } = await axios.post(`${api}/movimentos/calcular`, { notasFinaisChave, usuario });
  return data;
}

export async function movimentoSlim(
  movimento : Movimento,
  notaFinal : Nota,
  valorInicial : number | string,
) : Promise<{ movimentoPool : MovimentoPool; notaInicialPool : NotaPool }> {
  const { data } = await axios.get(`${api}/movimentos/slim/${notaFinal.emitenteCpfcnpj}`, {
    params: {
      valorInicial,
      notaFinalChave: movimento.notaFinalChave,
    },
  });

  return data;
}

export async function cancelarMovimento(
  cnpj : string,
  movimentoId : string,
) : Promise<MovimentoStore> {
  const { data } = await axios.put(`${api}/movimentos/cancelar/${cnpj}/${movimentoId}`);

  return data;
}

export async function editarMovimento(movimentoPoolNovo : MovimentoPool) : Promise<MovimentoStore> {
  const { metaDados } = movimentoPoolNovo;
  const movimentoAntigoId = metaDados.refMovimentoId;
  const cnpj = movimentoPoolNovo.movimento.donoCpfcnpj;

  const { data } = await axios.put(
    `${api}/movimentos/editar/${cnpj}/${movimentoAntigoId}`,
    { movimentoNovoObj: movimentoPoolNovo },
  );

  return data;
}

export async function pegarServico(
  cnpj : string,
  servicoId : string,
) : Promise<ServicoPool> {
  const { data } = await axios.get(`${api}/servicos/id/${cnpj}/${servicoId}`);

  return data;
}

export async function excluirServico(servicoPool : ServicoPool) : Promise<any> {
  const { servico } = servicoPool;
  const cnpj = servico.donoCpfcnpj;
  const servicoId = servico.id;

  const { data } = await axios.delete(`${api}/servicos/${cnpj}/${servicoId}`);

  return data;
}

export async function pegarTrimestre(
  cnpj : string,
  competencia? : Competencia,
) : Promise<MovimentoStore> {
  const { mes, ano } = competencia || { mes: '', ano: '' };
  const { data } = await axios.get(`${api}/trimestre/${cnpj}/${mes}/${ano}`);

  return data;
}

export async function pegarInvestimentos(
  cnpj : string,
  competencia? : Competencia,
) : Promise<Investimentos> {
  const headers = {
    "Authorization": "Bearer ZDU1NWFhYWUtNTg2NC00MzFhLWJlMmEtYzQxMzk3ZWU0ZWNm"
  }
  const { mes, ano } = competencia || { mes: '', ano: '' };
  const { data } = await axios.get(`${apiv2}/api/v1/people/${cnpj}/investments/year/${ano}/month/${mes}`, { headers })
    .catch(e => {
      console.log(`ERROR!!! ${e}`);
      const investimentosVazio = {
        owner: cnpj,
        year: ano,
        month: mes,
        income: 0,
        fees_discounts: 0,
        capital_gain: 0,
        retention: 0,
      }
      return { data: investimentosVazio };
    });

  return data;
}

export async function criarEstoqueProduto(
  cnpj : string,
  produto : ProdutoEstoqueLite,
) : Promise<any> {
  return axios.post(`${api}/estoque/${cnpj}`, produto);
}

export async function atualizarEstoque(
  estoqueInfosGerais : EstoqueInformacoesGerais,
) : Promise<{ estoqueAtualizado : ProdutoEstoqueLite[] }> {
  const { data } = await axios.put(
    `${api}/estoque/${estoqueInfosGerais.cnpj}`, null,
    {
      params: {
        data: estoqueInfosGerais?.diaMesAno?.format('DD-MM-YYYY') || '00-00-0000',
      },
    },
  );

  return data;
}

export async function editarEstoqueProduto(
  id : string,
  produto : ProdutoEstoqueLite,
) : Promise<any> {
  return axios.put(
    `${api}/estoque/${produto.donoCpfcnpj}/${id}`,
    produto,
  );
}

export async function pegarSimples(
  cnpj : string,
  competencia? : Competencia,
) : Promise<MovimentoStore> {
  const { mes, ano } = competencia || { mes: '', ano: '' };
  const { data } = await axios.get(`${api}/simples`, {
    params: {
      cnpj,
      mes,
      ano,
    },
  });

  return data;
}

export async function recalcularSimples(
  cnpj : string,
  competencia? : Competencia,
) : Promise<MovimentoStore> {
  const { mes, ano } = competencia || { mes: '', ano: '' };
  const { data } = await axios.put(`${api}/simples`, {}, {
    params: {
      cnpj, mes, ano,
    },
  });

  return data;
}

export async function getGrupos(cnpj : string) : Promise<Grupo[]> {
  const { data } = await axios.get(`${api}/grupo/${cnpj}`);

  return data;
}

export async function criarGrupo(cnpj : string, grupo : GrupoLite) : Promise<any> {
  return axios.post(`${api}/grupo/${cnpj}`, grupo);
}

export async function editarGrupo(cnpj : string, grupo : GrupoLite) : Promise<any> {
  return axios.put(`${api}/grupo/${cnpj}`, grupo);
}

export async function alterarGrupoServico(
  servicoPool : ServicoPool, novoGrupoId : number | string,
) : Promise<MovimentoStore> {
  const { id } = servicoPool.servico;

  const { data } = await axios.put(`${api}/servicos/${id}`, { grupoId: novoGrupoId });

  return data;
}

export async function getVersion() : Promise<{ api : string; node : string; db: string }> {
  const { data } = await axios.get(`${api}/version`);

  return data;
}
