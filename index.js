import express from "express";
import crypto from "crypto";
import fs from "fs";

export const base64 = fs.readFileSync("./image.txt", "utf-8");

const app = express();

app.use(
  express.text({
    type: (req) => {
      const ct = req.headers["content-type"] || "";
      return ct.includes("text") || ct.includes("application/push");
    },
  })
);

app.use(express.urlencoded({ extended: true }));

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

function generateCookieToken(registryCode, sessionID, serialNumber) {
  const rawString = registryCode + serialNumber + sessionID;
  return crypto.createHash("md5").update(rawString).digest("hex");
}

function registerDevice(serialNumber, res) {
  const registryCode = generateRegistryCode();

  const sessionID = generateSessionID();

  const cookieToken = generateCookieToken(
    registryCode,
    sessionID,
    serialNumber
  );

  const device = [
    `RegistryCode=${registryCode}`,
    `SessionID=${sessionID}`,
    "RequestDelay=5",
    "ErrorDelay=10",
    "TransTables=User Transaction",
    "Realtime=1",
    "TimeoutSec=60",
  ];

  registeredDevices[serialNumber] = device;

  res
    .cookie("token", cookieToken, {
      httpOnly: true,
      path: "/",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 10000,
    })
    .send(["registry=ok", ...device].join("\n"));
}

// Kiểm tra kết nối thiết bị với server (chạy một lần)
app.get("/iclock/cdata", (req, res) => {
  const { SN } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  console.log("registeredDevices", registeredDevices);

  if (device) {
    console.log("METHOD GET - /iclock/cdata: Đã đăng ký device");
    res.send(device);
  } else {
    console.log("METHOD GET - /iclock/cdata: Chưa đăng ký device");
    res.send("OK");
  }
});

app.post("/iclock/cdata", (req, res) => {
  const { SN, table } = req.query;
  const parts = req.body.trim().split(/\s+/);

  console.log(parts);

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  if (table === "options") {
    const device = registeredDevices[SN];

    console.log("registeredDevices", registeredDevices);
    if (!device) {
      return registerDevice(SN, res);
    }
  } else {
    if (table === "ATTLOG") {
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

    if (table == "OPERLOG") {
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

    return res.send("OK");
  }
});

// Run CMD (heartbeat)
app.get("/iclock/getrequest", (req, res) => {
  const { SN, INFO } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  if (device) {
    if (INFO) {
      console.log("Chạy CMD");

      // const cmd = `C:223:CONTROL DEVICE 03000000`;

      // const cmd = `C:1002:DATA USER PIN=1234\tName=John Doe\tPassword=1234\tCard=12345678\tGroup=1\tPrivilege=0`;

      // const cmd = `C:1002:DATA DELETE USERINFO PIN=1234`

      // const cmd = `C:12345:DATA UPDATE BIOPHOTO PIN=1\tContent=\r\n`;

      //   const date = new Date();
      //   const cmd1 = `C:${date.getSeconds()}:DATA USER PIN=3\tName=Son\tPassword=3\tCard=3\tGrp=1\tPri=14\r\n`;
      //   const cmd2 = `C:${
      //     date.getSeconds() + 1
      //   }:DATA UPDATE BIOPHOTO PIN=3\tContent=${base64}\r\n`;
      //   const cmd = `${cmd1}${cmd2}`;

      //   return res.send(cmd);
    } else {
      return res.send("OK");
    }
  } else {
    console.log("Device chưa đăng ký");
    return registerDevice(SN, res);
  }
});

// Response CMD (heartbeat)
app.post(
  "/iclock/devicecmd",
  express.raw({ type: "*/*" }), // buffer
  (req, res) => {
    const { SN } = req.query;

    const rawBody = req.body.toString("utf-8");
    console.log("/devicecmd from:", SN);
    console.log("Raw body:", rawBody);

    const result = {};
    rawBody.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key && value !== undefined) {
        result[key] = decodeURIComponent(value);
      }
    });

    console.log("Parsed:", result);
    res.send("OK");
  }
);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
