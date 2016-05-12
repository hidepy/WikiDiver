/// <reference path="../../tsd/jquery/jquery.d.ts"/>
var WikiAdapter = (function () {
    function WikiAdapter() {
    }
    WikiAdapter.prototype.getHeaderList = function (search_key) {
        console.log("in getHeaderList");
        this.sendRequest("0", function (res) {
            console.log("in getHeaderList callback!!");
            console.log(res);
        }, search_key);
    };
    WikiAdapter.prototype.getDetailById = function (id) {
    };
    WikiAdapter.prototype.sendRequest = function (type, callback, keyword) {
        // type 一覧検索か、1件検索か
        var params = {
            format: "json",
            action: "query"
        };
        switch (type) {
            case "0":
                params["prop"] = "info";
                params["titles"] = "keyword";
                break;
        }
        jQuery.ajax({
            type: "GET",
            url: "http://ja.wikipedia.org/w/api.php",
            dataType: "html",
            data: params,
            success: function (data) {
                console.log("ajax success!!");
                callback(data);
                return;
            },
            error: function (data) {
                alert("ajax error occured!! (" + data + ")");
            }
        });
    };
    return WikiAdapter;
}());
