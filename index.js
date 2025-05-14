const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

// Middleware để parse dữ liệu từ thiết bị
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: "*/*" }));

// Nhận dữ liệu PUSH từ thiết bị
app.post("/iclock/cdata", (req, res) => {
  console.log("📥 Dữ liệu PUSH từ thiết bị:");
  console.log(req.body);

  // Trả về phản hồi OK cho thiết bị
  res.status(200).send("OK");
});

// Nhận heartbeat từ thiết bị
app.get("/iclock/ping", (req, res) => {
  console.log("📶 Heartbeat từ thiết bị:", req.query);
  res.status(200).send("OK");
});

// Nhận yêu cầu khởi tạo kết nối
app.get("/iclock/cdata", (req, res) => {
  console.log("🔗 Thiết bị yêu cầu kết nối:", req.query);
  res.status(200).send("OK");
});

// Handle device initialization request
app.post("/device/init", (req, res) => {
  console.log("Received initialization request from device:");
  console.log(req.body);

  // Send response to confirm device is recognized
  res.status(200).send("INIT_OK");
});

// Handle device registration request
app.post("/device/register", (req, res) => {
  console.log("Received registration request from device:");
  console.log(req.body);

  // Generate 10-digit random number as registration code
  const registrationCode = (
    Math.floor(Math.random() * 9000000000) + 1000000000
  ).toString();
  console.log("Generated registration code:", registrationCode);

  // Send registration code back to the device
  res.status(200).send(registrationCode);
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
