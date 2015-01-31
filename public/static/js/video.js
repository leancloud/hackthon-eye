$(document).ready(function() {
	var video = $('video')[0];
	var img = $('img')[0];
	var localMediaStream = null;
	var imgData = null;

    function capture(video) {
        var canvas = document.createElement('canvas'); //建立canvas js DOM元素
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        return canvas;
    }

	function register(){
		if(img.src == null || imgData == null) {
			$('.alert-danger').text('请先拍一张靓照.');
			$('.alert-danger').show();
			return;
        }
		var base64String = imgData.substr(22);
		$.ajax({
            url: "/register",
            type: "post",
            data: { data: base64String },
            async: true,
            success: function (htmlVal) {
				localMediaStream.stop();
            }, error: function (e) {
				$('.alert-danger').text('上传图片失败。');
				$('.alert-danger').show();
            }
        });
    }

	$('#submit').click(register);

	var snapshot = function () {
		$('.alert-danger').hide();
		if (localMediaStream) {
			img.width =video.videoWidth;
			img.height = video.videoHeight;
			var canvas = capture(video);
			imgData = canvas.toDataURL("image/png");
			img.src = canvas.toDataURL('image/webp');
			$('#capture').hide();
			$('#submit').show();
			$('video').hide();
		}
	};

	 $('#capture').click(snapshot);

	navigator.getUserMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	navigator.getUserMedia(
		{video: true},
		function (stream) {
			video.src = window.URL.createObjectURL(stream);
			localMediaStream = stream;
		},
		function () {
			alert('your browser does not support getUserMedia');
		}
	);
});
