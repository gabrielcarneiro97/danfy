<template>
  <div class="md-layout md-alignment-top-center" style="margin-top: 3%">
    <md-card class="md-layout-item md-size-90">
      <md-card-header>
        <div class="md-title">Domínio</div>
      </md-card-header>
      <md-card-content>
        <md-list>
          <md-list-item md-expand>
            <md-icon><font-awesome-icon :icon="faPlus" /></md-icon>
            <span class="md-list-item-text">Adicionar</span>

            <md-list slot="md-expand">
              <md-list-item class="md-inset">
                <md-field>
                  <label>Nome do Domínio</label>
                  <md-input v-model="dominio.nome"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item v-if="perm > 5" class="md-inset">
                <div>
                  <md-radio class="md-primary" v-model="dominio.tipo" value="mult">Múltiplo</md-radio>
                  <md-radio class="md-primary" v-model="dominio.tipo" value="unico">Único</md-radio>
                </div>
              </md-list-item>
              <md-list-item class="md-inset" v-if="dominio.tipo === 'unico'">
                <md-field>
                  <label>CNPJ da empresa (Apenas Números)</label>
                  <md-input v-model="dominio.cnpj"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item class="md-inset" style="text-align: right">
                <md-button @click="registrarDominio">ENVIAR</md-button>
              </md-list-item>
            </md-list>
          </md-list-item>

          <md-list-item md-expand @click="pegarTodosDominios">
            <md-icon><font-awesome-icon :icon="faListUl" /></md-icon>
            <span class="md-list-item-text">Mostrar Domínios Gerenciados</span>

            <md-list class="md-double-line" slot="md-expand">
              <md-list-item v-for="(dominio, nome) in todosDominios" v-if="(perm <= 5 && dominio.dominioPai === usuario.dominio) || perm > 5" v-bind:key="nome + 'dominioMostrar'">
                <md-icon>
                  <font-awesome-icon :icon="faSitemap" />
                </md-icon>

                <div class="md-list-item-text">
                  <span>{{nome}}</span>
                  <span v-if="perm > 5 && dominio.tipo === 'unico'">{{dominio.dominioPai}}</span>
                  <span v-else-if="dominio.tipo === 'unico'">CNPJ: {{dominio.empresa}}</span>                  
                  <span v-else>Domínio Múltipo</span>                  
                </div>

                <md-button class="md-icon-button md-list-action md-primary" @click="mostrarDeletar(nome)">
                  <md-icon><font-awesome-icon :icon="faTrash" /></md-icon>
                </md-button>
              </md-list-item>
            </md-list>
          </md-list-item>

          <md-list-item md-expand @click="pegarTodosDominios">
            <md-icon><font-awesome-icon :icon="faListUl" /></md-icon>
            <span class="md-list-item-text">Gerenciar Domínio</span>

            <md-list slot="md-expand">
              <md-list-item class="md-inset">
                <md-field>
                  <label>Nome do Domínio</label>
                  <md-input v-model="dominioSelecionado.nome" :disabled="perm <=5"></md-input>
                </md-field>
              </md-list-item>
              <md-list-item class="md-inset" style="text-align: right">
                <md-button @click="pegarDominio(dominioSelecionado.nome)">MOSTRAR</md-button>
              </md-list-item>
            </md-list>

          </md-list-item>
        </md-list>
      </md-card-content>

    </md-card>


    <md-dialog-alert
      :md-active.sync="erro.mostra"
      :md-content="erro.mensagem" />

    <md-dialog-confirm
      :md-active.sync="deletar.mostra"
      md-title="Tem certeza?"
      :md-content="deletar.mensagem"
      md-confirm-text="Confirma"
      md-cancel-text="Cancelar"
      @md-cancel="deletar.mostra = false"
      @md-confirm="deletarDominio" />
  </div>
</template>

<script>
import { usuarioAtivo, gravarDominio, pegarTodosDominios, deletarDominio, pegarDominioPorNome } from './services'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faPlus, faListUl, faTrash, faSitemap } from '@fortawesome/fontawesome-free-solid'

export default {
  created () {
    console.log(process.env.apiKeyFirebase)
    usuarioAtivo((u, usuario) => {
      if (u) {
        if (usuario.nivel <= 2 || !usuario.nivel) {
          this.$router.push('/')
        } else {
          this.$data.perm = usuario.nivel
          this.$data.usuario = usuario
          this.$data.dominio.dominioPai = usuario.dominio
          if (usuario.nivel <= 5) {
            this.$data.dominio.tipo = 'unico'
            pegarDominioPorNome(usuario.dominio, (err, dominio) => {
              if (err) {
                console.error(err)
              } else {
                this.$data.dominioSelecionado = {
                  nome: usuario.dominio,
                  ...dominio
                }
              }
            })
          }
          console.log(usuario)
        }
      } else {
        this.$router.push('/')
      }
    })
  },
  data () {
    return {
      todosDominios: {},
      dominioSelecionado: {
        nome: ''
      },
      gerenciar: {
        mostra: false
      },
      perm: 0,
      usuario: {},
      dominio: {
        tipo: '',
        nome: '',
        cnpj: '',
        dominioPai: ''
      },
      deletar: {
        mostra: false,
        mensagem: ''
      },
      erro: {
        mostra: false,
        mensagem: ''
      }
    }
  },
  methods: {
    chamarErro (err) {
      this.$data.erro.mensagem = err.message
      this.$data.erro.mostra = true
    },
    pegarTodosDominios () {
      pegarTodosDominios((err, dominios) => {
        if (err) {
          console.error(err)
        } else {
          this.$data.todosDominios = dominios
        }
      })
    },
    registrarDominio () {
      gravarDominio(this.$data.dominio, (err) => {
        if (err) {
          this.chamarErro(err)
        } else {
          this.chamarErro(new Error(`Dominio ${this.$data.dominio.nome} gravado com sucesso!`))
          this.$data.dominio = {
            nome: '',
            cnpj: '',
            tipo: this.$data.perm <= 5 ? 'unico' : '',
            dominioPai: this.$data.usuario.dominio
          }
        }
      })
    },
    deletarDominio () {},
    mostrarDeletar (nome) {
      this.$data.deletar.mensagem = `Tem certeza que deseja deletar o domínio ${nome}?`
      this.$data.deletar.mostra = true

      this.deletarDominio = () => {
        deletarDominio(nome, (err) => {
          if (err) {
            console.error(err)
          } else {
            this.$data.deletar.mostra = false
            delete this.$data.todosDominios[nome]
            this.chamarErro(new Error(`Dominio ${nome} deletado com sucesso!`))
          }
        })
      }
    },
    pegarDominio (nome) {
      if (nome === 'motherload') {
        this.$data.dominioSelecionado.nome = this.$data.usuario.dominio
        nome = this.$data.usuario.dominio
      }
      pegarDominioPorNome(nome, (err, dominio) => {
        if (err) {
          console.error(err)
        } else {
          if (dominio) {
            if (dominio.tipo === 'unico') {
              this.chamarErro(new Error('Domínios únicos não possuem gerenciamento detalhado!'))
            } else {
              this.$data.dominioSelecionado = {
                nome: nome,
                ...dominio
              }
              this.$data.gerenciar.mostra = true
            }
          } else {
            this.chamarErro(new Error('Domínio não localizado!'))
          }
        }
      })
    }
  },
  components: {
    FontAwesomeIcon
  },
  computed: {
    faPlus: _ => faPlus,
    faListUl: _ => faListUl,
    faTrash: _ => faTrash,
    faSitemap: _ => faSitemap
  }
}
</script>

<style lang="scss" scoped>

</style>
