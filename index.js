import axios from "axios";
import crypto from "crypto";
import express from "express";
import { image } from "./image.js";

const app = express();

const TOKEN_AUTH = "7598876d-72ba-4aea-990f-2bd049ad5ed3";

const URL_SYNC_LIST_USER_WITH_MES =
  "http://localhost:3001/api/integration/zkt-face-id/sync-list-user-with-zkt";

app.use(
  express.text({
    type: (req) => {
      const ct = req.headers["content-type"] || "";
      return ct.includes("text") || ct.includes("application/push");
    },
  })
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use((req, res, next) => {
  const { method, url, query, body, headers, ip } = req;
  console.log("\n=====================");
  console.log("Method:", `${method} ${url}`);
  // console.log("IP:", ip);
  // console.log("Headers:", headers);
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

  const device = {
    registry: "ok",
    RegistryCode: registryCode,
    SessionID: sessionID,
    RequestDelay: 5,
    ErrorDelay: 10,
    TransTables: "User Transaction",
    Realtime: 1,
    TimeoutSec: 60,
    isSync: false,
  };

  registeredDevices[serialNumber] = device;

  const deviceResponse = Object.entries(device)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  res
    .cookie("token", cookieToken, {
      httpOnly: true,
      path: "/",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 10000,
    })
    .send(deviceResponse);
}

// Kiểm tra kết nối thiết bị với server (chạy một lần)
app.get("/iclock/cdata", async (req, res) => {
  const { SN } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  if (device) {
    console.log("get - /iclock/cdata: Đã đăng ký device");
    res.send(device);
  } else {
    console.log("get - /iclock/cdata: Chưa đăng ký device");
    res.send("OK");
  }
});

app.post("/iclock/cdata", async (req, res) => {
  const { SN } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  if (device) {
    console.log("post - /iclock/cdata Đã đăng ký device");
    handleEvent(req);
  } else {
    console.log("post - /iclock/cdata Chưa đăng ký device");
    return registerDevice(SN, res);
  }
});

// Run CMD (heartbeat)
app.get("/iclock/getrequest", async (req, res) => {
  const { SN, INFO } = req.query;

  if (!SN) {
    return res.status(400).send("Missing SN");
  }

  const device = registeredDevices[SN];

  if (device) {
    console.log("Device đã đăng ký - đang đồng bộ");

    if (!device.isSync) {
      const insertCmd = await syncListUserWithMes(device);
      registeredDevices[SN].isSync = true;
      return res.send(insertCmd);
    }
  } else {
    console.log("Device chưa đăng ký - heartbeat");
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

const syncListUserWithMes = async (device) => {
  const response = await axios.post(
    URL_SYNC_LIST_USER_WITH_MES,
    {
      SN: String(device.SN),
    },
    {
      headers: {
        "x-header": TOKEN_AUTH,
      },
    }
  );

  if (response.data?.data) {
    const listUser = response.data.data;

    if (listUser.length > 0) {
      const dataInsert = listUser.reduce(
        (acc, cur) => {
          const { Bio, ...userInfo } = cur;

          acc.info.push(userInfo);

          acc.bio.push({
            PIN: userInfo.PIN,
            Content: Bio,
          });

          return acc;
        },
        {
          info: [],
          bio: [],
        }
      );

      // return saveListUserInfo(dataInsert.info);

      return saveListUserBio(dataInsert.bio);

      // console.log(insertCMD);

      // await saveListUserInfo(listUser);
      // const listUserBio = [];
      // for (const user of listUser) {
      //   const base64 = await getBase64UserFace(user.imageUrl, user.userNo);
      //   listUserBio.push({
      //     PIN: user.userNo,
      //     Content: base64,
      //   });
      // }
      // await saveListUserBio(listUserBio);
    }
  }
};

const handleEvent = async (req) => {
  const { SN, table } = req.query;

  const parts = req.body.trim().split(/\s+/);

  if (table === "options") {
    console.log("Initial connection");
  } else {
    if (table === "ATTLOG") {
      const [userId, datetime, _, event] = parts;

      if (userId) {
        if (event == "0") {
          console.log(`Check in - userId: ${userId} - ${datetime}`);
          // call to send data
        }
        if (event == "1") {
          console.log(`Check out - userId: ${userId} - ${datetime}`);
          // call to send data
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
  }
};

const saveListUserInfo = (users) => {
  const date = new Date();

  const CMDID = `C:${date.getSeconds() + 1}`;

  const StringCMD = users.reduce((a, c, i) => {
    const user = Object.entries(c)
      .map(([key, value]) => `${key}=${value}`)
      .join("\t");

    return i === 0 ? user : `${a}\r\n${user}`;
  }, "");

  return `${CMDID}:DATA USER ${StringCMD}`;
};

const saveListUserBio = (users) => {
  const date = new Date();

  const CMDID = `C:${date.getSeconds() + 1}`;

  const StringCMD = users.reduce((a, c, i) => {
    const user = Object.entries(c)
      .map(([key, value]) => `${key}=${value}`)
      .join("\t");

    return i === 0 ? user : `${a}\r\n${user}`;
  }, "");

  return `${CMDID}:DATA UPDATE BIOPHOTO PIN=5\tContent=${image}\r\n`;
};

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
