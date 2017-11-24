import express from 'express';
import bodyParser from 'body-parser';
import rp from 'request-promise';


const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));

// Retrieves access token
router.post('/token', (req, res) => {
  const options = {
    method: 'POST',
    url: 'https://accounts.spotify.com/api/token',
    headers: { authorization: 'Basic OGRlMzIzNjE0N2QyNDU5Y2FjNTg5YTMxMTIxOTIzZTA6MzgxN2YyOTc5NjBhNDI0MDg5NTQ0ODc4NGM4ZGY0ZjY=' },
    form: { grant_type: 'client_credentials' }
  };
  rp(options)
    .then(spotifyRes => res.status(200).send(JSON.parse(spotifyRes)))
    .catch(e => res.status(500).send(err.message));
});


module.exports = router;
