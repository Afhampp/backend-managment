// message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
   
  },
  senderid:{
    type:String
  },
  receiver: {
    type: String,
    
  },
  content: {
    type: String,

  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
