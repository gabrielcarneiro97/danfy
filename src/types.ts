import { UploadFile } from 'antd/lib/upload/interface';
import moment from 'moment';

export type pgStr = string;
export type pgNum = number;
export type pgDate = Date;
export type pgBool = boolean;

export type pgType = pgStr | pgNum | pgDate | pgBool;

export type Competencia = {
  mes : string;
  ano : string;
}

export type Empresa = {
  cnpj: string;
  nome: string;
  numeroSistema: string;
  formaPagamento?: string;
  simples?: boolean;
}

export type Pessoa = {
  cpfcnpj : pgStr;
  nome : pgStr;
  enderecoId : pgNum;
}

export type Endereco = {
  id : pgNum;
  logradouro : pgStr;
  numero : pgStr;
  cep : pgStr;
  complemento : pgStr;
  municipioId : pgNum;
  estadoId : pgNum;
  paisId : pgNum;
}

export type Total = {
  id : pgNum;
  donoCpfcnpj : pgStr;
  dataHora : pgDate;
  totalMovimentoId : pgNum;
  totalServicoId : pgNum;
  totalSomaId : pgNum;
  anual : pgBool;
  trimestral : pgBool;
}

export type TotalMovimento = {
  id : pgNum;
  impostoId : pgNum;
  valorSaida : pgNum;
  lucro : pgNum;
}

export type Imposto = {
  id : pgNum;
  cofins : pgNum;
  csll : pgNum;
  irpj : pgNum;
  adicionalIr : pgNum;
  pis : pgNum;
  total : pgNum;
  icmsId : pgNum;
  iss : pgNum;
}

export type Icms = {
  id : pgNum;
  baseCalculo : pgNum;
  composicaoBase : pgNum;
  difalDestino : pgNum;
  difalOrigem : pgNum;
  proprio : pgNum;
}

export type TotalServico = {
  id : pgNum;
  total : pgNum;
  impostoId : pgNum;
  retencaoId : pgNum;
}

export type Retencao = {
  id? : pgNum;
  iss? : pgNum;
  irpj? : pgNum;
  pis? : pgNum;
  cofins? : pgNum;
  csll? : pgNum;
  inss? : pgNum;
  total? : pgNum;
}

export type TotalSoma = {
  id : pgNum;
  valorMovimento : pgNum;
  valorServico : pgNum;
  impostoId : pgNum;
  retencaoId : pgNum;
  acumuladoId : pgNum;
}

export type Acumulado = {
  id : pgNum;
  pis : pgNum;
  cofins : pgNum;
}

export type Movimento = {
  id : pgNum;
  notaFinalChave : pgStr;
  notaInicialChave : pgStr;
  valorSaida : pgNum;
  lucro : pgNum;
  dataHora : pgDate;
  conferido : pgBool;
  impostoId : pgNum;
  metaDadosId : pgNum;
  donoCpfcnpj : pgStr;
}

export type Servico = {
  id : pgNum;
  donoCpfcnpj : pgStr;
  notaChave : pgStr;
  retencaoId : pgNum;
  impostoId : pgNum;
  dataHora : pgDate;
  valor : pgNum;
  conferido : pgBool;
  metaDadosId : pgNum;
  grupoId : pgNum;
}

export type MetaDados = {
  mdId : pgNum;
  email : pgStr;
  mdDataHora : pgDate;
  tipo : pgStr;
  ativo : pgBool;
  refMovimentoId : pgNum;
  refServicoId : pgNum;
}

export type Nota = {
  chave : pgStr;
  emitenteCpfcnpj : pgStr;
  destinatarioCpfcnpj : pgStr;
  textoComplementar : pgStr;
  cfop : pgStr;
  dataHora : pgDate;
  numero : pgStr;
  status : pgStr;
  tipo : pgStr;
  destinatarioContribuinte : pgStr;
  estadoDestinoId : pgNum;
  estadoGeradorId : pgNum;
  valor : pgNum;
}

export type Produto = {
  id : pgNum;
  nome : pgStr;
  descricao : pgStr;
  quantidade : pgNum;
  valor : pgNum;
  notaChave : pgStr;
}

export type NotaServico = {
  chave : pgStr;
  emitenteCpfcnpj : pgStr;
  destinatarioCpfcnpj : pgStr;
  numero : pgStr;
  status : pgStr;
  dataHora : pgDate;
  retencaoId : pgNum;
  valor : pgNum;
  iss : pgNum;
  descricao : pgStr;
}

export type Simples = {
  id? : pgNum;
  donoCpfcnpj? : pgStr;
  dataHora? : pgDate;
  totalServicos : pgNum;
  totalMovimentos : pgNum;
  totalMes : pgNum;
  totalRetido : pgNum;
  totalNaoRetido : pgNum;
  totalExercicio : pgNum;
  totalDoze : pgNum;
}

