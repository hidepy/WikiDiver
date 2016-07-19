/// <reference path="../../tsd/jquery/jquery.d.ts"/>
/*
Qiita
http://qiita.com/yubessy/items/16d2a074be84ee67c01f

入れるべきatomプラグイン
tag
emmet
*/
var WikiAdapter = (function () {
    function WikiAdapter(language, article_type) {
        this.status = "0"; // 0=(処理なし), 1=通信中, 2=通信正常終了, 3=結果処理なし, 9=致命的なエラー
        this.language_type = language || "ja"; // default
        this.article_type = article_type || "5"; // default(parse) "4" means extract
    }
    WikiAdapter.prototype.initStatus = function () {
        this.status = WIKIADAPTER_CONSTANTS.STATUS.NO_ACTION;
    };
    WikiAdapter.prototype.setLanguage = function (language) {
        this.language_type = language;
    };
    WikiAdapter.prototype.setArticleType = function (article_type) {
        this.article_type = article_type;
    };
    WikiAdapter.prototype.getHeaderList = function (search_key, callback) {
        console.log("in getHeaderList. param=search_key: " + search_key);
        //callback地獄...jqueryのdefferedするべきか...
        this.sendRequest("0", function (res) {
            console.log("in getHeaderList callback!!");
            //console.log(res);
            //pagesを確認
            //console.log(res.query.pages);
            var pages_info = res.query.pages;
            //一番表層のcallbackを呼出
            callback(pages_info);
        }, search_key);
    };
    WikiAdapter.prototype.getDetailById = function (id, callback) {
        var _this = this;
        console.log("in getDetailById. param=id: " + id);
        this.sendRequest("1", function (res) {
            console.log("in getDetailById callback!!");
            if (res && res.query && res.query.pages && res.query.pages[id]) {
                callback(res.query.pages[id]);
            }
            else {
                _this.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_NORESULT; // 取得想定対象なし
                console.log("cannot find target...");
                callback({ has_no_contents: true });
            }
        }, id);
    };
    WikiAdapter.prototype.searchHeadersFromKeyword = function (keyword, callback) {
        var _this = this;
        console.log("in searchHeadersFromKeyword. param=keyword: " + keyword);
        this.sendRequest("2", function (res) {
            console.log("in searchHeadersFromKeyword callback!!");
            //console.log(res);
            if (res && res.query && res.query.search) {
                callback(res.query); //queryの階層にヒット件数があるので...
            }
            else {
                _this.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_NORESULT; // 取得想定対象なし
                console.log("cannot find target...");
                callback({ has_no_contents: true });
            }
        }, keyword);
    };
    WikiAdapter.prototype.searchArticleLinksById = function (id, callback) {
        console.log("in searchArticleLinksById. param=id: " + id);
        this.sendRequest("3", function (res) {
            console.log("in searchArticleLinksById callback!!");
            //console.log(res);
        }, id);
    };
    WikiAdapter.prototype.getDetailByTitle = function (keyword, callback) {
        var _this = this;
        console.log("in getDetailByTitle. param=keyword: " + keyword);
        //var req_type = "5"; //"5" or "4"
        var req_type = this.article_type || "5";
        this.sendRequest(req_type, function (res) {
            console.log("in getDetailByTitle callback!!");
            //console.log(res);
            console.log("wikiadapter.status=" + wikiAdapter.status);
            if (req_type == "4") {
                if (res && res.query && res.query.pages) {
                    var key = "";
                    for (key in res.query.pages) {
                        break;
                    }
                    callback(res.query.pages[key]);
                }
                else {
                    _this.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_NORESULT; // 取得想定対象なし
                    console.log("cannnot find target article...");
                    callback({ has_no_contents: true });
                }
            }
            else if (req_type == "5") {
                if (res && res.parse) {
                    res.parse.isTypeParse = true; //parseルートと認識させる
                    callback(res.parse);
                }
                else {
                    _this.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_NORESULT; // 取得想定対象なし
                    console.log("cannot find target...");
                    callback({ parse: {}, has_no_contents: true });
                }
            }
        }, keyword);
    };
    WikiAdapter.prototype.searchRandomHeaders = function (callback) {
        var _this = this;
        console.log("in searchRandomHeaders");
        this.sendRequest("6", function (res) {
            console.log("in searchRandomHeaders callback!!");
            if (res && res.query && res.query.random) {
                callback(res.query);
            }
            else {
                _this.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_NORESULT; // 取得想定対象なし
                console.log("cannot find target...");
                callback({ has_no_contents: true });
            }
        });
    };
    WikiAdapter.prototype.sendRequest = function (type, callback, main_query_orig, language_type) {
        // type 検索タイプ
        // 0=> 【ヘッダ】タイトル検索
        // 1=> [明細]ID検索
        // 2=> [ヘッダ]キーワード検索
        // 3=> [ヘッダ]参照検索
        // 4=> [明細]タイトル検索
        // 5=> [明細]parse
        // 6=> [ヘッダ]ランダム検索
        //var main_query = main_query_orig ? encodeURIComponent(main_query_orig) : "";
        var main_query = main_query_orig;
        var l_type = this.language_type ? this.language_type : "ja"; // 言語設定
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
                //これ一応OK版
                params["prop"] = "extracts|links"; //redirectsは不要に！！なぜなら、redirectsは、redirects元を指すようなので
                params["titles"] = main_query;
                params["pllimit"] = 50;
                params["exsectionformat"] = "raw";
                break;
            case "5":
                params["action"] = "parse";
                params["page"] = main_query;
                //params["prop"] = "text|sections|links";
                params["prop"] = "text|sections|links|images";
                break;
            case "6":
                params["list"] = "random";
                params["rnnamespace"] = "0";
                params["rnlimit"] = "20";
                break;
        }
        // 後に使うんで...一旦保存...ここも美しくないなぁ
        var _wikiadapter = this;
        jQuery.ajax({
            type: "GET",
            url: "http://" + l_type + ".wikipedia.org/w/api.php",
            dataType: "jsonp",
            jsonpCallback: "callback",
            data: params,
            beforeSend: function () {
                _wikiadapter.status = WIKIADAPTER_CONSTANTS.STATUS.CONNECTING;
                console.log("ajax beforeSend. params=");
                outlog(params);
            },
            success: function (data) {
                _wikiadapter.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_DATA_PROCESSING;
                console.log("ajax success!!");
                outlog(data);
                callback(data);
                return;
            },
            error: function (data) {
                this.status = WIKIADAPTER_CONSTANTS.STATUS.FATAL_ERROR;
                alert("ajax error occured!!)");
                //console.log(data);
            }
        });
    };
    return WikiAdapter;
}());
