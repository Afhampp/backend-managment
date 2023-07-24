const mongoose =require('mongoose')
const classschema = mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'studentdb',
    }],
    teachers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'teacherdb',
    }],
  });
  
module.exports=mongoose.model('classdb',classschema)