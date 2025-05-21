import express from "express";
import axios from "axios";

const app = express();

app.use(
  express.text({
    type: (req) => {
      const ct = req.headers["content-type"] || "";
      return ct.includes("text") || ct.includes("application/push");
    },
  })
);

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
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.send("");
  } else {
    res.send("OK");
  }
});

// Đăng ký thiết bị vô server nếu chưa kết nối
app.get("/iclock/push", (req, res) => {
  const { SN } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  if (!device) {
    return res.status(400).send("Can not find device");
  }

  res.send(
    [
      "SessionID=" + (device?.sessionID || ""),
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
  const { SN } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  const parts = req.body.trim().split(/\s+/);

  if (device) {
    if (req.query.table === "ATTLOG") {
      const [userId, datetime, _, event] = parts;

      if (userId) {
        if (event == "0") {
          console.log(`Check in - userId: ${userId} - ${datetime}`);
        }
        if (event == "1") {
          console.log(`Check out - userId: ${userId} - ${datetime}`);
        }
      }
    }

    if (req.query.table == "OPERLOG") {
      const [type] = parts;

      if (type == "OPLOG") {
        const [_, event] = parts;

        if (event == "70") {
          const [_0, _1, _2, _3, _4, userId] = parts;
          console.log(`Update user - userId: ${userId}`);
        }

        if (event == "103") {
          const [_0, _1, _2, _3, _4, _5, userId] = parts;
          console.log(`Delete user - userId: ${userId}`, parts);
        }

        if (event == "4") {
          const [_0, _1, _2, _3, _4, userId] = parts;
          console.log(`Open machine: userId: ${userId}`);
        }

        if (event == "5") {
          console.log(`Close machine - userId: ${userId}`);
        }
      } else {
        const [userId, username, level] = parts;
        console.log(
          `Create user - userId: ${userId} - username: ${username} level: ${level}`
        );
      }
    }
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
    console.log("Data bị thay đổi bởi events");
  }

  res.send("OK");
});

//  nhận dữ liệu querydata từ thiết bị
app.post("/iclock/querydata", (req, res) => {
  const { SN, type, cmdid, tablename, count, packcnt, packidx } = req.query;

  const dataRecord = req.body;

  console.log("Received QueryData from device:", SN);
  console.log("Type:", type);
  console.log("CmdID:", cmdid);
  console.log("Table:", tablename);
  console.log("Count:", count);
  console.log("Pack Count:", packcnt);
  console.log("Pack Index:", packidx);
  console.log("DataRecord:", dataRecord);

  res.status(200).send(`${tablename}=${count}`);
});

// Endpoint lấy danh sách user (gọi ra thiết bị)
app.get("/users", async (req, res) => {
  try {
    const response = await axios.post(
      `http://192.168.2.43:4370/iclock/querydata`,
      null,
      {
        params: {
          SN: "8116244700513",
          type: "tabledata",
          tablename: "user",
          count: 0,
          packcnt: 1,
          packidx: 0,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("Gọi thủ công");
    // Parse dữ liệu trả về từ thiết bị
    const users = response.data.split("\n").map((line) => {
      const fields = line.trim().split(" ");
      const user = {};
      fields.forEach((field) => {
        const [key, value] = field.split("=");
        user[key] = value;
      });
      return user;
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
