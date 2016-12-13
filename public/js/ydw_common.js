 function startsWith(str, word) {
   return str.lastIndexOf(word, 0) === 0;
 }

 function endsWith(str, word) {
   return str.indexOf(word, str.length - word.length) !== -1;
 }
 // 发送客户端的消息到服务器上，调试程序用
 function _log(msg) {
   $.ajax({
     url: '/log',
     type: 'post',
     data: {
       msg: msg
     }
   });
 }

 function minute2hms(timer) {
   var hours = parseInt(timer / 3600, 10);
   var minutes = parseInt(timer % 3600 / 60, 10);
   var seconds = parseInt(timer % 60, 10);

   hours = hours < 10 ? '0' + hours : hours;
   minutes = minutes < 10 ? '0' + minutes : minutes;
   seconds = seconds < 10 ? '0' + seconds : seconds;

   return hours + ':' + minutes + ':' + seconds;
 }

 //倒计时
 function start_timer(duration, display, cb) {
   var timer = duration;
   var _interval_id = setInterval(function() {
     var hms = minute2hms(timer);
     display.text(hms);

     if (--timer < 0) {
       clearInterval(_interval_id);
       if (cb) cb();
     }
   }, 1000);
 }

//wx下单
function wx_upload(url, callback) {
  var syncUpload = function(localIds){
    var localId = localIds.pop();
    wx.uploadImage({
      localId: localId,
      isShowProgressTips: 1,
      success: function (res) {
        var serverId = res.serverId; // 返回图片的服务器端ID
        $.ajax({
          url: url,
          type: 'post',
          data: {
            mediaid: serverId
          }
        }).then(callback);

        //其他对serverId做处理的代码
        if(localIds.length > 0){
          syncUpload(localIds);
        }
      }
    });
  };

  wx.chooseImage({
    count: 9,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: function (res) {
      var localIds = res.localIds;
      _log(localIds);
      syncUpload(localIds);
    }
  });
 }

//wx下单
function wx_unified(data, done, fail) {
  $.showLoading('下单中。。。');
  $.ajax({
    url: '/wxpay/unified',
    type: 'post',
    data: data
  }).then(function(unified_result) {
    $.hideLoading();
    _log(unified_result);
    if (unified_result.msg) {
      $.toast(unified_result.msg);
    } else {
      if (data.fee === 0) {
        // 0费用支付
        $.ajax({
          url: '/wxpay/noti_0/' + unified_result.user_pay_id,
          type: 'post'
        }).then(function(noti_0_result) {
          if (noti_0_result.success) {
            $.toast('使用玩贝支付完毕。', function() {
              if (done) done();
            });
          } else {
            $.toast(noti_0_result.msg, function() {
              if (fail) fail();
            });
          }
        });
      } else {
        // 微信支付
        WeixinJSBridge.invoke('getBrandWCPayRequest', unified_result, function(res) {
          _log(res);
          //Toast: 2s
          var msg = '支付已完成';
          if (res.err_msg != 'get_brand_wcpay_request:ok') {
            msg = '支付未完成';
          }
          $.toast(msg, function() {
            //redirect:支付成功，等待存放的页面
            if (res.err_msg == 'get_brand_wcpay_request:ok') {
              if (done) done();
            } else {
              if (fail) fail();
            }
          });
        });
      }
    }
  });
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d.toFixed(1);
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function is_weixin(){
  var ua = navigator.userAgent.toLowerCase();
  if(ua.match(/MicroMessenger/i)=="micromessenger") {
    return true;
  } else {
    return false;
  }
}
