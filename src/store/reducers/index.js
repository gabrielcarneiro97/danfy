import { combineReducers } from 'redux'
import usuario from './usuario'
import notas from './notas'
import pessoas from './pessoas'
import empresas from './empresas'

const reducer = combineReducers({usuario, notas, pessoas, empresas})

export default reducer
