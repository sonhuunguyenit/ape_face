import express from "express";
import axios from "axios";

const app = express();

// Transform định dạng
app.use(
  express.text({
    type: (req) => {
      const ct = req.headers["content-type"] || "";
      return ct.includes("text") || ct.includes("application/push");
    },
  })
);

// Middleware log thông tin request
app.use((req, res, next) => {
  const { method, url, query, body, headers, ip } = req;
  console.log("\n=====================");
  console.log("Method:", `${method} ${url}`);
  console.log("IP:", ip);
  console.log("Headers:", headers);
  console.log("Query:", query);
  console.log("Body:", body);
  console.log("=====================\n");
  next();
});

const registeredDevices = {};

function generateRegistryCode() {
  return Math.random().toString(16).slice(2, 12).padEnd(10, "0");
}

function generateSessionID() {
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

function generateToken(registryCode, serialNumber, sessionID) {
  const rawString = registryCode + serialNumber + sessionID;
  return crypto.createHash("md5").update(rawString).digest("hex");
}

// Kiểm tra kết nối thiết bị với server (chạy một lần)
app.get("/iclock/cdata", (req, res) => {
  const { SN, pushver } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  if (registeredDevices[SN]) {
    const device = registeredDevices[SN];

    res.send(
      [
        "registry=ok",
        `RegistryCode=${device.registryCode}`,
        `SessionID=${device.sessionID}`,
        `PushProtVer=${pushver}`,
        "TransTables=User Transaction, Attendance",
        // `ServerVersion=3.0.1`,
        // "ServerName=MyPushServer",
        "ErrorDelay=30",
        "RequestDelay=1",
        "TransTimes=00:00",
        "TransInterval=1",
        "Realtime=1",
        "TimeoutSec=10",
      ].join("\n")
    );
  } else {
    res.send("OK");
  }
});

// Device gọi để lấy cấu hình
app.post("/iclock/registry", (req, res) => {
  const SN = req.query?.SN;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  if (!registeredDevices[SN]) {
    const registryCode = generateRegistryCode();
    const sessionID = generateSessionID();
    const token = generateToken(registryCode, SN, sessionID);

    registeredDevices[SN] = {
      registryCode,
      sessionID,
      token,
      ...req.body,
    };

    res.cookie("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24, // Thời hạn 1 ngày
    });

    res.send(`RegistryCode=${registryCode}\nSessionID=${sessionID}`);
  } else {
    const device = registeredDevices[SN];

    res.send(
      `RegistryCode=${device.registryCode}\nSessionID=${device.sessionID}`
    );
  }
});

// Đăng ký thiết bị vô server nếu chưa kết nối
app.get("/iclock/push", (req, res) => {
  const { SN } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  res.send(
    [
      // "ServerVersion=3.0.1",
      // "ServerName=MyPushServer",
      "SessionID=" + (registeredDevices[SN]?.sessionID || ""),
      "ErrorDelay=30",
      "RequestDelay=1",
      "TransTimes=00:00",
      "TransInterval=1",
      "Realtime=1",
      "TimeoutSec=10",
    ].join("\n")
  );
});

// Nhận dữ liệu từ thiết bị gửi về
app.post("/iclock/cdata", (req, res) => {
  const parts = req.body.trim().split(/\s+/);

  console.log("parts", parts);

  if (parts[0] === "OPLOG") {
    console.log("User management");
  }

  if (parts[0] === "ATTLOG") {
    console.log("User authorization");
  }

  res.send("OK");
});

// Thiết bị hỏi lệnh từ server (heartbeat)
app.get("/iclock/getrequest", (req, res) => {
  const { SN, INFO } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  if (INFO) {
    // INFO: 'ZAM180-NF50VA-Ver3.4.9,5,0,146,192.168.2.43,10,39,12,5,11110,0,0,0'
    console.log("Data bị thay đổi bởi events");
  }

  // const shouldQueryUser = true;

  // if (shouldQueryUser) {
  //   const cmdId = 415;
  //   const cmdStr = `C:${cmdId}:DATA QUERY tablename=user,fielddesc=*,filter=*`;
  //   return res.send(cmdStr);
  // }

  res.send("OK");
});

// Endpoint nhận dữ liệu querydata từ thiết bị
// app.post("/iclock/querydata", (req, res) => {
//   const { SN, type, cmdid, tablename, count, packcnt, packidx } = req.query;

//   const dataRecord = req.body;

//   console.log("Received QueryData from device:", SN);
//   console.log("Type:", type);
//   console.log("CmdID:", cmdid);
//   console.log("Table:", tablename);
//   console.log("Count:", count);
//   console.log("Pack Count:", packcnt);
//   console.log("Pack Index:", packidx);
//   console.log("DataRecord:", dataRecord);

//   res.status(200).send(`${tablename}=${count}`);
// });

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
