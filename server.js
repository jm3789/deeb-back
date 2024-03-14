const { createProxyMiddleware } = require("http-proxy-middleware");

const express = require("express");
const app = express();
const path = require("path");

app.listen(8000, () => {
	// 8000번 포트로 서버 실행
	console.log("listening on 8000");
});

app.use(express.static(path.join(__dirname, "../dib-front/build")));

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "../dib-front/build/index.html"));
});

app.use(
	"/v1",
	createProxyMiddleware({
		target: "https://openapi.naver.com",
		changeOrigin: true,
	})
);
