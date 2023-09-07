const assigmentdb = require("../models/assigmentmodels");

const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECREAT_KEY;
const cloudinary = require("../cloudinary/cloduinary");

const postassigment = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;

    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result.public_id);
    await assigmentdb.insertMany([
      {
        name: req.body.name,
        class: req.body.class,
        from: req.body.from,
        to: req.body.to,
        teacher: teacherId,
        file: req.file.filename,
      },
    ]);
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const showassigment = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;

    const getdata = await assigmentdb.find({ teacher: teacherId });
    res.status(200).json({ getdata });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const updateassignment = async (req, res) => {
  try {
    await assigmentdb.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          class: req.body.class,
          from: req.body.from,
          to: req.body.to,
          file: req.file.filename,
        },
      }
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const deleteassigment = async (req, res) => {
  try {
    await assigmentdb.deleteOne({ _id: req.params.id });
    res.status(200).json();
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getassigmentsubmitted = async (req, res) => {
  try {
    const assigmentvalue = await assigmentdb
      .findOne({ _id: req.params.id })
      .populate("submittion.student");

    const submittionArray = assigmentvalue.submittion;

    const submittionWithName = submittionArray.map((submission) => {
      return {
        name: submission.student.name,
        file: submission.file,
        date: submission.date,
        _id: submission._id,
        mark: submission.mark,
      };
    });
    res.status(200).json({ submittionWithName });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const updatemark = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value._id;

    const submissionId = req.body._id;
    const newMark = req.body.mark;

    const assignment = await assigmentdb.findOne({
      teacher: teacherId,
      "submittion._id": submissionId,
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ error: "Assignment or submission not found" });
    }

    const submission = assignment.submittion.find(
      (sub) => sub._id.toString() === submissionId
    );
    submission.mark = newMark;

    await assignment.save();

    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getstudentassigment = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);
    const teacherId = decoded.value.classes;
    const studentId = decoded.value._id;

    const getdata = await assigmentdb
      .find({ class: teacherId })
      .populate("teacher")
      .populate("submittion.student");

    const modifiedData = getdata.map((assignment) => {
      return {
        _id: assignment._id,
        name: assignment.name,
        teacher: assignment.teacher,
        class: assignment.class,
        from: assignment.from,
        to: assignment.to,
        file: assignment.file,
        submittion: assignment.submittion
          .map((submission) => {
            if (submission.student._id.toString() === studentId) {
              return {
                student: submission.student,
                file: submission.file,
                date: submission.date,
                mark: submission.mark,
              };
            }
          })
          .filter(Boolean),
      };
    });

    res.status(200).json({ getdata: modifiedData });
  } catch (error) {
    res.status(500).json({ error });
  }
};

const assigmentsubmittion = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);
    const studentid = decoded.value._id;

    const fileData = {
      student: studentid,
      file: req.file.filename,
      date: Date.now(),
    };
    const assignmentId = req.params.id;
    const assignment = await assigmentdb.findById(assignmentId);
    const existingSubmissionIndex = assignment.submittion.findIndex(
      (submission) => submission.student.toString() === studentid
    );

    if (existingSubmissionIndex !== -1) {
      assignment.submittion[existingSubmissionIndex].file = req.file.filename;
      assignment.submittion[existingSubmissionIndex].date = Date.now();
    } else {
      assignment.submittion.push(fileData);
    }
    await assignment.save();
    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = {
  postassigment,
  showassigment,
  updateassignment,
  deleteassigment,
  getassigmentsubmitted,
  getstudentassigment,
  assigmentsubmittion,
  updatemark,
};
