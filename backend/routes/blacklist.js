import express from 'express';
import bodyParser from 'body-parser';
import blacklist from '../db/schemas/blacklist';


const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/', (req, res) => {
  const { videoId, channelId, artistName, title } = req.body;
  const query = {
    _id: videoId,
    artist: artistName,
    channelId,
    title
  };
  const update = { $inc: { downvotes: 1 } };
  const options = { upsert: true, new: true };
  blacklist.findOneAndUpdate(query, update, options, (err, doc) => {
    if (err) {
      return handleError(err, res);
    }
    res.status(200).send(doc);
  });
});

router.get('/:artist', (req, res) => {
  const artist = decodeURIComponent(req.params.artist);
  const query = { artist };
  blacklist.find(query, (err, docs) => {
    if (err) {
      return handleError(err, res);
    }
    res.status(200).send(docs);
  });
});

router.delete('/:id', (req, res) => {
  const id = decodeURIComponent(req.params.id);
  blacklist.findByIdAndRemove(id, (err, doc) => {
    if (err) {
      return handleError(err, res);
    }
    res.status(200).send(doc);
  });
});

// helper functions
const handleError = (error, res) => {
  console.error(error);
  res.status(500).send(JSON.stringify(error.message));
};


module.exports = router;
