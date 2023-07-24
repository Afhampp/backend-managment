const teacherdb = require("../models/teachermodel");
const studentdb = require("../models/studentmodel");
const classdb = require("../models/classmodel");
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

module.exports = {
  studentlogin,
};
