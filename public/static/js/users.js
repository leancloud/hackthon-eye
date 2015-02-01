$(document).ready(function () {
	function showUsesrs(users) {
		for (var i = users.length - 1; i >= 0; i--) {
			var user = users[i];
			var sim = Math.floor(Math.random()*100);
			$('.table-bordered').append(
				'<tbody>
				<tr>
				<td><img src=\"'+
				user.avartar
				+'\"></a></td>
				<td>'+
				smi
				+'</td>
				<td><a herf=\"chat.html?go='+
				user.objectid
				+'\"=></a></td>
				</tr>
				</tbody>');
		};
	}

	$ajax({
		url: "/users",
		type: "get",
		async: true,
		success: function(data) {
			showUsesrs(data);
		},
		error: function(e) {
			alert("网络异常");
		}
	});
});