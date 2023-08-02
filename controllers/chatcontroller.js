const admindb = require("../models/admin");
const teacherdb = require("../models/teachermodel");
const subjectdb = require("../models/subjectmodel");
const studentdb = require("../models/studentmodel");
const classdb = require("../models/classmodel");
const Message=require('../models/messagemodal')
const socketIO = require('socket.io');

function initSocketIO(server) {
  const io = socketIO(server, {
    cors: {
      origin: '*', // Replace * with the appropriate origin URL or an array of allowed origins
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('select-student', async (selectedStudent) => {
      try {
        // Find messages with matching receiver ID (selected student's ID) and sender ID (teacher's ID)
        const receiverId = selectedStudent._id;
        const senderId = selectedStudent.teacherid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId },
            { receiver: senderId, senderid: receiverId },
          ],
        })
        console.log(newMessage)
    
        // Emit the messages to the client
        socket.emit('chat-message', newMessage);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });


    socket.on('select-teacher', async (selectteacher) => {
      try {
        // Find messages with matching receiver ID (selected student's ID) and sender ID (teacher's ID)
        const receiverId = selectteacher._id;
        const senderId = selectteacher.studentid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId },
            { receiver: senderId, senderid: receiverId },
          ],
        });
        console.log(newMessage)
    
        // Emit the messages to the client
        socket.emit('chat-message-student', newMessage);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    // Handle incoming chat messages
    socket.on('chat-message', async (message) => {
        console.log(message);
    

      // Save the message to the database
      try {
        const bookMessage = new Message({
          sender: message.sender,
          senderid:message.senderid,
          receiver: message.receiver,
          content: message.content,
        });
        await bookMessage.save();

        const newMessage = await Message.find({
          $or: [
            { receiver: message.receiver, senderid: message.senderid },
            { receiver: message.senderid, senderid: message.receiver },
          ],
        })

        // Emit the saved message to all connected clients, including the sender
        io.emit('chat-message-new', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('chat-message-student', async (message) => {
      console.log(message);
  

    // Save the message to the database
    try {
      const bookMessage = new Message({
        sender: message.sender,
        senderid:message.senderid,
        receiver: message.receiver,
        content: message.content,
      });
      await bookMessage.save();
      const newMessage = await Message.find({
        $or: [
          { receiver: message.receiver, senderid:message.senderid },
          { receiver: message.senderid, senderid: message.receiver },
        ],
      })
      

      // Emit the saved message to all connected clients, including the sender
      io.emit('chat-message-new', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Additional logic for handling user disconnection if needed
    });
  });

  return io;
}

module.exports = initSocketIO;
