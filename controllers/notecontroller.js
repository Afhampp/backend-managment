const teacherdb=require('../models/teachermodel')
const studentdb=require('../models/studentmodel')
const classdb=require('../models/classmodel')
const assigmentdb=require('../models/assigmentmodels')
const notesdb=require('../models/notesmodels')
const attendancedb=require('../models/attedancemodel')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';
const cloudinary=require('../middleware/cloudinary')
const path = require('path');
const { Module } = require('module')


const shownotes=async(req,res)=>{
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      const decoded = jwt.verify(token, secretKey);
      const teacherId = decoded.value._id;
  
     const getdata=await notesdb.find({teacher:teacherId})
        res.status(200).json({getdata})
      } catch (error) {
        res.status(500).json({ error });
      }
  }

  const postnotes=async(req,res)=>{
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      const decoded = jwt.verify(token, secretKey);
      const teacherId = decoded.value._id;
  
  
  await notesdb.insertMany([{name:req.body.name,class:req.body.class,from:req.body.from,teacher:teacherId,file:req.file.filename}])
  res.status(200).json({status:"success"})
        
      } catch (error) {
        res.status(500).json({ error });
      }
  }

  const updatenotes = async (req, res) => {
    try {
    
      await notesdb.updateOne(
        { _id: req.params.id },
        { $set: { name:req.body.name,class:req.body.class,from:req.body.from,file:req.file.filename } }
      );
      res.status(200).json({ status: "success" });
    } catch (error) {
      res.status(500).json({ error });
    }
  };
  
  
  const deletenotes=async (req, res) => {
    try {
      await notesdb.deleteOne({ _id: req.params.id });
      res.status(200).json();
    } catch (error) {
      res.status(500).json({ error });
    }
  };


module.exports = {
    shownotes,
    postnotes,
    updatenotes,
    deletenotes
  };