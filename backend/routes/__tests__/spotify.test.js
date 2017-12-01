import request from 'supertest';
import app from '../../app.js';


describe('routes: /spotify', () => {
  it('handles a POST to `/spotify/token` by returning an access token object', () => {
    return request(app)
      .post('/spotify/token')
      .expect(200)
      .then(res => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body).toHaveProperty('token_type');
        expect(res.body).toHaveProperty('expires_in');
      });
  });
});
