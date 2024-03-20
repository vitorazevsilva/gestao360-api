
# Gestão 360 - API



## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

| Variavel| Obrigatorio | Opções/Exemplo | Default |
| ------- | ----------- | ------ | ------- |
| NODE_ENV | Não | `test`, `development`, `stage`, `production` | `production` |
| HOST | Não |  | `0.0.0.0` |
| PORT | Não |  | `3001` |
| SSL | Não | `true`, `false` | `false` |
| HOSTNAME | Não |  | `http://localhost:${process.env.PORT}` |
| MY_SECRET | Sim | 8e57747e-a7b3-4719-8e98-fc821fde55fc (uuid)|  |
| MAIL_FROM | Sim | Gestão 360 <velma.rohan@ethereal.email> |  |
| DATABASE_URL | Não |  |  |


