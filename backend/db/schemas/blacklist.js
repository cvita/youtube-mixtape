import mongoose from 'mongoose';


const schema = new mongoose.Schema({
  _id: String,
  channelId: String,
  artist: String,
  title: String,
  downvotes: { type: Number, default: 0 },
  updated: { type: Date, default: Date.now },
});


export default mongoose.model('blacklist', schema);
