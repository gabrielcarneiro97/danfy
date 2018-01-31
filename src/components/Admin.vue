<template>
  <div class="md-layout md-alignment-top-center" style="margin-top: 3%" v-if="temUsuario">
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
            <span class="md-list-item-text">Gerenciar</span>

            <md-list class="md-double-line" slot="md-expand">
              <md-list-item v-for="(dominio, nome) in todosDominios" v-if="(perm <= 5 && (dominio.dominioPai === usuario.dominio || nome === usuario.dominio)) || perm > 5" v-bind:key="nome + 'dominioMostrar'">
               
                <md-icon>
                  <md-button class="md-icon-button md-list-action md-primary" @click="pegarDominio(nome)">
                    <font-awesome-icon :icon="faSitemap" size="lg" />
                  </md-button>
                </md-icon>

                <div class="md-list-item-text">
                  <span>{{nome}}</span>
                  <span v-if="perm > 5 && dominio.tipo === 'unico'">{{dominio.dominioPai}}</span>
                  <span v-else-if="dominio.tipo === 'unico'">CNPJ: {{dominio.empresa}}</span>                  
                  <span v-else>Domínio Múltipo</span>                  
                </div>

                <md-button class="md-icon-button md-list-action md-primary" @click="mostrarDeletar(nome)">
                  <font-awesome-icon :icon="faTrash" size="lg" />
                </md-button>
              </md-list-item>
            </md-list>
          </md-list-item>
        </md-list>
      </md-card-content>

    </md-card>

    <md-dialog :md-active.sync="gerenciar.mostra">
      <md-dialog-title>
        {{dominioSelecionado.nome}}
      </md-dialog-title>

      <md-dialog-content>
        <md-table v-if="dominioSelecionado.empresas">
          <md-table-row>
            <md-table-head>Número</md-table-head>
            <md-table-head>Nome</md-table-head>
            <md-table-head>CNPJ</md-table-head>            
            <md-table-head>Apagar</md-table-head>            
          </md-table-row>

          <md-table-row v-for="(cnpj, num) in dominioSelecionado.empresas" v-bind:key="cnpj + num + 'ger'">
            <md-table-cell>{{num}}</md-table-cell>
            <md-table-cell v-if="pessoas[cnpj]">{{pessoas[cnpj].nome}}</md-table-cell>
            <md-table-cell>{{cnpj}}</md-table-cell>            
            <md-table-cell> 
              <md-button class="md-icon-button md-list-action md-primary" @click="mostraDeletarEmpresa(num, dominioSelecionado.nome)">
                  <font-awesome-icon :icon="faTrash" />
                </md-button>
            </md-table-cell>            
          </md-table-row>

        </md-table>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button @click="gerenciar.mostra = false">FECHAR</md-button>
      </md-dialog-actions>
    </md-dialog>

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

    <md-dialog-confirm
      :md-active.sync="deletar.mostra2"
      md-title="Tem certeza?"
      :md-content="deletar.mensagem"
      md-confirm-text="Confirma"
      md-cancel-text="Cancelar"
      @md-cancel="deletar.mostra2 = false"
      @md-confirm="deletarEmpresaDominio" />
    
  </div>
</template>

<script>
import { usuarioAtivo, gravarDominio, pegarTodosDominios,
  deletarDominio, pegarDominioPorNome, deletarEmpresaDominio,
  cursorCarregando, cursorNormal, pegarPessoaId } from './services'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faPlus, faListUl, faTrash, faSitemap } from '@fortawesome/fontawesome-free-solid'
import _ from 'lodash'

export default {
  created () {
    cursorCarregando()
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
        }
      } else {
        this.$router.push('/')
      }
    })
  },
  data () {
    return {
      todosDominios: {},
      pessoas: {},
      dominioSelecionado: {
        empresas: false,
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
        mostra2: false,
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
    deletarEmpresaDominio () {},
    mostraDeletarEmpresa (num, dominio) {
      this.$data.deletar.mensagem = `Tem certeza que deseja deletar a empresa ${num} do domínio ${dominio}?`
      this.$data.deletar.mostra2 = true

      this.deletarEmpresaDominio = () => {
        deletarEmpresaDominio(dominio, num, (err) => {
          if (err) {
            this.chamarErro(err)
          } else {
            this.$data.deletar.mostra2 = false
            this.$delete(this.$data.dominioSelecionado.empresas, num)
            this.chamarErro(new Error(`Empresa ${num} deletada com sucesso!`))
          }
        })
      }
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
            this.$delete(this.$data.todosDominios, nome)
            this.chamarErro(new Error(`Dominio ${nome} deletado com sucesso!`))
          }
        })
      }
    },
    pegarDominio (nome) {
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
              if (dominio.empresas) {
                Object.keys(dominio.empresas).forEach((num, id, arr) => {
                  let tam = arr.length

                  pegarPessoaId(dominio.empresas[num], (err, pessoa) => {
                    if (err) {
                      console.error(err)
                    } else {
                      this.$data.pessoas[dominio.empresas[num]] = pessoa

                      if (tam - 1 === id) {
                        this.$data.gerenciar.mostra = true
                      }
                    }
                  })
                })
              } else {
                this.chamarErro(new Error(`Domínio selecionado não tem empresas cadastradas!`))
              }
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
    faSitemap: _ => faSitemap,
    temUsuario () {
      return !_.isEmpty(this.$data.usuario)
    },
    temPessoas () {
      return !_.isEmpty(this.$data.pessoas)
    }
  },
  watch: {
    temUsuario (data) {
      if (data) {
        cursorNormal()
      } else {
        cursorCarregando()
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
