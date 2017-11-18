import app from './app';
import bodyParser from 'body-parser';
const expressStatic = require('express').static;


app.use(bodyParser.json());

app.set('port', (process.env.PORT || 3001));
const port = app.get('port');
app.listen(port, () => console.log(`Find the server at: http://localhost:${port.toString()}/`));

if (process.env.NODE_ENV === 'production') {
  app.use('*', (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') { // Specific to deployment on Heroku
      res.redirect('https://' + req.get('host') + req.url);
    } else {
      next();
    }
  });

  app.get('*', (req, res, next) => {
    if (req.url.indexOf('main.') !== -1) {
      req.url = req.url + '.gz';
      res.set('Content-Encoding', 'gzip');
      const contentType = req.url.indexOf('.css') !== -1 ? 'text/css' : 'application/javascript';
      res.set('Content-Type', contentType);
    }
    next();
  });

  app.use(expressStatic('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
