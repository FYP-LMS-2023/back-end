const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const {decodeToken} = require('../middlewares/decodeToken');

const wss = new WebSocket.Server({ noServer: true });

const clients = new Map();

async function authenticate(message) {
    
    try {
        const payload = JSON.parse(message);
        if (payload.type === "authorization") {
          const token = payload.token;
          const decoded = jwt.verify(token, process.env.jwtPrivateKey);
          const user = await User.findById(decoded._id);
          if (user && !user.deleteFlag) {
            return user;
          }
        }
      } catch (err) {
        console.error("Error authenticating user:", err);
      }
      return null;
}

async function addClient (ws, req) {
    const user = await authenticate(req);
    if (user) {
        clients.set(ws, user);
        console.log('User ${user.fullName} with id ${user._id} connected');
        //return true;
    }
    else {
        ws.close();
        console.log('User not authenticated')
        //return false;
    }
}

function removeClient(ws) {
    const user = clients.get(ws);
    if (user) {
        clients.delete(ws);
        console.log('User ${user.fullName} with id ${user._id} disconnected');
    }
}

wss.on("connection", async (ws) => {
    ws.on("message", async (message) => {
      const payload = JSON.parse(message);
      if (payload.type === "authorization") {
        const user = await authenticate(message);
        if (user) {
          clients.set(ws, user);
          console.log(`User ${user.fullName} with id ${user._id} connected`);
          ws.send("Hello from server");
        } else {
          ws.send("User not authenticated");
          ws.close();
          console.log("User not authenticated");
        }
      } else {
        // Handle other message types here
      }
    });
  
    ws.on("close", () => {
      removeClient(ws);
    });
  });

module.exports = wss;