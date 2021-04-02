export default {
  claim: {
    help: 'Resgate um código e contabilize pontos!',
    examples: ['.claim CODECON21', '.claim 123ABC']
  },
  token: {
    help: `get: veja as informações de um token
  create: crie um novo token
  update: atualize uma propriedade de um token
  list: veja uma lista com todos os tokens em ordem alfabética
  Obs: comando apenas disponível para cargos previamente configurados`,
    examples: ['.token get CODECON21', '.token create', '.token update', '.token list']
  },
  about: {
    help: 'Saiba mais sobre este bot',
    examples: ['.about']
  },
  help: {
    help: 'Boa tentativa',
    examples: ['.help']
  },
  user: {
    help: 'Veja mais informações sobre um usuário pelo seu ID\nObs: comando disponível apenas para alguns usuários',
    examples: ['.user 95609311505424384']
  }
}
