/// <reference path="../../tsd/cordova/cordova.d.ts"/>

/* 時間を文字列に変換 */
function formatDate(date){
	return ("" + date.getFullYear() + ("00" + (date.getMonth() + 1)).slice(-2) + ("00" + date.getDate()).slice(-2) + ("00" + date.getHours()).slice(-2) + ("00" + date.getMinutes()).slice(-2) + ("00" + date.getSeconds()).slice(-2) );
}

/* JSONをクエリリクエストストリングに変換 */
function convJSON2QueryString(data){
	var result = "";

	for(var prop in data){
		result += "" + prop + "=" + data[prop] + "&";
	}

	console.log("in convJSON2QueryString, result is: " + result);

	return result;

}

/* ハッシュを配列に変換する */
function convHash2Arr(hash){

	var arr = [];

	for(var prop in hash){
		arr.push(hash[prop]);
	}

	return arr;
}

/* 配列をハッシュに変換する. キーとするプロパティ名が必要 */
function convArr2Hash(list, key){

	var hash = {};

	if(list == null){
		return hash;
	}

	for(var i = 0; i < list.length; i++){
		hash[list[i][key]] = list[i];
	}

	return hash;

}

/* 文字列の空判定 */
function isEmpty(str){
	return ((str == null) || (str == ""));
}

/* アラートを表示 */
function showAlert(str){

	//var platform = window.device.platform;
	var platform = "";

	if(!isEmpty(str) && platform.match(/iPhone/)){
		ons.notification.alert({
          message: str
        });
	}
	else{
		alert(str);
	}
}

// Resize Base64 Image
//   img_base64_src: string "data:image/png;base64,xxxxxxxx"
function ImgB64Resize(imgB64_src, width, height, callback) {

	console.log("in ImgB64Resize");

	var canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
  var context = canvas.getContext("2d");

	var imageObj = new Image();

    imageObj.onload = function() {
    	console.log("in onload");
    	//context.drawImage(imageObj, 69, 50);
    	context.drawImage(imageObj, 0, 0, 100, 100);
    };
    //imageObj.src = "http://www.html5canvastutorials.com/demos/assets/darth-vader.jpg";
    imageObj.src = imgB64_src;





	/*
    // Image Type
    var img_type = imgB64_src.substring(5, imgB64_src.indexOf(";"));
    // Source Image
    var img = new Image();
    img.onload = function() {

    	console.log("on img.onload");

        // New Canvas
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        // Draw (Resize)
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // Destination Image
        var imgB64_dst = canvas.toDataURL(img_type);
        callback(imgB64_dst);
    };
    img.src = imgB64_src;
	*/


    console.log("img ImgB64Resize end");
}
