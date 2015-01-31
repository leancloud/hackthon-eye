// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var u = require('cloud/util.js');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');
var f = require('cloud/face.js')

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(express.cookieParser('leancloud-eye'));
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }, fetchUser: true}));

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
	res.render('hello', { message: 'Congrats, you just set up your app!' });
});

function success(res) {
	return function(){
		res.send({});
	};
}

function fail(res) {
	return function(err) {
		res.send({error: err.message || err});
	}
}

app.post('/register', function(req, res) {
	var b64 = req.body.data;
	var file = new AV.File('avartar.png', {base64: b64});
	file.save().then(function(){
		var user = new AV.User();
		user.set('avartar', file);
		user.set('user,name', u.uuid());
		user.set('password', u.uuid());
		user.signUp(null, {
			success: function(){
				console.dir(user);
				user.logIn().then(success(res), fail(res));
			},
			error: fail(res)
		});
	}, fail(res));
});

app.get('/test_face', function(req, res) {
  f.loginByFace(
    'http://www.nmg.xinhuanet.com/xwzx/2006-06/18/xin_080603181309250324152.jpg',
    function(status, r) {
      console.log(r);
    }
  );
  res.send({});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
