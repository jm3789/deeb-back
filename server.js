const { createProxyMiddleware } = require("http-proxy-middleware");

const express = require("express");
const app = express();
const path = require("path");

const db = require("./database/db");

const session = require("express-session");
const sessionOption = require("./database/sessionOption");
const bcrypt = require("bcrypt");

app.use(express.static(path.join(__dirname, "../deeb-front/build")));
app.use(express.json()); // JSON 형식의 요청을 처리할 수 있도록 설정

app.use(
  "/v1",
  createProxyMiddleware({
    target: "https://openapi.naver.com",
    changeOrigin: true,
  })
);

// 세션 저장소 생성 및 설정 구성하기
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore(sessionOption);
app.use(
  session({
    key: "session_cookie_name",
    secret: "~",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// 유저권한 체크
app.get("/authcheck", (req, res) => {
  const sendData = { isLogin: "" };
  if (req.session.is_logined) {
    sendData.isLogin = "True";
  } else {
    sendData.isLogin = "False";
  }
  res.send(sendData);
});

// 회원가입
app.post("/signup", (req, res) => {
  const { loginId, password, nickname } = req.body;
  try {
    if (loginId && password && nickname) {
      db.query(
        "SELECT * FROM user WHERE loginId = ?",
        loginId,
        (error, result) => {
          // DB에 중복되는 아이디가 있는지 확인
          if (result.length > 0) res.status(409).json("아이디가 중복됩니다.");
          else {
            // 중복되는 아이디가 없음
            const hashedPassword = bcrypt.hashSync(password, 10); // 비밀번호 암호화
            db.query(
              "INSERT INTO user (loginId, password, nickname) VALUES(?,?,?)",
              [loginId, hashedPassword, nickname],
              (error) => {
                console.log(error);
                res.status(200).json("회원가입 성공!");
              }
            );
          }
        }
      );
    } else {
      res.status(400).json("입력한 정보를 다시 확인해주세요.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// 로그인
app.post("/signin", async (req, res) => {
  const { loginId, password } = req.body;
  try {
    if (loginId && password) {
      db.query(
        "SELECT * FROM user WHERE loginId = ?",
        loginId,
        async (error, result) => {
          // DB에 해당 아이디가 있는지 확인
          if (result.length == 0)
            res.status(400).json("존재하지 않는 아이디입니다.");
          else {
            // 아이디가 존재함
            const blobToStr = Buffer.from(result[0].password).toString();
            const isMatch = await bcrypt.compare(password, blobToStr);
            if (!isMatch) {
              res.status(401).json("비밀번호가 일치하지 않습니다.");
              return;
            }
            // 세션 정보 갱신
            req.session.is_logined = true;
            req.session.loginId = loginId;
            res.status(200).json("로그인 성공");
          }
        }
      );
    } else {
      res.status(400).json("입력한 정보를 다시 확인해주세요.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

// 로그아웃
app.get("/logout", async (req, res) => {
  req.session.destroy();
  res.status(200).json("로그아웃되었습니다.");
});

// 유저 정보 get
app.get("/userdetail", async (req, res) => {
  if (!req.session.loginId) {
    res.status(400).json("세션이 만료되었습니다. 다시 로그인해주세요.");
  } else {
    try {
      db.query(
        "SELECT * FROM user WHERE loginId = ?",
        loginId,
        async (error, result) => {
          if (result.length == 0)
            res.status(400).json("존재하지 않는 아이디입니다.");
          else {
            // 해당 유저의 닉네임 가져오기
            const sendData = { nickname: result[0].nickname };
            res
              .status(200)
              .json({ data: sendData, message: "유저정보 가져오기 성공" });
          }
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
});

// 유저 deeps get
app.get("/userdeeps", async (req, res) => {
  if (!req.session.loginId) {
    res.status(400).json("세션이 만료되었습니다. 다시 로그인해주세요.");
  } else {
    try {
      // loginId로 해당 유저의 userId 가져오기
      db.query(
        "SELECT * FROM user WHERE loginId = ?",
        loginId,
        async (error, result) => {
          if (result.length == 0)
            res.status(400).json("존재하지 않는 아이디입니다.");
          else {
            const userId = result[0].userId;
            try {
              // userId로 해당 유저의 딥스 가져오기
              db.query(
                "SELECT * FROM deep WHERE userId = ?",
                userId,
                async (error, result) => {
                  const sendData = { deeplist: result };
                  res
                    .status(200)
                    .json({ data: sendData, message: "딥스 가져오기 성공" });
                }
              );
            } catch (error) {
              console.error(error);
              res.status(500).json(error);
            }
          }
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../deeb-front/build/index.html"));
});

app.listen(8000, () => {
  // 8000번 포트로 서버 실행
  console.log("listening on 8000");
});
