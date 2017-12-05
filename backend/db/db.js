import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || require('../local-dev-creds').MONGODB_URI;
const options = { useMongoClient: true };
mongoose.connect(uri, options);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to Mongoose'));

// Todo: close mongoose connection upon app termination. Below, may solve issue but currently untested
process.on('SIGINT', () => { // If the Node process ends
  db.db.close(err => {
    if (err) {
      throw err;
    }
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});
