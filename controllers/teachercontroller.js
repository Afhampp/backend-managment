const teacherdb=require('../models/teachermodel')
const studentdb=require('../models/studentmodel')
const classdb=require('../models/classmodel')
const assigmentdb=require('../models/assigmentmodels')
const notesdb=require('../models/notesmodels')
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


const postassigment=async(req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;

const result = await cloudinary.uploader.upload(req.file.path);
console.log(result.public_id);
await assigmentdb.insertMany([{name:req.body.name,class:req.body.class,from:req.body.from,to:req.body.to,teacher:teacherId,file:req.file.filename}])
res.status(200).json({status:"success"})
      
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

const showassigment=async(req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;

   const getdata=await assigmentdb.find({teacher:teacherId})
      res.status(200).json({getdata})
    } catch (error) {
      res.status(500).json({ error });
    }
}

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

const baseurl = async (req, res) => {
  try {
    const fileName = req.params.fileName;
    console.log("fileName:", fileName);

    const filePath = path.join(__dirname, '../public/images/uploads/', fileName);

    // Set the appropriate headers for the file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Set the cache control header to no-cache
    res.setHeader('Cache-Control', 'no-cache');

    // Send the file as a response
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Error serving file' });
  }
};

const updateassignment = async (req, res) => {
  try {
    
    await assigmentdb.updateOne(
      { _id: req.params.id },
      { $set: { name:req.body.name,class:req.body.class,from:req.body.from,to:req.body.to,file:req.file.filename } }
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

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
const deleteassigment=async (req, res) => {
  try {
    await assigmentdb.deleteOne({ _id: req.params.id });
    res.status(200).json();
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


const getassigmentsubmitted = async (req, res) => {
  try {
    const assigmentvalue = await assigmentdb
      .findOne({ _id: req.params.id })
      .populate('submittion.student'); // Populate the 'student' field inside 'submittion'

    const submittionArray = assigmentvalue.submittion;

    const submittionWithName = submittionArray.map((submission) => {
      return {
        name: submission.student.name, 
        file: submission.file,
        date: submission.date,
        _id: submission._id,
      };
    });
    res.status(200).json({ submittionWithName });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getteacherid = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secretKey);

    const teacherid = decoded.value._id;
    const teachername = decoded.value.name;

    // Fetch the teacher document and populate the 'classes' field with associated documents
    const teacher = await teacherdb.findById(teacherid).populate({
      path: 'classes',
      populate: {
        path: 'students',
        model: 'studentdb',
      },
    });

    // Collect all students from both classes in a single array
    const allStudentsData = [];
    for (const classData of teacher.classes) {
      for (const student of classData.students) {
        allStudentsData.push({ 
          _id: student._id, // Send the student ID
          name: student.name,
        });
      }
    }

    res.status(200).json({
      teacherid,
      teachername,
       allStudentsData, // Send the array of students
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};









module.exports={
    teacherlogin,
    getstudentfromclass,
    getclasses,
    postassigment,
    showassigment,
    baseurl,
    updateassignment,
    deleteassigment,
    getassigmentsubmitted,
    getteacherid,
    shownotes,
    updatenotes,
    postnotes,
    deletenotes
}