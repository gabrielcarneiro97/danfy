import { createStore } from 'redux'
import reducer from './reduces'

let store = createStore(reducer)

export default store
