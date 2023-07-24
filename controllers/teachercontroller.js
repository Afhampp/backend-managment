const teacherdb=require('../models/teachermodel')
const studentdb=require('../models/studentmodel')
const classdb=require('../models/classmodel')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key';


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
console.log(clasvalue)
    res.status(200).json({ clasvalue });
  } catch (error) {
    res.status(500).json({ error });
  }
};




module.exports={
    teacherlogin,
    getstudentfromclass,
    getclasses
}