const { ws } = require("./websocket-client");

const axios = require("axios");

async function getTokenAndConnect() {
  try {
    const response = await axios.post("http://localhost:8080/auth/login", {
      email: "stud1@gmail.com",
      password: "123456",
    });

    const token = response.data.token;
    console.log("Token:", token);

    ws.on("open", () => {
      ws.send(JSON.stringify({ type: "authorization", token }));
    });
  } catch (error) {
    console.log("Error:", error.message);
  }
}

getTokenAndConnect();