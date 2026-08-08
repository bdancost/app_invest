module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // nova funcionalidade
        "fix", // correção de bug
        "docs", // documentação
        "style", // formatação, sem mudança de lógica
        "refactor", // refatoração sem mudar comportamento
        "perf", // melhoria de performance (vai ser MUITO usado com o Big O 😉)
        "test", // testes
        "chore", // manutenção, configs, deps
        "ci", // pipelines
      ],
    ],
  },
};
