const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8081;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: "*/*" }));

// Cấu hình server để nhận dữ liệu từ iClock
app.get("/iclock/cdata", (req, res) => {
  console.log("Dữ liệu nhận được từ thiết bị (iClock):");
  console.log(req.query); // Hiển thị dữ liệu dạng query parameters

  res.status(200).send("OK");
});

// Cấu hình server để nhận dữ liệu từ device push
app.get("/device/push", (req, res) => {
  console.log("Dữ liệu nhận được từ thiết bị (Push):");
  console.log(req.query); // Hiển thị dữ liệu dạng query parameters

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(
    `🚀 Server đang lắng nghe tại http://localhost:${PORT}/iclock/cdata`
  );
});
