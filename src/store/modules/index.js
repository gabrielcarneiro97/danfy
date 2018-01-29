import { moduleUsuario } from './usuario'
import { moduleNotas } from './notas'
import { moduleNotasServico } from './notasServico'
import { modulePessoas } from './pessoas'
import { moduleDominio } from './dominio'

export const modules = {
  usuario: moduleUsuario,
  pessoas: modulePessoas,
  notas: moduleNotas,
  notasServico: moduleNotasServico,
  dominio: moduleDominio
}
