const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8081;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text({ type: "*/*" }));

app.post("/iclock/cdata", (req, res) => {
  console.log("Dữ liệu nhận được từ thiết bị:");
  console.log(req.body);

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(
    `🚀 Server đang lắng nghe tại http://localhost:${PORT}/iclock/cdata`
  );
});
