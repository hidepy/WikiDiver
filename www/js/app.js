/// <reference path="./storageManager.ts" />
/// <reference path="./commonFunctions.ts" />
/*
コンテナとしてならgenericが有利！
class DataContainer<Type> {
    data: Type;
}

var a = new DataContainer<string>() ;

a.data = "data"; //OK
var b = new DataContainer<boolean>() ;
    b.data = true;//OK


*/
/*
複数ファイルのはなし

で、次のシンプルなサンプルを試してみると、ようやくうまく行きました。

log.ts
export function message( s: string ) {
 console.log( s );
}

main.ts
import log = module("log");
log.message("hello");

tsc main.ts -e

→helloとコンソールに出力された！

出力されたJavaScriptファイルを見ると、こんな感じになってます。

log.js
function message(s) {
    console.log(s);
}
exports.message = message;

main.js
var log = require("./log")
log.message("hello");

どうやらCommonJSのmodule仕様というのは、「exportしたいオブジェクトを"exports"っていうオブジェクトの中に入れておいて、importしたい側では、そのファイル名を指定してrequireを呼び出せばOK!」って感じみたいです。内部ではファイルを非同期に読み込んで独立した名前空間の中でevalしてるようです。へーへーへー。


*/
/*
43行目の<HTMLCanvasElement>は、Type Assertionと呼ばれる機能で、キャストみたいなものです。
document.getElementByIdが返すのがHTMLElementなので、そのままでは次の行でcanvas.getContextしたらコンパイルエラーになってしまうのですね。
Type Assertionはコンパイルすると消えてしまうので実行時には効きません。

HTMLCanvasElementとかCanvasRenderingContext2DとかのJavaScript組込みのインタフェースは、TypeScriptがデフォルトで読み込むlib.d.tsというファイルで定義されています。

*/
//(function(){
{
    'use strict';
    var module = angular.module('app', ['onsen', 'checklist-model']);
    var storage_manager = new StorageManager("WIKI_DIVER_INFO");
    var wikiAdapter = new WikiAdapter();
    module.controller('MasterController', function ($scope, $data) {
        $scope.items = $data.items;
        $scope.showDetail = function (index) {
            console.log("show detail comes");
            var selectedItem = $data.items[index];
            $data.selectedItem = selectedItem;
            //$scope.ons.navigator.pushPage('detail.html', {title : selectedItem.title});
            //myNavigator.pushPage('entry_record.html', {title : selectedItem.title});
        };
    });
    module.controller("HomeController", function ($scope) {
        $scope.search_key = "";
        $scope.dive = function () {
            var el_keyword = document.getElementById("home_searchKey");
            var search_key = el_keyword.value;
            //次画面遷移
            myNavigator.pushPage("search_result_header.html", { onTransitionEnd: {
                    search_key: search_key,
                    is_from_home: true
                } });
        };
    });
    module.controller("HeaderListController", function ($scope) {
        $scope.items = [];
        $scope.completeMatch = false; //true-> getHeaderList, false-> searchHeadersFromKeyword
        //レコード選択時
        $scope.processItemSelect = function (idx, event) {
            //idを求めてgetDetailByIdする
            var selectedItem = $scope.items[idx];
            //遷移だけして、次画面に検索をゆだねる
            if (selectedItem) {
                //次画面遷移
                myNavigator.pushPage("search_result_detail.html", {
                    onTransitionEnd: {
                        pageid: selectedItem.pageid || false,
                        title: selectedItem.title,
                        need_onload_search: true
                    }
                });
            }
        };
        var getHeaderList = function (keyword) {
            wikiAdapter.getHeaderList(keyword, function (res) {
                console.log("callback level1");
                //console.log(res);
                for (var p in res) {
                    if (res[p].pageid) {
                        $scope.items.push(res[p]);
                    }
                }
                $scope.$apply();
            });
        };
        var searchHeadersFromKeyword = function (keyword) {
            wikiAdapter.searchHeadersFromKeyword(keyword, function (res) {
                console.log("callback level1(search headers)");
                //console.log(res);
                var hit_count = (res.searchinfo && res.searchinfo.totalhits) ? res.searchinfo.totalhits : 0;
                $scope.items = [];
                if (res && res.search) {
                    for (var r in res.search) {
                        $scope.items.push(res.search[r]);
                    }
                }
                $scope.$apply();
            });
        };
        var _args = myNavigator.getCurrentPage().options;
        console.log("in HeaderListController start");
        //console.log(_args);
        // ホーム画面からの呼出の場合
        if (_args.onTransitionEnd && _args.onTransitionEnd.is_from_home && _args.onTransitionEnd.search_key) {
            if ($scope.completeMatch) {
                getHeaderList(_args.onTransitionEnd.search_key);
            }
            else {
                searchHeadersFromKeyword(_args.onTransitionEnd.search_key);
            }
        }
    });
    module.controller("DetailController", function ($scope, $sce) {
        $scope.title = "";
        $scope.article = "";
        $scope.is_redirects_exist = false;
        $scope.redirects = [];
        $scope._checkBElement = function () {
            console.log("in _checkBElement");
            var article = document.getElementById("detail_content");
            console.log("b elements are:");
            if (article) {
                console.log(article.querySelectorAll("b"));
            }
        };
        $scope.processRedirectItemSelect = function (idx, event) {
            console.log("in processRedirectItemSelect");
            var pageid = $scope.redirects[idx] ? $scope.redirects[idx].pageid : false;
            if (pageid) {
                // 自身のページに遷移
                myNavigator.pushPage("search_result_detail.html", {
                    onTransitionEnd: {
                        pageid: pageid,
                        need_onload_search: true
                    }
                });
            }
            else {
                alert("faild to get pageid...");
            }
        };
        var handleGetDetail = function (res) {
            console.log("callback level1");
            //console.log(res);
            $scope.title = res.title;
            if (res.extract) {
                var article = res.extract;
                article = article.replace(/[\r\n]/g, "<br />");
                $scope.article = $sce.trustAsHtml(article);
            }
            else if (res.revisions && res.revisions["0"] && res.revisions["0"]["*"]) {
                var article = res.revisions["0"]["*"];
                article = article.replace(/[\r\n]/g, "<br />");
                $scope.article = $sce.trustAsHtml(article);
            }
            //リダイレクトが存在すれば、リダイレクトの要素を表示させる
            $scope.is_redirects_exist = !!(res.redirects);
            if (res.redirects) {
                for (var r in res.redirects) {
                    $scope.redirects.push(res.redirects[r]);
                }
                console.log("redirects exist");
            }
            $scope.$apply();
        };
        //idから詳細情報を取得する
        var getDetail = function (key) {
            wikiAdapter.getDetailById(key, handleGetDetail);
        };
        //titleから詳細情報を取得する(searchだとpageidが取得できないので...)
        var getDetailByTitle = function (key) {
            wikiAdapter.getDetailByTitle(key, handleGetDetail);
        };
        //---------- on detailpage load ----------
        var _args = myNavigator.getCurrentPage().options;
        console.log("in DetailController start");
        //console.log(_args);
        // ロード時検索要求有りなら
        if (_args.onTransitionEnd && _args.onTransitionEnd.need_onload_search) {
            if (_args.onTransitionEnd.pageid) {
                getDetail(_args.onTransitionEnd.pageid);
            }
            else {
                //pageidがない場合、titleにて明細検索を行う
                getDetailByTitle(_args.onTransitionEnd.title);
            }
        }
    });
    module.factory("currentBikeInfo", function () {
        var data = {};
        data.name = "gn125";
        data.purchace_date = "2012/03/11";
        data.comment = "this is my first bike";
        data.img = "none";
        data.maintainance_records = 11;
        data.touring_records = 21;
        return data;
    });
    module.service("selectList", function () {
        this.items = [];
        this.selectedItem = {};
        this.addItem = function (_key, _value) {
            this.items.push({
                key: _key,
                value: _value
            });
        };
        this.removeItem = function (idx) {
            this.items.splice(idx, 1);
        };
        this.removeAllItems = function () {
            this.items.length = 0;
        };
        this.createItemsFromObjectArr = function (objArr, key_name, value_name) {
            /*
            objArr.forEach(function(val, idx, objArr){
                this.addItem(val[key_name], val[value_name]);
            });
            */
            for (var i = 0; i < objArr.length; i++) {
                this.addItem(objArr[i][key_name], objArr[i][value_name]);
            }
        };
        this.createItemsFromArr = function (arr) {
            /*
            arr.forEach(function(val, idx){
                this.addItem(idx, val);
            });
            */
            for (var i = 0; i < arr.length; i++) {
                this.addItem("" + i, arr[i]);
            }
        };
    });
    module.factory('$data', function () {
        var data = {};
        data.items = [
            {
                title: 'Item 1 Title',
                label: '4h',
                desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
            },
            {
                title: 'Another Item Title',
                label: '6h',
                desc: 'Ut enim ad minim veniam.'
            },
            {
                title: 'Yet Another Item Title',
                label: '1day ago',
                desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
            },
            {
                title: 'Yet Another Item Title',
                label: '1day ago',
                desc: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
            }
        ];
        return data;
    });
}
