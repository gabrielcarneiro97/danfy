import { combineReducers } from 'redux'
import usuario from './usuario'
import notas from './notas'
import pessoas from './pessoas'
import dominio from './dominio'

const reducer = combineReducers({usuario, notas, pessoas, dominio})

export default reducer
