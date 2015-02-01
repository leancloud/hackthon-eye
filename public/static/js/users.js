$(document).ready(function () {
	function showUsesrs(users) {
		for (var i = users.length - 1; i >= 0; i--) {
			var user = users[i];
			var sim = Math.floor(Math.random()*100);
			$('.table-bordered').append(
				'<tbody><tr><td><img src=\"'+
				user.avartar.url
				+'\"></a></td><td>'+
				99
				+'</td><td><a href=\"chat.html?go='+
				user.objectId
				+'\">Go!</a></td></tr></tbody>');
		};
	}

	$.get(
		"/users",
		function(data) {
			showUsesrs(data);
		});
	$.get(
		"/chat",
		function(data) {
			sessionStorage.myname=data.current;
		});
});
