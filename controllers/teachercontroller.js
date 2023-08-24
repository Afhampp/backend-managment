const teacherdb=require('../models/teachermodel')
const studentdb=require('../models/studentmodel')
const classdb=require('../models/classmodel')
const attendancedb=require('../models/attedancemodel')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';
const cloudinary=require('../middleware/cloudinary')
const path = require('path');



const teacherlogin=async(req,res)=>{
    try {
        const findall = await teacherdb.findOne({ email: req.body.email });
        if (findall) {
          const passcompare = await bcrypt.compare(req.body.password, findall.password);
          if (passcompare) {
            const token = jwt.sign({ value: findall }, secretKey, { expiresIn: '6000000' });
            res.status(200).json({ status: 'success', token });
          } else {
            res.status(200).json({ status: 'error', msg: 'Invalid password', check: 'pass' });
          }
        } else {
          res.status(200).json({ status: 'error', msg: 'Invalid admin', check: 'email' });
        }
      } catch (error) {
        res.status(500).json({ error });
      }
}

const getstudentfromclass=async(req,res)=>{
  try {
     const getdat=await classdb.findOne({_id:req.params.id})

     const getdata= getdat.students
     const studentData = [];
      for (const teacherId of getdata) {
        const teacher = await studentdb.findOne({ _id: teacherId });
        studentData.push(teacher);
      }
     res.status(200).json({ studentData });
      
    } catch (error) {
      res.status(500).json({ error });
    }
}

const getcount = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;
    const teacherData = await teacherdb
      .findOne({ _id: teacherId })
      .populate('classes');

    let totalClasses = 0;
    let totalStudents = 0;
    let classAttendance = []; 

    for (const classInfo of teacherData.classes) {
      const classId = classInfo._id;
      const attendanceData = await attendancedb
        .findOne({ class: classId }) 
        .populate('teachers.teacher');

      let classAttendanceCount = 0; 

      if (attendanceData) {
        for (const teacherAttendance of attendanceData.teachers) {
          if (teacherAttendance.teacher._id.equals(teacherId)) {
            for (const studentAttendance of teacherAttendance.students) {
              for (const attendanceRecord of studentAttendance.attendance) {
                if (attendanceRecord.status === 'present') {
                  classAttendanceCount++;
                }
              }
            }
            break; 
          }
        }
      }

      totalClasses++;
      totalStudents += classInfo.students.length;

      classAttendance.push({
        className: classInfo.name,
        attendanceCount: classAttendanceCount,
      });
    }
    console.log(classAttendance)

    res.status(200).json({ totalClasses, totalStudents, classAttendance });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};





const getclasses = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;
    const teacherData = await teacherdb.findOne({ _id: teacherId }).populate('classes')

    const classes = teacherData.classes;
    let clasvalue=[]
    for(let x of classes){
      clasvalue.push(await classdb.findOne({_id:x}))
    }
    res.status(200).json({ clasvalue });
  } catch (error) {
    res.status(500).json({ error });
  }
};










const baseurl = async (req, res) => {
  try {
    const fileName = req.params.fileName;

    const filePath = path.join(__dirname, '../public/images/uploads/', fileName);

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');


    res.setHeader('Cache-Control', 'no-cache');

   
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Error serving file' });
  }
};








const getteacherid = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);

    const teacherid = decoded.value._id;
    const teachername = decoded.value.name;

    const teacher = await teacherdb.findById(teacherid).populate({
      path: 'classes',
      populate: {
        path: 'students',
        model: 'studentdb',
      },
    });

    const allStudentsData = [];
    const classIds = teacher.classes.map(classData => ({
      classid: classData._id,
      classname: classData.name, 
    }));

    for (const classData of teacher.classes) {
      for (const student of classData.students) {
        allStudentsData.push({ 
          _id: student._id, 
          name: student.name,
        });
      }
    }

    res.status(200).json({
      teacherid,
      teachername,
      allStudentsData,
      classIds,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};



const getattendacedata = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);

    const teacherid = decoded.value._id;
    const classid = req.params.id;

    const attendanceData = await attendancedb.findOne({
      'teachers.teacher': teacherid,
      'class': classid
    })
    .populate('teachers.students.student', 'name') 
    .exec();

    const studentsArray = attendanceData.teachers[0].students;

    const studentsWithStatusCount = studentsArray.map(student => {
      const presentCount = student.attendance.filter(entry => entry.status === 'present').length;
      const absentCount = student.attendance.filter(entry => entry.status === 'absent').length;
    
      return {
        student: student.student,
        attendance: student.attendance,
        presentCount: presentCount || 0, 
        absentCount: absentCount || 0 
      };
    });
    console.log(studentsWithStatusCount)
   
    res.status(200).json({ studentsWithStatusCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addattendace = async (req, res) => {
  try {
    const { classid, teacherid, studentid, status } = req.body;

    const currentDate = new Date();
    const formattedDate = new Date(currentDate.toISOString().split('T')[0]); 
   

   
    const attendanceEntry = {
      date: formattedDate,
      status: status
    };

   
    const existingAttendance = await attendancedb.findOne(
      {
        'class': classid,
        'teachers.teacher': teacherid,
        'teachers.students': {
          $elemMatch: {
            student: studentid,
            'attendance.date': formattedDate
          }
        }
      }
    );
    

    if (existingAttendance) {
      return res.status(402).json({ status: 'error' });
    }


    await attendancedb.findOneAndUpdate(
      {
        'class': classid,
        'teachers.teacher': teacherid,
        'teachers.students.student': studentid
      },
      {
        $push: {
          'teachers.$[teacher].students.$[student].attendance': attendanceEntry
        }
      },
      {
        arrayFilters: [
          { 'teacher.teacher': teacherid },
          { 'student.student': studentid }
        ],
        new: true
      }
    );

    res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getattedancedate = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);

    const teacherid = decoded.value._id;
    const classId = req.params.classid;
    const studentId = req.query.studentId;

    const attendanceData = await attendancedb.findOne({
      class: classId,
      'teachers.teacher': teacherid,
      'teachers.students.student': studentId
    })
    .populate('teachers.students.student', 'name') 
    .exec();
    
    
    
    const studentAttendance = attendanceData.teachers[0].students[0].attendance;



    res.status(200).json(studentAttendance);
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};

const updateattendace = async (req, res) => {
  try {
    const { classid, teacherid, studentid, date, status } = req.body;

    const parsedDate = new Date(date);

    const x=await attendancedb.findOneAndUpdate(
      {
        class: classid,
        'teachers.teacher': teacherid,
        'teachers.students': {
          $elemMatch: {
            student: studentid,
            'attendance.date': parsedDate
          }
        }
      },
      {
        $set: {
          'teachers.$[teacher].students.$[student].attendance.$[attendance].status': status
        }
      },
      {
        arrayFilters: [
          { 'teacher.teacher': teacherid },
          { 'student.student': studentid },
          { 'attendance.date': parsedDate }
        ],
        new: true
      }
    );

    res.status(200).json({ status: 'success' });
  } catch (error) {
   
    res.status(500).json({ error: error.message });
  }
};





















module.exports = {
  teacherlogin,
  getstudentfromclass,
  getclasses,
  baseurl,
  getteacherid,
  getattendacedata,
  addattendace,
  getattedancedate,
  updateattendace,
  getcount
};