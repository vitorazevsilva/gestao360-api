/* eslint-disable camelcase */
const request = require('supertest');
const { fakerPT_PT } = require('@faker-js/faker');
const app = require('../../src/app');

const MAIN_ROUTE = '/auths';

let account;
let fakeAccountData;

beforeAll(async () => {
  const pwd = fakerPT_PT.internet.password({ length: 12, prefix: '$Ab1' });
  fakeAccountData = {
    personal: {
      name: fakerPT_PT.person.fullName(),
      email: fakerPT_PT.internet.email(),
      password: pwd,
      confirmPassword: pwd,
    },
    enterprise: {
      name: fakerPT_PT.company.name(),
      email: fakerPT_PT.internet.email(),
      nif: fakerPT_PT.helpers.fromRegExp(/[1-9]\d{8}/),
      address: fakerPT_PT.location.streetAddress(true),
      cp: fakerPT_PT.location.zipCode('####-###'),
      locality: fakerPT_PT.location.city(),
      country: 'Portugal',
      telephone: fakerPT_PT.helpers.fromRegExp(/(\+351 9)([0-9]{8})/),
      cellphone: fakerPT_PT.helpers.fromRegExp(/(\+351 2)([0-9]{8})/),
      fax: fakerPT_PT.helpers.fromRegExp(/(\+351 2)([0-9]{8})/),
      website: fakerPT_PT.internet.url(),
    },
  };
  const resAccount = await app.services.auth.signup(fakeAccountData);
  account = { ...resAccount };
});

test('[1] - Atualizar palavra-passe sem a ultima palavra-passe', () => {
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
      expect(res.body).toHaveProperty('fields', [
        'personal.name',
        'personal.email',
        'personal.password',
        'enterprise.name',
        'enterprise.email',
        'enterprise.nif',
        'enterprise.address',
        'enterprise.cp',
        'enterprise.locality',
        'enterprise.country',
      ]);
    });
});
