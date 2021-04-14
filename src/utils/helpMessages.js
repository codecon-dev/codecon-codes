export default {
  claim: {
    help: 'Resgate um código e contabilize pontos!\nObs: funciona apenas no chat privado com o bot',
    examples: ['.claim CODECON21', '.claim 123ABC']
  },
  token: {
    help: `get: veja as informações de um token
  **create**: crie um novo token
  **update**: atualize uma propriedade de um token
  **list**: veja uma lista com todos os tokens em ordem alfabética
  **import**: crie novos tokens a partir de um arquivo CSV
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
    help: `Veja mais informações sobre um usuário pelo seu ID
Dica: ative o modo desenvolvedor nas configurações "Avançado" do discord para poder copiar o ID clicando com o botão direito no usuário
Obs: comando disponível apenas para alguns usuários`,
    examples: ['.user 95609311505424384']
  },
  me: {
    help: 'Veja mais informações sobre você mesmo',
    examples: ['.me']
  },
  rank: {
    help: 'Veja os 10 primeiros colocados no rank',
    examples: ['.rank']
  }
}
