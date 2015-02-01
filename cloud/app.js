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
		res.send({error: err});
	}
}

app.get('/users', function(req, res){
	var user = AV.User.current();

	if (user) {
		face.getFaces(user.get('face_id'), function(err, results) {
			if(err)
				return fail(res)();
			var query = new AV.Query('_User');
			query.containedIn('face_id', _.map(results, function(cond) {
				return cond.face_id;
			}));
			var simMap = _.reduce(results, function(m,cond) {
				m[cond.face_id] = cond.similarity;
				return m;
			}, {});
			if(user.get('location')){
				query.near("location", user.get('location'));
			}
			query.limit(10);
			query.find({
				success: function(users) {
					_.each(users, function(user) {
						user.set('sim', simMap[user.get('face_id')]);
					});
					users = _.filter(users, function(user) {
						return user.id != AV.User.current().id;
					});
					users.sort(function(a, b){
						return a.get('sim') - b.get('sim');
					});
					res.send(users);
				}
			});
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
				user.save().then(function(){
					user.set('username', gid);
					user.set('password', gid);
					user.logIn().then(success(res), fail(res));
				}, fail(res));
			});
		},
		error: fail(res)
	});
}

app.get('/logout', function(req, res){
	AV.User.logOut();
	return res.redirect('/index.html');
});

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
