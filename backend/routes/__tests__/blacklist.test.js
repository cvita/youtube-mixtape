import request from 'supertest';
import app from '../../app.js';


describe('routes: /blacklist', () => {
  const example = {
    videoId: 'nh-46hP05aY',
    channelId: 'LCb5aNlKdWOySR6Z-CnQieFQ',
    artistName: 'My Band',
    title: 'My Song'
  };

  it('handles a POST to `/` by returning an upserted doc', () => {
    return request(app)
      .post('/blacklist')
      .type('form')
      .send(example)
      .expect(200)
      .then(res => expectValuesAndTypes(res.body, example));
  });

  it('handles a GET to `/:artist` by returning an array of matching docs', () => {
    return request(app)
      .get(`/blacklist/${encodeURIComponent(example.artistName)}`)
      .expect(200)
      .then(res => {
        expect(res.body).toBeInstanceOf(Array);
        expectValuesAndTypes(res.body[0], example);
      });
  });

  it('handles a DELETE to `/:id` by returning the deleted doc', () => {
    return request(app)
      .delete(`/blacklist/${example.videoId}`)
      .expect(200)
      .then(res => expectValuesAndTypes(res.body, example));
  });
});


const expectValuesAndTypes = (res, example) => {
  const { _id, channelId, artist, title, updated, downvotes } = res;
  expect(_id).toEqual(example.videoId);
  expect(channelId).toEqual(example.channelId);
  expect(artist).toEqual(example.artistName);
  expect(title).toEqual(example.title);
  expect(typeof updated).toBe('string');
  expect(typeof downvotes).toBe('number');
};
