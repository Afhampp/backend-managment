const admindb = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = "your-secret-key";
const teacherdb = require("../models/teachermodel");
const subjectdb = require("../models/subjectmodel");
const studentdb = require("../models/studentmodel");
const classdb = require("../models/classmodel");

const hasspassword = async (pass) => {
  const converpass = await bcrypt.hash(pass, 10);
  return converpass;
};

const adminlogin = async (req, res) => {
  try {
    const emailchecker = await admindb.findOne({ name: req.body.name });
    if (emailchecker) {
      const passcompare = await bcrypt.compare(
        req.body.password,
        emailchecker.password
      );
      if (passcompare) {
        const token = jwt.sign({ value: emailchecker }, secretKey, {
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

const addtecher = async (req, res) => {
  try {
    console.log(req.body);
    if (req.body.password == req.body.confirm) {
      const hashpass = await hasspassword(req.body.password);
      await teacherdb.insertMany([
        {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: hashpass,
          subjects: req.body.subject,
        },
      ]);

      res.status(200).json({ status: "success" });
    } else {
      res.status(200).json({ status: "error" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const addclass = async (req, res) => {
  try {
    console.log(req.body);
    const find = await classdb.findOne({ name: req.body.name });
    if (find) {
      res.status(200).json({ status: "error" });
    } else {
      await classdb.create({ name: req.body.name });
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};
const addstudent = async (req, res) => {
  try {
    console.log(req.body);
    if (req.body.password == req.body.confirm) {
      const hashpass = await hasspassword(req.body.password);

      await studentdb.insertMany([
        {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: hashpass,
        },
      ]);
      res.status(200).json({ status: "success" });
    } else {
      res.status(200).json({ status: "error" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getteacher = async (req, res) => {
  try {
    const getdata = await teacherdb.find();
    //  console.log(getdata)
    res.status(200).json({ getdata });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const getsubject = async (req, res) => {
  try {
    const getdata = await subjectdb.find();
    res.status(200).json({ getdata });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const getstudent = async (req, res) => {
  try {
    const getdata = await studentdb.find();
    res.status(200).json({ getdata });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const getclass = async (req, res) => {
  try {
    const getdata = await classdb.find();
    res.status(200).json({ getdata });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const getclassid = async (req, res) => {
  try {
    const getdat = await classdb.findOne({ _id: req.params.id });

    const getdata = getdat.teachers;
    const teacherData = [];
    for (const teacherId of getdata) {
      const teacher = await teacherdb.findOne({ _id: teacherId });
      teacherData.push(teacher);
    }
    res.status(200).json({ teacherData });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const getclassstudent = async (req, res) => {
  try {
    const getdat = await classdb.findOne({ _id: req.params.id });
    const getdata = getdat.students;

    const studentData = [];
    for (const teacherId of getdata) {
      const student = await studentdb.findOne({ _id: teacherId });
      studentData.push(student);
    }
    res.status(200).json({ studentData });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const teachertoclass = async (req, res) => {
  try {
    await classdb.updateOne(
      { _id: req.params.id },
      { $addToSet: { teachers: { $each: req.body.teachers } } }
    );
    for (let teacherId of req.body.teachers) {
      await teacherdb.updateOne(
        { _id: teacherId },
        { $push: { classes: req.params.id } }
      );
    }
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const studenttoclass = async (req, res) => {
  try {
    await classdb.updateOne(
      { _id: req.params.id },
      { $addToSet: { students: { $each: req.body.students } } }
    );
    for(let studentid of req.body.students){
      await studentdb.updateOne({ _id:studentid },
        { $set: { classes: req.params.id } })
    }
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const removeteacher = async (req, res) => {
  try {
    await classdb.updateOne(
      { _id: req.params.id },
      { $pull: { teachers: { $in: req.body._id } } }
    );
    await teacherdb.updateOne(
      { _id: req.body._id },
      { $pull: { classes: { $in: req.params.id } } }
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const removestudent = async (req, res) => {
  try {
    await classdb.updateOne(
      { _id: req.params.id },
      { $pull: { students: { $in: req.body._id } } }
    );
    await studentdb.updateOne({ _id: req.body._id },
      { $unset: { classes: req.params.id  } })
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const updateteacher = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, phone, subject } = req.body;
    await teacherdb.updateOne(
      { _id: req.params.id },
      { $set: { name, email, phone, subjects: subject } }
    );

    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};
const updatesubject = async (req, res) => {
  try {
    const find = await subjectdb.findOne({ subject: req.body.subject });
    if (find) {
      res.status(200).json({ status: "error" });
    } else {
      await subjectdb.updateOne(
        { _id: req.params.id },
        { $set: { subject: req.body.subject } }
      );
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};
const updatestudent = async (req, res) => {
  try {
    const hashpass = await hasspassword(req.body.password);
    await studentdb.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          password: hashpass,
        },
      }
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
const updateclass = async (req, res) => {
  try {
    const find = await classdb.updateOne(
      { _id: req.params.id },
      { $set: { name: req.body.name } }
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const deleteteacher = async (req, res) => {
  try {
    await teacherdb.deleteOne({ _id: req.params.id });
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};
const deletaclass = async (req, res) => {
  try {
    await classdb.deleteOne({ _id: req.params.id });
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};
const deletestudent = async (req, res) => {
  try {
    await studentdb.deleteOne({ _id: req.params.id });
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};
const deletesubject = async (req, res) => {
  try {
    await subjectdb.deleteOne({ _id: req.params.id });
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};
const addsubject = async (req, res) => {
  try {
    const find = await subjectdb.findOne({ subject: req.body.subject });
    if (find) {
      res.status(200).json({ status: "error" });
    } else {
      await subjectdb.insertMany([{ subject: req.body.subject }]);
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  adminlogin,
  addtecher,
  getteacher,
  updateteacher,
  deleteteacher,
  addsubject,
  getsubject,
  updatesubject,
  deletesubject,
  addstudent,
  updatestudent,
  deletestudent,
  getstudent,
  addclass,
  getclass,
  updateclass,
  deletaclass,
  getclassid,
  teachertoclass,
  removeteacher,
  getclassstudent,
  studenttoclass,
  removestudent,
};
