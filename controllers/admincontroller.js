const admindb = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECREAT_KEY;
const teacherdb = require("../models/teachermodel");
const subjectdb = require("../models/subjectmodel");
const studentdb = require("../models/studentmodel");
const classdb = require("../models/classmodel");
const scheduledb = require("../models/schedulemodel");
const attendancedb = require("../models/attedancemodel");
const nodemailer = require("nodemailer");

const hasspassword = async (pass) => {
  const converpass = await bcrypt.hash(pass, 10);
  return converpass;
};
const sendpasswordverification = (email, name, phone, id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "Collagemail121@gmail.com",
        pass: "vpcqydorbvrwmlkf",
      },
    });
    const mailOption = {
      from: "Collagemail121@gmail.com",
      to: email,
      subject: "for verification email",
      html:
        '<p>here is the otp for email change: <a href="https://frontend-managment.vercel.app/forgetpassword/' +
        id +
        '">Click here</a></p>',
    };
    transporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email send", info.response);
      }
    });
  } catch (error) {
    res.status(500).json(error);
  }
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

const getcount = async (req, res) => {
  try {
    const totalclass = await admindb.find().count();
    const totalteacher = await teacherdb.find().count();
    const totalstudent = await studentdb.find().count();
    const totalsubject = await subjectdb.find().count();

    res
      .status(200)
      .json({ totalclass, totalstudent, totalteacher, totalsubject });
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
      const findclass = await classdb.findOne({ name: req.body.name });

      await scheduledb.create({ class: findclass._id });
      await attendancedb.create({ class: findclass._id });

      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const addstudent = async (req, res) => {
  try {
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
      const find = await studentdb.findOne({ email: req.body.email });
      sendpasswordverification(
        req.body.email,
        req.body.name,
        req.body.phone,
        find._id
      );
      res.status(200).json({ status: "success" });
    } else {
      res.status(200).json({ status: "error" });
    }
  } catch (error) {
    console.log(error);
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
      console.log(teacherId);
      const student = await studentdb.findOne({ _id: teacherId });

      studentData.push(student);
    }
    console.log(studentData);
    res.status(200).json({ studentData });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getschedule = async (req, res) => {
  try {
    const getdat = await scheduledb.findOne({ class: req.params.id });
    let getdata = [];
    getdata.push(getdat.submittion);

    res.status(200).json({ getdata });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const teachertoclass = async (req, res) => {
  try {
    const teacherIds = req.body.teachers;

    await classdb.updateOne(
      { _id: req.params.id },
      { $addToSet: { teachers: { $each: teacherIds } } }
    );

    for (let teacherId of teacherIds) {
      await teacherdb.updateOne(
        { _id: teacherId },
        { $push: { classes: req.params.id } }
      );

      const updatedAttendance = await attendancedb.findOneAndUpdate(
        { class: req.params.id, "teachers.teacher": { $ne: teacherId } },
        {
          $addToSet: {
            teachers: {
              teacher: teacherId,
              students: [],
            },
          },
        },
        { new: true }
      );

      console.log(updatedAttendance);
    }

    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const studenttoclass = async (req, res) => {
  try {
    const teacherIds = await classdb
      .findOne({ _id: req.params.id })
      .select("teachers");

    await classdb.updateOne(
      { _id: req.params.id },
      { $addToSet: { students: { $each: req.body.students } } }
    );

    for (let studentId of req.body.students) {
      await studentdb.updateOne(
        { _id: studentId },
        { $set: { classes: req.params.id } }
      );

      await attendancedb.updateMany(
        {
          class: req.params.id,
          "teachers.teacher": { $in: teacherIds.teachers },
        },
        {
          $addToSet: {
            "teachers.$[teacher].students": {
              student: studentId,
              attendance: [],
            },
          },
        },
        { arrayFilters: [{ "teacher.teacher": { $in: teacherIds.teachers } }] }
      );
    }

    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const removeteacher = async (req, res) => {
  try {
    const teacherId = req.body._id;

    await classdb.updateOne(
      { _id: req.params.id },
      { $pull: { teachers: teacherId } }
    );

    await teacherdb.updateOne(
      { _id: teacherId },
      { $pull: { classes: req.params.id } }
    );

    await attendancedb.updateMany(
      { class: req.params.id },
      {
        $pull: {
          teachers: { teacher: teacherId },
        },
      }
    );

    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const removestudent = async (req, res) => {
  try {
    const studentId = req.body._id;

    await classdb.updateOne(
      { _id: req.params.id },
      { $pull: { students: studentId } }
    );

    await studentdb.updateOne(
      { _id: studentId },
      { $unset: { classes: req.params.id } }
    );

    await attendancedb.updateMany(
      { class: req.params.id, "teachers.students.student": studentId },
      {
        $pull: {
          "teachers.$[].students": { student: studentId },
        },
      }
    );

    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
1;

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

const updateshedule = async (req, res) => {
  try {
    const classId = req.params.id;
    const { day, ...timeSlots } = req.body;

    const schedule = await scheduledb.findOne({ class: classId });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const dayObject = schedule.submittion.find((item) => item.day === day);

    if (!dayObject) {
      return res.status(404).json({ error: "Day not found in the schedule" });
    }

    for (const time of Object.keys(timeSlots)) {
      const timeSlotIndex = dayObject.slots.findIndex(
        (slot) => slot.time === time
      );

      if (timeSlotIndex !== -1) {
        dayObject.slots[timeSlotIndex].file = timeSlots[time];
      } else {
        dayObject.slots.push({ time, file: timeSlots[time] });
      }
    }

    await schedule.save();

    res.status(200).json({ status: "success", data: schedule });
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
    await scheduledb.deleteOne({ class: req.params.id });
    await attendancedb.deleteOne({ class: req.params.id });
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};
const deletestudent = async (req, res) => {
  try {
    const findclass = await studentdb.findOne({ _id: req.params.id });

    if (findclass.classes == null) {
      await studentdb.deleteOne({ _id: req.params.id });
      res.status(200).json({ status: "success" });
    } else {
      res.status(200).json({ status: "failed" });
    }
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
  getschedule,
  updateshedule,
  getcount,
};