export type Grupo = {
  id : pgNum;
  donoCpfcnpj? : pgStr;
  nome : pgStr;
  descricao? : pgStr;
  cor? : pgStr;
}

export type Dominio = {
  id : pgNum;
  codigo : pgNum;
  numero : pgStr;
  cnpj : pgStr;
}

export type ProdutoEstoque = {
  id : pgNum;
  produtoCodigo : pgStr;
  notaInicialChave : pgStr;
  notaFinalChave : pgStr;
  valorEntrada : pgNum;
  dataEntrada : pgDate;
  dataSaida : pgDate;
  donoCpfcnpj : pgStr;
  descricao : pgStr;
  ativo : pgBool;
}

export type ProdutoEstoqueLite = {
  id : number;
  produtoCodigo? : string;
  notaInicialChave? : string;
  notaFinalChave? : string;
  valorEntrada? : number;
  dataEntrada? : Date | string;
  dataSaida? : Date | string;
  donoCpfcnpj? : string;
  descricao? : string;
  ativo? : boolean;
}

export type ImpostoPool = {
  imposto : Imposto;
  icms : Icms;
}

export type TotalMovimentoPool = {
  totalMovimento : TotalMovimento;
  impostoPool : ImpostoPool;
}

export type TotalServicoPool = {
  totalServico : TotalServico;
  imposto : Imposto;
  retencao : Retencao;
}

export type TotalSomaPool = {
  totalSoma : TotalSoma;
  impostoPool : ImpostoPool;
  retencao : Retencao;
  acumulado : Acumulado;
}

export type TotalPool = {
  total : Total;
  totalMovimentoPool : TotalMovimentoPool;
  totalServicoPool : TotalServicoPool;
  totalSomaPool : TotalSomaPool;
}

export type MovimentoPool = {
  movimento : Movimento;
  metaDados : MetaDados;
  impostoPool : ImpostoPool;
}

export type ServicoPool = {
  servico : Servico;
  metaDados : MetaDados;
  imposto : Imposto;
  retencao : Retencao;
}

export type NotaPool = {
  nota : Nota;
  produtos : Produto[];
}

export type NotaServicoPool = {
  notaServico : NotaServico;
  retencao : Retencao;
}

export type PessoaPool = {
  pessoa : Pessoa;
  endereco : Endereco;
}

export type MovimentoPoolWithIndex = MovimentoPool & { index : number };

export type ServicoPoolWithIndex = ServicoPool & { index : number };

export type TrimestreData = {
  movimentosPool: MovimentoPool[];
  servicosPool: ServicoPool[];
  trim?: TotalPool;
  1?: TotalPool;
  2?: TotalPool;
  3?: TotalPool;
  4?: TotalPool;
  5?: TotalPool;
  6?: TotalPool;
  7?: TotalPool;
  8?: TotalPool;
  9?: TotalPool;
  10?: TotalPool;
  11?: TotalPool;
  12?: TotalPool;
}

export type SimplesData = {
  movimentosPool : MovimentoPool[];
  servicosPool : ServicoPool[];
  simples: Simples;
}

export type EstoqueInformacoesGerais = {
  numeroSistema: string;
  nome: string;
  cnpj: string;
  diaMesAno: string;
}

export type StoreHandler<S, A> = (state : S, action : A) => S;

export type MovimentoStore = {
  competencia? : Competencia;
  empresa? : Empresa;
  notasPool : NotaPool[];
  notasServicoPool : NotaServicoPool[];
  trimestreData : TrimestreData;
  simplesData: SimplesData;
  dominio? : Dominio[];
  grupos : Grupo[];
}

export type ClientesStore = {
  dominioId: string;
  dominio: Dominio[];
  pessoasPool: PessoaPool[];
  empresa: Empresa;
  grupos: Grupo[];
}

export type FileZ = {
  tipo : string;
  notaPool : NotaPool | NotaServicoPool;
  pessoas : PessoaPool[];
}

export type FileList = UploadFile<FileZ>[];

export type ImportacaoStore = {
  movimentosWithIndex: MovimentoPoolWithIndex[];
  servicosWithIndex: ServicoPoolWithIndex[];
  notasPool: NotaPool[];
  notasPoolImportadas: NotaPool[];
  notasServicoPool: NotaServicoPool[];
  pessoasPool: PessoaPool[];
  dominio: Dominio[];
  empresa: Empresa;
  fileList: FileList;
}

export type EstoqueObject = { [key : string] : ProdutoEstoqueLite }

export type EstoqueStore = {
  estoqueInfosGerais: EstoqueInformacoesGerais;
  estoque: EstoqueObject;
  estoqueArray: ProdutoEstoqueLite[];
  modificadosId: pgNum[];
}

export type MesesNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Cota = { valor : number; numero : number }

export type GrupoLite = { id: string; nome: string; cor : string; descricao: string }

export type ColType = {
  title : string;
  dataIndex? : string;
  key? : string;
  children? : ColType[];
}
