/* eslint-disable camelcase */
const request = require('supertest');
const { fakerPT_PT } = require('@faker-js/faker');
const app = require('../../src/app');

const MAIN_ROUTE = '/auth';

let account;
let fakeAccountData;

beforeAll(async () => {
  const pwd = fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' });
  fakeAccountData = {
    personal: {
      name: fakerPT_PT.person.fullName().split('.', 1)[0],
      email: fakerPT_PT.internet.email(),
      password: pwd,
      confirmPassword: pwd,
    },
    enterprise: {
      name: fakerPT_PT.company.name(),
      email: fakerPT_PT.internet.email(),
      nipc: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{8}'),
      address: fakerPT_PT.location.streetAddress(true),
      cp: fakerPT_PT.location.zipCode('####-###'),
      locality: fakerPT_PT.location.city(),
      country: 'Portugal',
      telephone: fakerPT_PT.helpers.fromRegExp('+3512[1-9]{8}'),
      cellphone: fakerPT_PT.helpers.fromRegExp('+3519[1|2|3|6][0-9]{7}'),
      fax: fakerPT_PT.helpers.fromRegExp('+3512[1-9]{8}'),
      website: fakerPT_PT.internet.url(),
    },
  };
  const resAccount = await app.services.auth.signup(fakeAccountData);
  account = { ...resAccount };
  console.log(account);
});

test('[AUTH][1] - Tentar registar sem preencher os campos obrigatórios', () => {
  const fakeData = {
    personal: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    enterprise: {
      name: '',
      email: '',
      nipc: '',
      address: '',
      cp: '',
      locality: '',
      country: '',
      telephone: '',
      cellphone: '',
      fax: '',
      website: '',
    },
  };
  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Preencha todos os campos em falta!');
      expect(res.body).toHaveProperty('fields');
    });
});

test('[AUTH][2] - Tentar registar com campos inválidos', () => {
  const fakeData = {
    ...fakeAccountData,
    personal: {
      ...fakeAccountData.personal,
      name: fakerPT_PT.person.firstName().split('.', 1)[0],
      email: fakerPT_PT.internet.email().split('@')[0],
    },
    enterprise: {
      ...fakeAccountData.enterprise,
      email: fakerPT_PT.internet.email().split('@')[0],
      nipc: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{7}'),
      cp: fakerPT_PT.location.zipCode('######'),
      locality: `${fakerPT_PT.location.city()}123`,
      telephone: fakerPT_PT.helpers.fromRegExp('+35120[0-9]{7}'),
      cellphone: fakerPT_PT.helpers.fromRegExp('+35195[0-9]{7}'),
      fax: fakerPT_PT.helpers.fromRegExp('+35120[0-9]{7}'),
      website: `${fakerPT_PT.internet.url()}?test`,
    },
  };

  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Corrija todos os campos inválidos!');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.fields).toHaveLength(10);
    });
});

test('[AUTH][3] - Tentar registar sem uma palavra-passe segura', () => {
  const pwd = fakerPT_PT.helpers.fromRegExp('[a-z]{8}');
  const fakeData = {
    ...fakeAccountData,
    personal: {
      ...fakeAccountData.personal,
      password: pwd,
      confirmPassword: pwd,
    },
  };
  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('A palavra-passe inserida não é suficientemente segura!');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.fields[0]).toHaveProperty('field', 'personal.password');
    });
});

test('[AUTH][4] - Tentar registar com uma palavra-passe diferente', () => {
  const fakeData = {
    ...fakeAccountData,
    personal: {
      ...fakeAccountData.personal,
      password: fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' }),
      confirmPassword: fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' }),
    },
  };

  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('As palavras-passe não coincidem!');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.fields[0]).toHaveProperty('field', 'personal.confirmPassword');
    });
});

test('[AUTH][5] - Tentar registar com um email pessoal existente no sistema', () => {
  const fakeData = {
    ...fakeAccountData,
  };

  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email já registado no sistema!');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.fields[0]).toHaveProperty('field', 'personal.email');
    });
});

test('[AUTH][6] - Tentar registar com uma empresa já existente no sistema', () => {
  const fakeData = {
    ...fakeAccountData,
    personal: {
      ...fakeAccountData.personal,
      email: fakerPT_PT.internet.email(),
    },
  };

  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Empresa já registada no sistema!');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.fields[0]).toHaveProperty('field', 'enterprise.email');
      expect(res.body.fields[1]).toHaveProperty('field', 'enterprise.nipc');
    });
});

test('[AUTH][7] - Criar uma conta corretamente', () => {
  const fakeData = {
    ...fakeAccountData,
    personal: {
      ...fakeAccountData.personal,
      email: fakerPT_PT.internet.email(),
    },
    enterprise: {
      ...fakeAccountData.enterprise,
      email: fakerPT_PT.internet.email(),
      nipc: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{8}'),
    },
  };

  return request(app)
    .post(`${MAIN_ROUTE}/sign-up`)
    .send(fakeData)
    .then((res) => {
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Codigo enviado por email');
      expect(res.body).toHaveProperty('resendID');
      expect(res.body.resendID).toHaveLength(36);
    });
});

test('[AUTH][8] - Verificação e remoção dos dados não verificados após atraso', async () => {
  const fakeData = {
    ...fakeAccountData,
    personal: {
      ...fakeAccountData.personal,
      email: fakerPT_PT.internet.email(),
    },
    enterprise: {
      ...fakeAccountData.enterprise,
      email: fakerPT_PT.internet.email(),
      nipc: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{8}'),
    },
  };

  const { personal, enterprise, verify } = await app.services.auth.signup(fakeData, true);
  await new Promise((resolve) => { setTimeout(resolve, 1500); });
  let exist;

  exist = await app.db('email_verifications').where({ uniq_id: verify.uniq_id }).first();
  expect(exist).toBeUndefined();
  exist = await app.db('enterprises').where({ id: enterprise.id }).first();
  expect(exist).toBeUndefined();
  exist = await app.db('users').where({ id: personal.id }).first();
  expect(exist).toBeUndefined();
});
