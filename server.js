const express = require('express');
const app = express();
const spotifyAuth = require('./spotifyAuth');

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/views'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.get('/token', (req, res) => {
    spotifyAuth().then(result => {
    res.send(result);
  });
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));

});