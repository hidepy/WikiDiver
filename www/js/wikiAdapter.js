/// <reference path="../../tsd/jquery/jquery.d.ts"/>
/*
Qiita
http://qiita.com/yubessy/items/16d2a074be84ee67c01f

入れるべきatomプラグイン
tag
emmet
*/
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
    WikiAdapter.prototype.getDetailById = function (id, callback) {
        console.log("in getDetailById. param=id: " + id);
        this.sendRequest("1", function (res) {
            console.log("in getDetailById callback!!");
            if (res && res.query && res.query.pages && res.query.pages[id]) {
                callback(res.query.pages[id]);
            }
            else {
                console.log("cannnot find target article...");
            }
        }, id);
    };
    WikiAdapter.prototype.searchHeadersFromKeyword = function (keyword, callback) {
        console.log("in searchHeadersFromKeyword. param=keyword: " + keyword);
        this.sendRequest("2", function (res) {
            console.log("in searchHeadersFromKeyword callback!!");
            console.log(res);
            if (res && res.query && res.query.search) {
                callback(res.query); //queryの階層にヒット件数があるので...
            }
        }, keyword);
    };
    WikiAdapter.prototype.searchArticleLinksById = function (id, callback) {
        console.log("in searchArticleLinksById. param=id: " + id);
        this.sendRequest("3", function (res) {
            console.log("in searchArticleLinksById callback!!");
            console.log(res);
        }, id);
    };
    WikiAdapter.prototype.getDetailByTitle = function (keyword, callback) {
        console.log("in getDetailByTitle. param=keyword: " + keyword);
        this.sendRequest("4", function (res) {
            console.log("in getDetailByTitle callback!!");
            console.log(res);
            if (res && res.query && res.query.pages) {
                var key = "";
                for (key in res.query.pages) {
                    break;
                }
                callback(res.query.pages[key]);
            }
            else {
                console.log("cannnot find target article...");
            }
        }, keyword);
    };
    WikiAdapter.prototype.sendRequest = function (type, callback, main_query_orig, language_type) {
        // type 検索タイプ
        // 0=> 【ヘッダ】タイトル検索
        // 1=> [明細]ID検索
        // 2=> [ヘッダ]キーワード検索
        // 3=> [ヘッダ]参照検索
        // 4=> [明細]タイトル検索
        //var main_query = main_query_orig ? encodeURIComponent(main_query_orig) : "";
        var main_query = main_query_orig;
        var l_type = language_type ? language_type : "ja";
        var params = {
            format: "json",
            action: "query",
            callback: "callback"
        };
        switch (type) {
            case "0":
                params["prop"] = "info";
                params["titles"] = main_query;
                break;
            case "1":
                //応答が微妙なんで一旦prop削除
                /*
                        params["prop"] = "revisions";
                        params["pageids"] = main_query;
                        params["rvprop"] = "content";
                        params["rvparse"] = "";
                
                        //params["prop"] = "extracts|redirects";
                        //params["prop"] = "extracts|links";
                */
                params["prop"] = "extracts|redirects";
                params["pageids"] = main_query;
                break;
            case "2":
                params["list"] = "search";
                params["srsearch"] = main_query;
                break;
            case "3":
                params["prop"] = "links";
                params["pageids"] = main_query;
                break;
            case "4":
                //params["prop"] = "extracts|redirects";
                //params["prop"] = "revisions|redirects|links";
                params["prop"] = "extracts|redirects|links";
                params["rvprop"] = "content";
                params["titles"] = main_query;
                params["pllimit"] = 50;
        }
        jQuery.ajax({
            type: "GET",
            url: "http://" + l_type + ".wikipedia.org/w/api.php",
            dataType: "jsonp",
            jsonpCallback: "callback",
            data: params,
            beforeSend: function () {
                console.log("ajax beforeSend. params=");
                console.log(params);
            },
            success: function (data) {
                console.log("ajax success!!");
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
