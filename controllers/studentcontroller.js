const teacherdb = require("../models/teachermodel");
const assigmentdb=require('../models/assigmentmodels')
const studentdb = require("../models/studentmodel");
const classdb = require("../models/classmodel");
const notesdb=require('../models/notesmodels')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";

const studentlogin = async (req, res) => {
  try {
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
const getassigment=async(req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value.classes;

   const getdata=await assigmentdb.find({class:teacherId}).populate('teacher')
      res.status(200).json({getdata})
    } catch (error) {
      res.status(500).json({ error });
    }
}

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
    // Find the student document by ID and populate the 'classes' field with the associated documents
    const student = await studentdb.findById(studentid).populate({
      path: 'classes',
      populate: {
        path: 'teachers',
        model: 'teacherdb',
        select: '_id name', // Select only '_id' and 'name' fields of the teacher document
      },
    });
    console.log(student)

    // Collect teacher details from the classes the student is enrolled in
    const teachersData = [];
    const classData = student.classes;
    for (const teacher of classData.teachers) {
      teachersData.push({
        _id: teacher._id, // Send the teacher ID
        name: teacher.name, // Send the teacher name
      });
    }
    console.log(teachersData);

    res.status(200).json({
      studentid,
      studentname,
      teachersData, // Send the array of teacher details associated with the student
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};


const assigmentsubmittion= async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const studentid = decoded.value._id;
    console.log(req.file)
    console.log(req.params.id)
    console.log(studentid)
    const fileData = {
      student: studentid,
      file: req.file.filename,
      date: Date.now(), // Use current date for submission date
    };
    const assignmentId = req.params.id;
    const assignment = await assigmentdb.findById(assignmentId);
    // Find the assignment using req.params.id
    const existingSubmissionIndex = assignment.submittion.findIndex(
      (submission) => submission.student.toString() === studentid
    );

    if (existingSubmissionIndex !== -1) {
      // If the student's submission exists, update the relevant fields
      assignment.submittion[existingSubmissionIndex].file = req.file.filename;
      assignment.submittion[existingSubmissionIndex].date = Date.now();
    } else {
      // If the student's submission doesn't exist, add it as a new entry
      assignment.submittion.push(fileData);
    }
    await assignment.save();
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  studentlogin,
  getassigment,
  assigmentsubmittion,
  getstudentid,
  getnotes
};
