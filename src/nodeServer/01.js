var express = require("express");
//引入express模块, 记得cnpm install express --save
var app = express(); //express对象

const verStr = { versionName: "2.0.0", versionCode: 200 }; //版本检查返回的数据，假数据，自行修改

app.get("/checkUpdate", function (req, res) {
  //版本检查接口
  res.header("Access-Control-Allow-Origin", "*");

  res.send(JSON.stringify(verStr));
});

app.listen(4001, function () {
  //服务端口监听
  console.log("server now listening at port 3000");
});
