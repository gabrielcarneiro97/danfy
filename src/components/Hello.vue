<template>
<div>
  <div class="md-layout">
    <md-content class="md-layout-item md-size-100 md-layout md-accent p1">

      <div class="md-layout-item md-size-25"></div>
      
      <div class="md-layout-item md-size-50" style="text-align: center; padding-top: 1%">
        <h1 style="font-size: 300%">DANFY <span id="label">ALPHA ({{version}})</span></h1>
        <div class="titulo" style="color: black; margin-top: 0%">Um novo modo de controlar o seu movimento fiscal!</div>
      </div>
      <div class="md-layout-item md-size-20" style="text-align: left;">
        <font-awesome-icon color="black" :icon="faFileAlt" size="10x" />
      </div>
    </md-content>
  </div>
  <div class="md-layout">
    <md-content class="md-layout-item md-size-100 md-layout md-gutter md-primary p2">
      <div class="md-layout-item" style="text-align: center">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faFileCode" size="5x" />
        </div>
        <div>
          <div class="titulo">Entrada de dados via XML</div>
          <div class="texto">
            O DANFY lê os dados via XML de notas fiscais, tanto de compra e venda, como de serviços. Fazendo assim com que a entrada de dados seja automatizada, diminuindo os erros humanos!
          </div>
        </div>
      </div>
      <div class="md-layout-item" style="text-align: center">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faMagic" size="5x" />
        </div>
        <div>
          <div class="titulo">Conciliação automática</div>
          <div class="texto">
            O DANFY automaticamente concilia notas fiscais com o mesmo produto, criando um movimento de acordo com as informações da nota!
          </div>
        </div>
      </div>
      <div class="md-layout-item" style="text-align: center">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faMoneyBillAlt" size="5x" />
        </div>
        <div>
          <div class="titulo">Calculo de impostos</div>
          <div class="texto">
            O DANFY calcula os impostos dos movimentos, para simples conferência, garantindo assim os valores calculados por outros sistemas.
          </div>
        </div>
      </div>         
    </md-content>
  </div>
  <div class="md-layout">
    <md-content class="md-layout-item md-size-100 md-layout md-gutter md-primary p1">
      <div class="md-layout-item" style="text-align: center">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faDatabase" size="5x"  />
        </div>
        <div>
          <div class="titulo">Sem importações</div>
          <div class="texto">
            O DANFY não precisa de importação de banco de dados, extraindo todas as informações que precisa diretamente das notas fiscais!
          </div>
        </div>
      </div>
      <div class="md-layout-item" style="text-align: center">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faFastForward" size="5x" />
        </div>
        <div>
          <div class="titulo">Agilidade</div>
          <div class="texto">
            O DANFY agiliza a conciliação e conferência dos movimentos fiscais, aumentando a consistência e confiabilidade dos dados gerados.
          </div>
        </div>
      </div>
      <div class="md-layout-item" style="text-align: center">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="white" :icon="faUsers" size="5x" />
        </div>
        <div>
          <div class="titulo">Acesso aos clientes</div>
          <div class="texto">
            O DANFY disponibiliza um acesso limitado aos clientes, onde eles têm acesso as informações referentes somente a sua empresa.
          </div>
        </div>
      </div>      
    </md-content>
  </div>
  <div class="md-layout">
    <md-content class="md-layout-item md-size-100 md-layout md-gutter md-accent p1" style="padding-bottom: 4%; padding-top: 4%">
      <div class="md-layout-item" style="text-align: center">
        <div>
          <div class="titulo-2" style="font-size: 200%; font-weight: 400; color: black; margin-bottom: 0; margin-top: 0">Como funciona?</div>
        </div>
      </div>
    </md-content>
  </div>
  <div class="md-layout">
    <md-content class="md-layout-item md-size-100 md-layout md-alignment-center-center md-accent p1" style="padding-top: 0">
      <div class="md-layout-item md-size-30" style="text-align: center;">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="black" :icon="faDownload" size="5x"  />
        </div>
        <div>
          <div class="titulo-2" style="color: black">Importe as notas</div>
        </div>
      </div>
      <div class="md-layout-item md-size-5" style="text-align: center;">
        <font-awesome-icon color="black" :icon="faArrowRight" size="5x" />
      </div>
      <div class="md-layout-item md-size-30" style="text-align: center;">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="black" :icon="faCodeBranch" size="5x"  />
        </div>
        <div>
          <div class="titulo-2" style="color: black">Concilie os movimentos</div>
        </div>
      </div>
      <div class="md-layout-item md-size-5" style="text-align: center">
        <font-awesome-icon color="black" :icon="faArrowRight" size="5x" />
      </div>
      <div class="md-layout-item md-size-30" style="text-align: center;">
        <div style="margin-bottom: 2%">
          <font-awesome-icon color="black" :icon="faListOl" size="5x"  />
        </div>
        <div>
          <div class="titulo-2" style="color: black">Visualize os relatórios</div>
        </div>
      </div>     
    </md-content>
  </div>
  <div class="md-layout">
    <md-content class="md-layout-item md-size-100 md-layout md-primary p1 md-alignment-top-center">
      <div class="md-layout-item md-size-10"></div>
      
      <div class="md-layout-item md-size-50" style="text-align: center; padding-top: 1%">
        <div class="titulo-2" style="color: white">Aumente a sua produtividade com o DANFY!</div>
      </div>
      <div class="md-layout-item md-size-20" style="text-align: left; margin-left: -4vw">
        <font-awesome-icon color="white" :icon="faFire" size="8x"/>
      </div>
    </md-content>
  </div>
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
