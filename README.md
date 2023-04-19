# danfy

### Disposições gerais

O *danfy* tem como objetivo conciliar movimentos fiscais, capturando valores dos xmls das notas fiscais para fazer o calculo de impostos de acordo com as informações contidas nas notas.

### Deploy
Para fazer o deploy da aplicação, rodar os seguintes comandos:
```
yarn build
firebase deploy --only hosting
```
Para rodar o Firebase CLI, é necessário ter o `firebase-tools` instalado e rodar o `firebase login`. É também aconselhável atualizar o `version` no `package.json`, que é exibida na tela.
