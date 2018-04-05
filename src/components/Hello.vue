<template>
<div>

    <v-layout row wrap class="p1" text-xs-center>
      <v-flex xs6 offset-xs3>
        <h1 style="font-size: 300%">DANFY <span id="label">ALPHA ({{version}})</span></h1>
        <div class="titulo" style="color: black; margin-top: 0%">Um novo modo de controlar o seu movimento fiscal!</div>
      </v-flex>

      <v-flex xs3 text-xs-left>  
        <font-awesome-icon color="black" :icon="faFileAlt" size="10x" />
      </v-flex>
    </v-layout>

    <v-layout row class="p2" primary text-xs-center>
      <v-flex xs4>
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faFileCode" size="5x" />
        </div>
        <div>
          <div class="titulo">Entrada de dados via XML</div>
          <div class="texto">
            O DANFY lê os dados via XML de notas fiscais, tanto de compra e venda, como de serviços. Fazendo assim com que a entrada de dados seja automatizada, diminuindo os erros humanos!
          </div>
        </div>
      </v-flex>
      <v-flex xs4>
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faMagic" size="5x" />
        </div>
        <div>
          <div class="titulo">Conciliação automática</div>
          <div class="texto">
            O DANFY automaticamente concilia notas fiscais com o mesmo produto, criando um movimento de acordo com as informações da nota!
          </div>
        </div>
      </v-flex>
      <v-flex xs4>
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faMoneyBillAlt" size="5x" />
        </div>
        <div>
          <div class="titulo">Calculo de impostos</div>
          <div class="texto">
            O DANFY calcula os impostos dos movimentos, para simples conferência, garantindo assim os valores calculados por outros sistemas.
          </div>
        </div>
      </v-flex>
    </v-layout>

    <v-layout row class="p2" primary text-xs-center style="padding-bottom: 3%">
      <v-flex xs4>
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faDatabase" size="5x"  />
        </div>
        <div>
          <div class="titulo">Sem importações</div>
          <div class="texto">
            O DANFY não precisa de importação de banco de dados, extraindo todas as informações que precisa diretamente das notas fiscais!
          </div>
        </div>
      </v-flex>
      <v-flex xs4>
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faFastForward" size="5x" />
        </div>
        <div>
          <div class="titulo">Agilidade</div>
          <div class="texto">
            O DANFY agiliza a conciliação e conferência dos movimentos fiscais, aumentando a consistência e confiabilidade dos dados gerados.
          </div>
        </div>
      </v-flex>
      <v-flex xs4>
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faUsers" size="5x" />
        </div>
        <div>
          <div class="titulo">Acesso aos clientes</div>
          <div class="texto">
            O DANFY disponibiliza um acesso limitado aos clientes, onde eles têm acesso as informações referentes somente a sua empresa.
          </div>
        </div>
      </v-flex>
    </v-layout>

  <v-layout row class="p2" style="padding-bottom: 3%" text-xs-center>
    <v-flex>
      <div class="titulo-2" style="font-size: 200%; font-weight: 400; color: black; margin-bottom: 0; margin-top: 0">Como funciona?</div>    
    </v-flex>
  </v-layout>

  <v-container style="margin-bottom: 3%">
    <v-layout row text-xs-center>
      <v-flex>
        <div style="margin-bottom: 2%">
            <font-awesome-icon color="black" :icon="faDownload" size="5x"  />
          </div>
          <div>
            <div class="titulo-2" style="color: black">Importe as notas</div>
          </div>
      </v-flex>
      <v-flex>
        <font-awesome-icon color="black" :icon="faArrowRight" size="5x" />
      </v-flex>

      <v-flex>
        <div style="margin-bottom: 2%">
            <font-awesome-icon color="black" :icon="faCodeBranch" size="5x"  />
          </div>
          <div>
            <div class="titulo-2" style="color: black">Concilie os movimentos</div>
          </div>
      </v-flex>
      
      <v-flex>
        <font-awesome-icon color="black" :icon="faArrowRight" size="5x" />
      </v-flex>

      <v-flex>
        <div style="margin-bottom: 2%">
            <font-awesome-icon color="black" :icon="faListOl" size="5x"  />
          </div>
          <div>
            <div class="titulo-2" style="color: black">Visualize os relatórios</div>
          </div>
      </v-flex>

      
    </v-layout>
  </v-container>

  <v-layout row primary text-xs-center class="p2" style="padding-bottom: 4%">
    <v-flex offset-xs3 xs6>
        <div class="titulo-2" style="margin-top: 4%">Aumente a sua produtividade com o DANFY!        
          <font-awesome-icon color="white" :icon="faFire" size="4x"/>        
        </div>      
    </v-flex>
  </v-layout>
</div>
</template>

<script>
import { version } from './services'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faFileAlt } from '@fortawesome/fontawesome-free-regular'
import { faDownload, faFire, faMagic, faMoneyBillAlt, faFileCode, faArrowRight,
  faRocket, faUsers, faSpaceShuttle, faFastForward, faCheck, faHandshake, faClock,
  faDatabase, faQuestion, faListOl, faCodeBranch } from '@fortawesome/fontawesome-free-solid'

export default {
  computed: {
    version: _ => version,
    faFileAlt: _ => faFileAlt,
    faDownload: _ => faDownload,
    faFileCode: _ => faFileCode,
    faMagic: _ => faMagic,
    faMoneyBillAlt: _ => faMoneyBillAlt,
    faSpaceShuttle: _ => faSpaceShuttle,
    faCheck: _ => faCheck,
    faHandshake: _ => faHandshake,
    faClock: _ => faClock,
    faDatabase: _ => faDatabase,
    faFire: _ => faFire,
    faQuestion: _ => faQuestion,
    faArrowRight: _ => faArrowRight,
    faListOl: _ => faListOl,
    faCodeBranch: _ => faCodeBranch,
    faRocket: _ => faRocket,
    faUsers: _ => faUsers,
    faFastForward: _ => faFastForward
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style lang="scss" scoped>
  #label {
    font-size: 7px;
    vertical-align: text-top;
  }
  .p1 {
    padding-top: 6%;
    padding-bottom: 6%;    
  }
  .p2 {
    padding-top: 5%;
  }
  .titulo {
    font-size: 180%;
    margin-top: 7%;
    margin-bottom: 5%;
    font-weight: 100;
    color: white;
  }
  .titulo-2 {
    font-size: 180%;
    margin-top: 7%;
    margin-bottom: 5%;
    font-weight: 300;
    color: white;
  }
  .texto {
    font-weight: 300;
    color: white;
  }
</style>
