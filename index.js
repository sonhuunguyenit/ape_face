import axios from "axios";
import crypto from "crypto";
import express from "express";
import { TOKEN_AUTH, URL_SYNC_LIST_USER } from "./constants.js";

const app = express();

const PORT = 8080;

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
  console.log("Device IP:", ip);
  console.log("Method:", `${method} ${url}`);
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
    SN: serialNumber,
    RegistryCode: registryCode,
    SessionID: sessionID,
    RequestDelay: 5,
    ErrorDelay: 10,
    TransTables: "User Transaction",
    Realtime: 1,
    TimeoutSec: 60,
    isSyncUserInfo: false,
    isSyncUserBio: false,
    isSyncUser: false,
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

// Device yêu cầu kết nối (chạy một lần khi bật máy)
app.get("/iclock/cdata", async (req, res) => {
  const { SN } = req.query;
  const device = registeredDevices[SN];

  if (device) {
    console.log("get - /iclock/cdata: Đã đăng ký device");
    res.send(device);
  } else {
    console.log("get - /iclock/cdata: Chưa đăng ký device");
    res.send("OK");
  }
});

// Device phản hồi sau khi yêu cầu kết nối
app.post("/iclock/cdata", async (req, res) => {
  const { SN } = req.query;
  const device = registeredDevices[SN];

  if (device) {
    console.log("post - /iclock/cdata Đã đăng ký device");
    handleEvent(req);
  } else {
    console.log("post - /iclock/cdata Chưa đăng ký device");
    return registerDevice(SN, res);
  }
});

// Chạy liên tục để gửi CMD
app.get("/iclock/getrequest", async (req, res) => {
  const { SN, INFO } = req.query;
  const device = registeredDevices[SN];

  if (device) {
    console.log("Device đã đăng ký - đang đồng bộ", device);

    if (!device.isSyncUser) {
      const cmdSync = await syncListUserWithMes(device);
      registeredDevices[SN].isSyncUser = true;
      return res.send(cmdSync);
    }
  } else {
    console.log("Device chưa đăng ký - heartbeat", SN);
    return registerDevice(SN, res);
  }
});

// Data response sau khi thực hiện CMD
app.post("/iclock/devicecmd", express.raw({ type: "*/*" }), (req, res) => {
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
});

const syncListUserWithMes = async (device) => {
  const response = await axios.post(
    URL_SYNC_LIST_USER,
    {
      SN: device.SN,
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
      const userInfo = [];
      const userBio = [];

      for (let user of listUser) {
        const { PIN, Content, ...Info } = user;

        userInfo.push({
          PIN,
          ...Info,
        });

        userBio.push({
          PIN,
          Content,
        });
      }

      const cmdUserInfo = getCmdUserInfo(userInfo);
      const cmdUserBio = getCmdUserBio(userBio);

      return `${cmdUserInfo}\r\n${cmdUserBio}`;
    }
  }
};

// Xử lý các event của Device
const handleEvent = async (req) => {
  const { SN, table } = req.query;
  const parts = req.body.trim().split(/\s+/);
  const device = registeredDevices[SN];

  // const sendEvent = async (config) => {
  //   const response = await axios.post(
  //     URL_SEND_EVENT_TO_MES,
  //     {
  //       SN: device.SN,
  //       ...config,
  //     },
  //     {
  //       headers: {
  //         "x-header": TOKEN_AUTH,
  //       },
  //     }
  //   );
  // };

  // if (table === "options") {
  //   console.log("Initial connection");
  // } else {
  //   if (table === "ATTLOG") {
  //     const [userId, datetime, _, event] = parts;

  //     if (userId) {
  //       if (event == "0") {
  //         sendEvent({
  //           event: "CHECK_IN",
  //           userId,
  //         });
  //       }
  //       if (event == "1") {
  //         sendEvent({
  //           event: "CHECK_OUT",
  //           userId,
  //         });
  //       }
  //     }
  //   }

  //   if (table == "OPERLOG") {
  //     const [type] = parts;

  //     if (type == "OPLOG") {
  //       const [_, event] = parts;

  //       if (event == "4") {
  //         const [_0, _1, _2, _3, _4, userId] = parts;
  //         sendEvent({
  //           event: "OPEN_DEVICE",
  //           userId,
  //         });
  //       }

  //       if (event == "5") {
  //         sendEvent({
  //           event: "CLOSE_DEVICE",
  //           userId,
  //         });
  //       }

  //       if (event == "70") {
  //         const [_0, _1, _2, _3, _4, userId] = parts;
  //         sendEvent({
  //           event: "UPDATE_USER",
  //           userId,
  //         });
  //       }

  //       if (event == "103") {
  //         const [_0, _1, _2, _3, _4, _5, userId] = parts;
  //         sendEvent({
  //           event: "DELETE_USER",
  //           userId,
  //         });
  //       }
  //     } else {
  //       const [userId, username, level] = parts;
  //       sendEvent({
  //         event: "INSERT_USER",
  //         userId,
  //       });
  //     }
  //   }
  // }
};

// Tạo user info cmd
const getCmdUserInfo = (users) => {
  const CMDID = `C:${Math.floor(Math.random() * 100000) + 1}`;

  const StringCMD = users.reduce((a, c, i) => {
    const user = Object.entries(c)
      .map(([key, value]) => `${key}=${value}`)
      .join("\t");

    const cmd = `${CMDID}:DATA USER ${user}`;

    return i !== users.length - 1 ? `${cmd}\r\n` : `${a}${cmd}`;
  }, "");

  return StringCMD;
};

// Tạo user bio cmd
const getCmdUserBio = (users) => {
  const CMDID = `C:${Math.floor(Math.random() * 100000) + 1}`;

  const StringCMD = users.reduce((a, c, i) => {
    const user = Object.entries(c)
      .map(([key, value]) => `${key}=${value}`)
      .join("\t");

    const cmd = `${CMDID}:DATA UPDATE BIOPHOTO ${user}`;

    return i !== users.length - 1 ? `${cmd}\r\n` : `${a}${cmd}`;
  }, "");

  return StringCMD;
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
