import Vue from 'vue'
import VueRouter from 'vue-router'
import Hello from '../components/Hello'
import Login from '../components/Login'
import Registrar from '../components/Registrar'
import Perfil from '../components/Perfil'
import Importar from '../components/Importar'
import ConciliarNotas from '../components/ConciliarNotas'
import MostrarMovimentos from '../components/MostrarMovimentos'
import Menu from '../components/Menu'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/registrar',
      name: 'Registrar',
      component: Registrar
    },
    {
      path: '/perfil',
      name: 'Perfil',
      component: Perfil
    },
    {
      path: '/importar',
      name: 'Importar',
      component: Importar
    },
    {
      path: '/conciliarNotas',
      name: 'ConciliarNotas',
      component: ConciliarNotas
    },
    {
      path: '/mostrarMovimentos',
      name: 'MostrarMovimentos',
      component: MostrarMovimentos
    },
    {
      path: '/menu',
      name: 'Menu',
      component: Menu
    }
  ]
})
