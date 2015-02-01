//var YanApp = angular.module("YanApp", ["mobile-angular-ui"]);
var YanApp = angular.module("YanApp",[]);

Array.prototype.in_array=function(e){
    var r = new RegExp(this.S+e+this.S);
    return (r.test(this.S+this.join(this.S)+this.S));
};

function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    console.log(theRequest.go);
    return theRequest;
}

YanApp.controller("YanCtrl", function($scope, $http) {
    $scope.info = '';
    $scope.err = '';
    $scope.sendlog = [];
    $scope.recvlog = [];
    $scope.log = [];
    $scope.convdata = '';
    $scope.input = '';
    $scope.online = false;
    $scope.conv = {};
    var cid = '';

    var rt;
    var conv;

    var clientId = sessionStorage.myname;

    $scope.getcurr = function getcurr() {
        debugger;
        var request = $http({
            method: 'get',
            url: '/chat',
            params: {}
        });
        request.then(function(data){
            clientId = data.current;
        });
    };

    rt = lc.realtime({
        appId: 'u5436v6b1afexcs4khaw9suogf81937tosvvl79krxe4i5i2',
        auth: 'http://signature-example.avosapps.com/sign',
        clientId: clientId
    });

    var room1;
    rt.on('open', function() {
        room1 = rt.room({
            members: [
            clientId, GetRequest().go
            ],
            data: {
                info: $scope.convdata
            }
        }, function() {
            
        });
    });

    $scope.sendMsg = function sendMsg() {
        if ($scope.input == '') {
            $scope.info = 'input is none';
            return;
        }

        // $scope.conv[cid].send({msg: $scope.input}, function(data) {
        //     $scope.$apply(function() {
        //         $scope.log.push({'1': $scope.input});
        //     });
        // });

        room1.send({msg: $scope.input}, function() {
            $scope.$apply(function() {
                $scope.log.push({'1': $scope.input});
            });
        });
    };

    rt.on('message', function(data) {
        if (!$scope.conv.hasOwnProperty(data.cid)) {
            $scope.conv[data.cid] = rt.room(data.cid);
            cid = data.cid;
        }
        $scope.$apply(function () {
            $scope.log.push({'2': data.msg.msg});
        });
    });

    rt.on('result', function(data) {
        console.log('conversation results');
        console.log(data);
    });
});
