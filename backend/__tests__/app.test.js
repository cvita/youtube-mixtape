import request from 'supertest';
import app from '../app';


describe('Test the root path', () => {
  ['get', 'post', 'put', 'delete'].forEach(method => {
    it(`should respond to the '${method}' method`, async () => {
      const response = await request(app)[method]('/');
      expect(response.statusCode).toBe(200);
    });
  });
});
