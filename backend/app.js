import express from 'express';
import db from './db/db';
import spotify from './routes/spotify';
import blacklist from './routes/blacklist';


const app = express();
app.use('/spotify', spotify);
app.use('/blacklist', blacklist);

app.use((req, res, next) => {
  const protocol = req.protocol;
  const hostHeaderIndex = req.rawHeaders.indexOf('Host') + 1;
  const host = hostHeaderIndex ? req.rawHeaders[hostHeaderIndex] : undefined;
  Object.defineProperty(req, 'origin', {
    get: () => {
      if (!host)
        return req.headers.referer ? req.headers.referer.substring(0, req.headers.referer.length - 1) : undefined;
      else
        return protocol + '://' + host;
    }
  });
  console.log(`req.origin: ${req.origin}`);
  next();
});

if (process.env.NODE_ENV === 'test') {
  app.all('/', (req, res, next) => {
    res.status(200).send();
    next();
  });
}


module.exports = app;
