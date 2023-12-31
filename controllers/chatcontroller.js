
const classdb = require("../models/classmodel");
const Message = require("../models/messagemodal");
const socketIO = require("socket.io");

function initSocketIO(server) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("select-student", async (selectedStudent) => {
      try {
        console.log(selectedStudent);
        const receiverId = selectedStudent._id;
        const senderId = selectedStudent.teacherid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId },
            { receiver: senderId, senderid: receiverId },
          ],
        });

        socket.emit("chat-message", newMessage);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });

    socket.on("select-teacher", async (selectteacher) => {
      try {
        const receiverId = selectteacher._id;
        const senderId = selectteacher.studentid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId },
            { receiver: senderId, senderid: receiverId },
          ],
        });

        socket.emit("chat-message-student", newMessage);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });
    socket.on("select-group", async (selectedgroup) => {
      try {
        const receiverId = selectedgroup.classid;
        const teacherId = selectedgroup.teacherid;

        const classDocument = await classdb.findById(receiverId);
        const studentIds = classDocument.students.map((student) => student);

        const newMessages = await Message.find({
          $or: [
            { receiver: receiverId, senderid: teacherId },
            { receiver: receiverId, senderid: { $in: studentIds } },
          ],
        });
        console.log(newMessages,"groupselecting")

        socket.emit("chat-message-group", newMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });

    socket.on("select-group-student", async (selectedgroup) => {
      try {
        const receiverId = selectedgroup._id;
        const senderId = selectedgroup.studentid;
        const classDocument = await classdb.findById(receiverId);
        const teacherid = classDocument.teachers.map((teacher) => teacher);
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId },
            { receiver: receiverId, senderid: { $in: teacherid } },
          ],
        });
          console.log(newMessage)
        socket.emit("chat-message-group", newMessage);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    });

    socket.on("chat-message", async (message) => {
      console.log(message, "......message..........");

      try {
        const bookMessage = new Message({
          sender: message.sender,
          senderid: message.senderid,
          receiver: message.receiver,
          content: message.content,
        });
        await bookMessage.save();

        const newMessage = await Message.find({
          $or: [
            { receiver: message.receiver, senderid: message.senderid },
            { receiver: message.senderid, senderid: message.receiver },
          ],
        });
        console.log(newMessage, "/.................../");

        io.emit("chat-message-new", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("chat-message-group-teacher", async (message) => {
      try {
        const bookMessage = new Message({
          sender: message.sender,
          senderid: message.senderid,
          receiver: message.receiver,
          content: message.content,
        });
        await bookMessage.save();

        const classDocument = await classdb.findById(message.receiver);
        const studentIds = classDocument.students.map((student) => student);

        const newMessages = await Message.find({
          $or: [
            { receiver: message.receiver, senderid: message.senderid },
            { receiver: message.receiver, senderid: { $in: studentIds } },
          ],
        });

        io.emit("chat-message-group-message-to-front", newMessages);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("chat-message-group-student", async (message) => {
      try {
        const bookMessage = new Message({
          sender: message.sender,
          senderid: message.senderid,
          receiver: message.receiver,
          content: message.content,
        });
        await bookMessage.save();
        const classDocument = await classdb.findById(message.receiver);
        const teacherid = classDocument.teachers.map((teacher) => teacher);

        const newMessage = await Message.find({
          $or: [
            { receiver: message.receiver, senderid: message.senderid },
            { receiver: message.senderid, senderid: { $in: teacherid } },
          ],
        });

        console.log(newMessage);

        io.emit("chat-message-group-message-to-front", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("chat-message-student", async (message) => {
      try {
        const bookMessage = new Message({
          sender: message.sender,
          senderid: message.senderid,
          receiver: message.receiver,
          content: message.content,
        });
        await bookMessage.save();
        const newMessage = await Message.find({
          $or: [
            { receiver: message.receiver, senderid: message.senderid },
            { receiver: message.senderid, senderid: message.receiver },
          ],
        });
        console.log(newMessage);

        io.emit("chat-message-new", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initSocketIO;
