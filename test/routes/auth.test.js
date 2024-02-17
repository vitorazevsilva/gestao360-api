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
      nif: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{8}'),
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
});

test('[AUTH][1] - Tentar registar sem preencher os campos obrigatorios', () => {
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
      nif: '',
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

test('[AUTH][2] - Tentar registar com campos invalidos', () => {
  const pwd = fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' });
  const fakeData = {
    personal: {
      name: fakerPT_PT.person.firstName().split('.', 1)[0],
      email: fakerPT_PT.internet.email().split('@')[0],
      password: pwd,
      confirmPassword: pwd,
    },
    enterprise: {
      name: fakerPT_PT.company.name(),
      email: fakerPT_PT.internet.email().split('@')[0],
      nif: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{7}'),
      address: fakerPT_PT.location.streetAddress(true),
      cp: fakerPT_PT.location.zipCode('######'),
      locality: `${fakerPT_PT.location.city()}123`,
      country: 'Portugal',
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
      expect(res.body.error).toBe('Corrija todos os campos invalidos!');
      expect(res.body).toHaveProperty('fields');
      expect(res.body.fields).toHaveLength(10);
    });
});

test('[AUTH][3] - Tentar registar sem uma palavra-passe segura', () => {
  const pwd = fakerPT_PT.internet.password({ length: 12 });
  const fakeData = {
    personal: {
      name: fakerPT_PT.person.fullName().split('.', 1)[0],
      email: fakerPT_PT.internet.email(),
      password: pwd,
      confirmPassword: pwd,
    },
    enterprise: {
      name: fakerPT_PT.company.name(),
      email: fakerPT_PT.internet.email(),
      nif: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{8}'),
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
    personal: {
      name: fakerPT_PT.person.fullName().split('.', 1)[0],
      email: fakerPT_PT.internet.email(),
      password: fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' }),
      confirmPassword: fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' }),
    },
    enterprise: {
      name: fakerPT_PT.company.name(),
      email: fakerPT_PT.internet.email(),
      nif: fakerPT_PT.helpers.fromRegExp('[1-3|5|6|8|9][0-9]{8}'),
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
