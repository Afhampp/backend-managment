const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'classdb',
  },
  teachers: [
    {
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacherdb',
      },
      students: [
        {
          student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'studentdb',
          },
          attendance: [
            {
              date: {
                type: Date, 
                default: Date.now,
              },
              status: {
                type: String, 
              },
            },
          ],
        },
      ],
    },
  ],
});

module.exports = mongoose.model('attendancedb', attendanceSchema);
