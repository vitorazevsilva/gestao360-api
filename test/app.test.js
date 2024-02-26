const request = require('supertest');

const app = require('../src/app');

test('[APP][GET][1] - App to resolve at the root', () => request(app)
  .get('/')
  .then((res) => {
    expect(res.status).toBe(200);
  }));

test('[APP][GET][2] - Page Not Found', () => request(app)
  .get('/notfound')
  .then((res) => {
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Pedido Desconhecido!');
  }));

test('[APP][GET][3] - Error 500', () => request(app)
  .get('/error500')
  .then((res) => {
    expect(res.status).toBe(500);
    console.log('%capp.test.js line:22 res', 'color: #007acc;', res.body);
    expect(res.body.error).toBe(`Ocorreu um erro interno no servidor. Por favor, entre em contacto com o suporte técnico e forneça o seguintes id: ${res.body.id}`);
  }));
