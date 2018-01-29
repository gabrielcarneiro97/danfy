import { createStore } from 'redux'
import Vuex from 'vuex'
import reducer from './reducers'

export const store = createStore(reducer)

export * from './modules'
