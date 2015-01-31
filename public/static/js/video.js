$(document).ready(function() {
	var video = $('video')[0];
	var img = $('img')[0];
	var localMediaStream = null;
	var imgData = null;

	var showError = function(msg) {
		$('.alert-danger').text(msg);
		$('.alert-danger').show();
	};

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
			showError('请先拍一张靓照.');
			return;
        }
		var base64String = imgData.substr(22);
		var location = $('#location').val();
		$.ajax({
            url: "/register",
            type: "post",
            data: { data: base64String, location: location },
            async: true,
            success: function (htmlVal) {
				localMediaStream.stop();
				window.location = '/users.html';
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
			showError('your browser does not support getUserMedia');
		}
	);

	var locationError = function(error){
		switch(error.code) {
        case error.TIMEOUT:
            showError("A timeout occured! Please try again!");
            break;
        case error.POSITION_UNAVAILABLE:
            showError('We can\'t detect your location. Sorry!');
            break;
        case error.PERMISSION_DENIED:
            showError('Please allow geolocation access for this to work.');
            break;
        case error.UNKNOWN_ERROR:
            showError('An unknown error occured!');
            break;
		}
	}

	var locationSuccess = function(position){
		var coords = position.coords;
		$('#location').val(coords.longitude.toFixed(2)+ ',  ' + coords.latitude.toFixed(2));
	}

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(locationSuccess, locationError,{
			// 指示浏览器获取高精度的位置，默认为false
			enableHighAcuracy: true,
			// 指定获取地理位置的超时时间，默认不限时，单位为毫秒
			timeout: 5000,
			// 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
			maximumAge: 3000
		});
	}else{
		showError("Your browser does not support Geolocation!");
	}

});
