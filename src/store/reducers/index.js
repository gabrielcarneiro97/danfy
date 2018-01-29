import { combineReducers } from 'redux'
import { usuario } from './usuario'
import { notas } from './notas'
import { notasServico } from './notasServico'
import { pessoas } from './pessoas'
import { dominio } from './dominio'

const reducer = combineReducers({usuario, notas, notasServico, pessoas, dominio})

export default reducer
