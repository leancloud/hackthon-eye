// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var u = require('cloud/util.js');
var app = express();
var _ = require('underscore');
var _s = require('underscore.string');
var avosExpressCookieSession = require('avos-express-cookie-session');
var face = require('cloud/face.js')

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

app.get('/users', function(req, res){
	var user = AV.User.current();
	if (user) {
		var query = new AV.Query('_User');
		if(user.get('location')){
			query.near("location", user.get('location'));
		}
		query.limit(10);
		query.find({
			success: function(users) {
				res.send(users);
			}
		});
	} else {
		fail(res);
	}
});


function createNewUser(req, res, file, location){
	console.log("Can't find the user by face_id,so we create a new one.");
	//register new user.
	var user = new AV.User();
	user.set('avartar', file);
	if(location)
		user.set('location', location);
	var gid = u.uuid();
	user.set('username', gid);
	user.set('password', gid);
	user.signUp(null, {
		success: function(){
			face.addNewFace(file.url(), function(err, ret){
				if(err){
					console.log("Added url to face+ failed" + err);
					return;
				}
				//save face++ result to user.
				user.set('face_id', ret.face_id);
				user.set('age', ret.age);
				user.set('gender', ret.gender);
				user.save();
			});
			user.logIn().then(success(res), fail(res));
		},
		error: fail(res)
	});
}

app.post('/register', function(req, res) {
	var b64 = req.body.data;
	var location = req.body.location;
	if(location && location != ''){
		var tmps = _.map(location.split(','), function(v){
			return parseFloat(_s.trim(v));
		});
		location = new AV.GeoPoint({latitude: tmps[1], longitude: tmps[0]});
	}
	var file = new AV.File('avartar.png', {base64: b64});
	file.save().then(function(){
		face.logInByFace(file.url(), function(err, face_id){
			if(err){
				return fail(res)();
			}
			if(face_id){
				console.log("Find the face_id  " + face_id);
				var query = new AV.Query('_User');
				query.equalTo('face_id', face_id);
				query.first().then(function(theUser){
					if(theUser){
						console.log("Find the user %j by face_id  " + face_id, theUser);
						var username = theUser.get('username');
						var pass = username;
						AV.User.logIn(username, pass, {
							success: success(res),
							error: fail(res)
						});
					} else {
						createNewUser(req, res, file, location)
					}
				}, fail(res));
			}else{
				createNewUser(req, res, file, location)
			}
		});
	}, fail(res));
});

app.get('/chat', function(req,res) {
	var currentUser = AV.User.currrnt();
	if (!currentUser) {
		fail(res);
	} else {
		res.send({current: currentUser.get('objectid')});
	}
});

app.get('/test_face', function(req, res) {
	face.loginByFace(
		'http://www.nmg.xinhuanet.com/xwzx/2006-06/18/xin_080603181309250324152.jpg',
		function(status, r) {
			console.log(r);
		}
	);
	res.send({});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
