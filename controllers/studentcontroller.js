const teacherdb = require("../models/teachermodel");
const bcrypt = require("bcrypt");
const assigmentdb=require('../models/assigmentmodels')
const studentdb = require("../models/studentmodel");
const classdb = require("../models/classmodel");
const notesdb=require('../models/notesmodels')
const attendancedb=require('../models/attedancemodel')
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";
const cloudinary=require('../middleware/cloudinary')


const hasspassword = async (pass) => {
  const converpass = await bcrypt.hash(pass, 10);
  return converpass;
};




const studentlogin = async (req, res) => {
  try {
    console.log("hai")
    const findall = await studentdb.findOne({ email: req.body.email });
    if (findall) {
      const passcompare = await bcrypt.compare(
        req.body.password,
        findall.password
      );
      if (passcompare) {
        const token = jwt.sign({ value: findall }, secretKey, {
          expiresIn: "6000000",
        });
        res.status(200).json({ status: "success", token });
      } else {
        res
          .status(200)
          .json({ status: "error", msg: "Invalid password", check: "pass" });
      }
    } else {
      res
        .status(200)
        .json({ status: "error", msg: "Invalid admin", check: "email" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};


const getnotes=async(req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value.classes;

   const getdata=await notesdb.find({class:teacherId}).populate('teacher')
      res.status(200).json({getdata})
    } catch (error) {
      res.status(500).json({ error });
    }
}
const getstudentid = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const studentid = decoded.value._id;
    const studentname=decoded.value.name
    const student = await studentdb.findById(studentid).populate({
      path: 'classes',
      populate: {
        path: 'teachers',
        model: 'teacherdb',
        select: '_id name', 
      },
    });
    console.log(student)
  
    const classes=[]
    classes.push(student.classes)
    const teachersData = [];
    const classData = student.classes;
    for (const teacher of classData.teachers) {
      teachersData.push({
        _id: teacher._id, 
        name: teacher.name, 
      });
    }
 

    res.status(200).json({
      studentid,
      studentname,
      teachersData, 
      classes
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};



const getattendace = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const studentId = decoded.value._id;

    const student = await studentdb.findById(studentId).populate('classes');

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    const attendanceData = await attendancedb.findOne({ class: student.classes._id })
      .populate({
        path: 'teachers.teacher',
        select: 'name subjects', 
      });

    if (!attendanceData) {
      console.log('Attendance data not found for the class.');
      return res.status(404).json({ message: 'Attendance data not found for the class.' });
    }

    const studentAttendance = attendanceData.teachers.find(teacherData =>
      teacherData.students.some(studentData => studentData.student.toString() === studentId)
    );

    if (!studentAttendance || !studentAttendance.students || studentAttendance.students.length === 0) {
      console.log('Student attendance not found.');
      return res.status(404).json({ message: 'Student attendance not found.' });
    }

    const teacherName = studentAttendance.teacher.name;
    const teacherId = studentAttendance.teacher._id;
    const teacherSubjects = studentAttendance.teacher.subjects; 
    const attendanceDetails = studentAttendance.students[0]?.attendance || [];

    const teacherAttendanceArray = attendanceData.teachers.map(teacherData => {
      const teacher = teacherData.teacher;
      const presentCount = teacherData.students.reduce((total, studentData) => {
        return total + studentData.attendance.filter(att => att.status === 'present').length;
      }, 0);
      const absentCount = teacherData.students.reduce((total, studentData) => {
        return total + studentData.attendance.filter(att => att.status === 'absent').length;
      }, 0);

      return {
        teacherName: teacher.name,
        teacherId: teacher._id,
        teacherSubjects, 
        presentCount,
        absentCount,
      };
    });
    console.log(teacherAttendanceArray);

    res.status(200).json({
      
      teacherAttendanceArray,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getclass=async(req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const classid = decoded.value.classes;

   
      res.status(200).json({classid})
    } catch (error) {
      res.status(500).json({ error });
    }
}

const getcountstudent = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const classid = decoded.value.classes;
    const studentid = decoded.value._id;

    const classes = await classdb.findOne({ _id: classid });
    const teachercount = classes.teachers.length;
    const teacherIds = classes.teachers.map(teacher => teacher);

    const teacherData = [];

    for (const teacherId of teacherIds) {
      const teacher = await teacherdb.findOne({ _id: teacherId });

      const attendance = await attendancedb.findOne({
        class: classid,
        'teachers.teacher': teacherId,
        'teachers.students.student': studentid,
      });

      let presentCount = 0;
      let absentCount = 0;
      let totalMarks = 0;


      if (attendance) {
        const teacherInfo = attendance.teachers.find(t => {
          const isMatch = t.teacher.equals(teacherId);
          
          return isMatch;
        });
       
        if(teacherInfo){
          
        
          const studentInfo = teacherInfo.students.find(s => {
            const isMatch = s.student.equals(studentid);
          
            return isMatch;
          });
        
 
          if (studentInfo) {
            for (const record of studentInfo.attendance) {
              if (record.status === 'present') {
                presentCount++;
              } else if (record.status === 'absent') {
                absentCount++;
              }
            }
          }
        }
      

        
      }

      const assignments = await assigmentdb.find({ teacher: teacherId });
      for (const assignment of assignments) {
        const submission = assignment.submittion.find(sub => sub.student.toString() === studentid);
        if (submission && submission.mark) {
          totalMarks += submission.mark;
        }
      }

      teacherData.push({
        teacherName: teacher.subjects,
        presentCount,
        absentCount,
        totalMarks,
      });
    }
   

    

    res.status(200).json({ teacherData, teachercount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const profilechange= async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const classid = decoded.value.classes;
    const studentid = decoded.value._id;
    const result = await cloudinary.uploader.upload(req.file.path);

    
    await studentdb.updateOne({_id:studentid},{$set:{image:result.public_id}})


   res.status(200).json({success:true})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

const getprofile= async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const classid = decoded.value.classes;
    const studentid = decoded.value._id;
    const data=await studentdb.findOne({_id:studentid})


   res.status(200).json({data})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};
const forgetpass= async (req, res) => {
  try {
    console.log(req.body)
    if(req.body.password==req.body.confirm){
      const hasspass=await hasspassword(req.body.password)
      await studentdb.updateOne({_id:req.body.id},{$set:{password:hasspass}})
      res.status(200).json({status:"true"})
    }
    else{
      console.log("hai")
      res.status(200).json({status:"false"})
    }
    
    
   


   
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};








module.exports = {

  studentlogin,
  profilechange,
  getstudentid,
  getnotes,
  getattendace,
  getclass,
  getcountstudent,
  getprofile,
  forgetpass
};
