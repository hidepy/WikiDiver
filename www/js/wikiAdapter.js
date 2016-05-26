/// <reference path="../../tsd/jquery/jquery.d.ts"/>
var WikiAdapter = (function () {
    function WikiAdapter() {
    }
    WikiAdapter.prototype.getHeaderList = function (search_key, callback) {
        console.log("in getHeaderList. param=search_key: " + search_key);
        //callback地獄...jqueryのdefferedするべきか...
        this.sendRequest("0", function (res) {
            console.log("in getHeaderList callback!!");
            //console.log(res);
            //pagesを確認
            console.log(res.query.pages);
            var pages_info = res.query.pages;
            //一番表層のcallbackを呼出
            callback(pages_info);
        }, search_key);
    };
    WikiAdapter.prototype.getDetailById = function (id) {
        console.log("in getDetailById. param=id: " + id);
        this.sendRequest("1", function (res) {
            console.log("in getDetailById callback!!");
            console.log(res);
        });
    };
    WikiAdapter.prototype.sendRequest = function (type, callback, main_query) {
        // type 一覧検索か、1件検索か
        //main_query
        //  keywordのヘッダ検索なら検索キーが、
        //  idの1記事検索ならidが入る
        var params = {
            format: "json",
            action: "query",
            callback: "test"
        };
        switch (type) {
            case "0":
                params["prop"] = "info";
                params["titles"] = main_query;
                break;
            case "1":
                params["prop"] = "info";
                params["pageids"] = main_query;
                break;
        }
        jQuery.ajax({
            type: "GET",
            url: "http://ja.wikipedia.org/w/api.php",
            dataType: "jsonp",
            jsonpCallback: "test",
            data: params,
            beforeSend: function () {
                console.log("ajax beforeSend");
            },
            success: function (data) {
                console.log("ajax success!!");
                console.log(data);
                callback(data);
                return;
            },
            error: function (data) {
                alert("ajax error occured!!)");
                console.log(data);
            }
        });
    };
    return WikiAdapter;
}());
