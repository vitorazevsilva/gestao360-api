
# Gestão 360 - API



## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

| Variavel| Obrigatorio | Opções/Exemplo | Default |
| ------- | ----------- | ------ | ------- |
| MY_SECRET | Sim | `8e57747e-a7b3-4719-8e98-fc821fde55fc` (Exp) (uuid obrigatorio)|  |
| MAIL_FROM | Sim | `Gestão 360 <velma.rohan@ethereal.email>` (Exp) |  |
| NODE_ENV | Não | `test`, `development`, `stage`, `production` (Opç) | `production` |
| HOST | Não | `192.168.1.1`, `127.0.0.1`, `0.0.0.0` (Exp) | `0.0.0.0` |
| PORT | Não | `3001` (Exp) | `3001` |
| SSL | Não | `true`, `false` (Opç) | `false` |
| HOSTNAME | Não | `http://localhost` (Exp) | `http://localhost:${process.env.PORT}` |
| DATABASE_URL | Não |  | Array in knexfile.js |
| RATE_MS | Não | `900000` (15 Min), `1800000` (30 Min), `3600000` (1 Hora) (Exp)  | `1800000` (30 Min) |
| RATE_LIMIT | Não | `50`, `100`, `200` (Exp)| `100` |

