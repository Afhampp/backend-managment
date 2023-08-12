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
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('select-student', async (selectedStudent) => {
      try {
        console.log(selectedStudent)
        const receiverId = selectedStudent._id;
        const senderId = selectedStudent.teacherid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId },
            { receiver: senderId, senderid: receiverId },
          ],
        })
        
    
        socket.emit('chat-message', newMessage);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });


    socket.on('select-teacher', async (selectteacher) => {
      try {
        const receiverId = selectteacher._id;
        const senderId = selectteacher.studentid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId},
            { receiver: senderId, senderid: receiverId },
          ],
        });
    
    
        socket.emit('chat-message-student', newMessage);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });
    socket.on('select-group', async (selectedgroup) => {
      try {
        console.log(selectedgroup,"ethi.........")
        const receiverId = selectedgroup.classid;
        const senderId = selectedgroup.teacherid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId},
            { receiver: senderId, senderid: receiverId },
          ],
        });
    
    
        socket.emit('chat-message-group', newMessage);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    socket.on('select-group-student', async (selectedgroup) => {
      try {

        const receiverId = selectedgroup._id;
        const senderId = selectedgroup.studentid;
        const newMessage = await Message.find({
          $or: [
            { receiver: receiverId, senderid: senderId},
            { receiver: senderId, senderid: receiverId },
          ],
        });

    
        socket.emit('chat-message-group', newMessage);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    });

    socket.on('chat-message', async (message) => {
       
    

      try {
        const bookMessage = new Message({
          sender: message.sender,
          senderid:message.senderid,
          receiver: message.receiver,
          content: message.content,
          classpresent:false
        });
        await bookMessage.save();

        const newMessage = await Message.find({
          $or: [
            { receiver: message.receiver, senderid: message.senderid },
            { receiver: message.senderid, senderid: message.receiver },
          ],
        })

        io.emit('chat-message-new', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

     socket.on('chat-message-group-teacher', async (message) => {
       
    

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

        io.emit('chat-message-group-message-to-front', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('chat-message-group-student', async (message) => {
       
    

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

        console.log(newMessage)

        io.emit('chat-message-group-message-to-front', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('chat-message-student', async (message) => {
     
  

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
      console.log(newMessage)

      io.emit('chat-message-new', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initSocketIO;
