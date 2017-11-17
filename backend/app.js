import express from 'express';
const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.all('/', (req, res, next) => {
    res.status(200).send();
    next();
  });
}


module.exports = app;
