import { combineReducers } from 'redux'
import usuario from './usuario'
import notas from './notas'
import pessoas from './pessoas'

const reducer = combineReducers({usuario, notas, pessoas})

export default reducer
