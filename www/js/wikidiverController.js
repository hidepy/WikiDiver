/// <reference path="./storageManager.ts" />
/// <reference path="./treeManager.ts"/>
/// <reference path="./commonFunctions.ts" />
/// <reference path="../constants/constants.ts"/>
//2016/07/04
/*
TODO
  memo 保存ok
  クリップ機能追加ok
  スライドメニュー実装
    menu項目
      home
      tree
      favorite
      history
      settings
*/
// 2016/07/01
// 是非これから取り入れていくべきこと
// 1. constantで共通関数、共通値定義
//      http://flabo.io/code/20140926/01-angularjs-application-7-tips/
// 2. filterで検索機能、ソート機能をcontrollerから除外する
//      http://pote.hatenadiary.jp/entry/2012/11/09/140457
//      | date を使用すれば、更新日などの表示をfilterで行える
//      | limitを使用すれば最大件数絞り
//      | orderByを使用すれば、オブジェクト(配列の)キーを指定するとソートしてくれる
//      filter: searchなどで、
/*
        <li ng-repeat="article in articles | filter : { title: 'jQuery', url: 'buildinsider' }">
        filter: にオブジェトを渡すと、その条件でフィルタしてくれる
*/
//        ちなみに、filterはjs側でも使える
// 残todo(2016/06/29)
//   1次対応
//   ・extractじゃなくてparseの時にimgとかどうするか
//   ・保存できるように(ローカル対応, 名称のみ対応)
//  　・tree対応(現在どこにいるか)
//   ・メモ対応(wikiに対する自分のメモを残しておける)
//      グローバルノートが欲しいな
//   2次対応
//   ・
//(function(){
{
    'use strict';
    var module = ons.bootstrap(APP_CONFIGS.NAME, ['onsen', 'checklist-model']);
    // 記事のお気に入り
    var storage_manager_favorite = new StorageManager(STORAGE_TYPE.FAVORITE);
    // ノートの保存(キー=title又はid)
    var storage_manager_memo = new StorageManager(STORAGE_TYPE.NOTE_FOR_ARTICLE);
    var tree_manager_history = new TreeManager();
    var wikiAdapter = new WikiAdapter();
    ons.ready(function () {
        //pageにback-button設定
        if (isDevice()) {
            //全ページ分back-buttonイベントをアタッチ
            var pages = [pageSearchResultHeader, pageSearchResultDetail];
            for (var p in pages) {
                p.setDeviceBackButtonHandler(function () {
                    console.log("back button pushed!!");
                });
            }
        }
        // prepushイベントハンドラ (prepush, prepop時に、treeに変更を加える)
        myNavigator.on('prepush', function (event) {
            console.log("in prepush");
            var page = event.currentPage; // 現在のページオブジェクトを取得する
            // 果たして望み通りの値は取れるのか...
        });
        // onsen ポップオーバーを作成
        myPopoverMemo = ons.createPopover('popover_memo.html');
    });
    module.controller("HomeController", function ($scope) {
        $scope.search_key = "";
        $scope.dive = function () {
            var el_keyword = document.getElementById("home_searchKey");
            var search_key = el_keyword.value;
            //次画面遷移
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    search_key: search_key,
                    is_from_home: true
                }
            });
        };
        $scope.showMenu = function () {
            console.log("in showMenu");
            //menu.toggleMenu();
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
        else if (_args.onTransitionEnd && _args.onTransitionEnd.is_link) {
            $scope.items = _args.onTransitionEnd.links;
        }
    });
    module.controller("DetailController", function ($scope, $sce, $compile, popoverSharingService) {
        $scope.id = ""; //詳細ページ-> id
        $scope.title = ""; //詳細ページ-> タイトル
        $scope.article = ""; //詳細ページ-> メイン記事
        $scope.is_redirects_exist = false; //詳細ページ-> リダイレクト有無フラグ
        $scope.is_links_exist = false; //詳細ページ-> リンク有無フラグ
        $scope.show_redirects_pageid = false; //詳細ページ-> リダイレクト可視性フラグ
        $scope.redirects = []; //詳細ページ-> リダイレクトlist
        $scope.links = []; //詳細ページ-> リンクlist
        $scope.openWithBrowser = function () {
            console.log("in open browser");
            //window.open($scope.detail.full_url, '_system');
        };
        // noteを開く
        $scope.openNote = function () {
            // note用のpopoverを表示する
            console.log("in open note");
            var memo_data = storage_manager_memo.getItem($scope.id);
            if (!memo_data) {
                memo_data = "";
            }
            // popover オープン前に必要情報をコピー
            popoverSharingService.sharing.id = $scope.id;
            popoverSharingService.sharing.title = $scope.title;
            popoverSharingService.sharing.caption = "";
            popoverSharingService.sharing.memo = memo_data; //タイトルから名称を引いてくる
            // sharingの値更新をsubscribeする
            popoverSharingService.updateSharing();
            // popover show
            myPopoverMemo.show("#detail_note_button");
        };
        // お気に入り保存
        $scope.saveAsFavorite = function () {
            console.log("in saveAsFavorite");
            // favorite layout
            // title. article, is_links_exist, links
            var favorite = {
                title: $scope.title,
                article: $scope.article,
                is_links_exist: $scope.is_links_exist,
                links: $scope.links,
                update_date: formatDate(new Date())
            };
            //保存 キーはtitleだが...問題なし？ wiki的には重複しない 文字化けが心配
            storage_manager_favorite.saveItem2Storage(favorite.title, favorite);
            showAlert("save2favorite!! ... nocheck...");
        };
        $scope.processArticleClick = function (e) {
            // 対象のリンク要素なら
            if (e && e.target && e.target.tagName && (e.target.tagName.toLowerCase() == "a")) {
                e.preventDefault();
                console.log("in processArticleClick");
                var title = e.target.getAttribute("title");
                if (title) {
                    // 自身のページに遷移
                    myNavigator.pushPage("search_result_detail.html", {
                        onTransitionEnd: {
                            title: title,
                            need_onload_search: true
                        }
                    });
                }
            }
            //対象でなかったら無視
        };
        $scope.showMenu = function () {
        };
        $scope.back2home = function () {
            //resetToPage
            myNavigator.resetToPage("home.html");
        };
        $scope.processRedirectItemSelect = function (idx, event) {
            console.log("in processRedirectItemSelect");
            //var pageid = $scope.redirects[idx] ? $scope.redirects[idx].pageid : false;
            var title = $scope.redirects[idx] ? $scope.redirects[idx].title : false;
            if (title) {
                console.log("redirect search. title exist.");
                // 自身のページに遷移
                myNavigator.pushPage("search_result_detail.html", {
                    onTransitionEnd: {
                        title: title,
                        need_onload_search: true
                    }
                });
            }
            else {
                alert("faild to get pageid...");
            }
        };
        $scope.processLinkSearch = function () {
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    is_link: true,
                    links: $scope.links
                }
            });
        };
        var handleGetDetail = function (res) {
            console.log("callback level1");
            if (!res.isTypeParse) {
                //※※※ parseじゃなくてextractルート ※※※
                $scope.id = res.pageid;
                $scope.title = res.title;
                $scope.summary = "";
                var article = "";
                if (res.extract) {
                    article = res.extract;
                    article = article.replace(/[\r\n]/g, "<br />");
                    $scope.article = $sce.trustAsHtml(article);
                }
                else if (res.revisions && res.revisions["0"] && res.revisions["0"]["*"]) {
                    article = res.revisions["0"]["*"];
                    article = article.replace(/[\r\n]/g, "<br />");
                    $scope.article = $sce.trustAsHtml(article);
                }
                //pタグが存在すれば、一致する先頭を取得
                if (article) {
                    var s = article.match(/<p>.*?<\/p>/);
                    if (s) {
                        $scope.summary = $sce.trustAsHtml(s[0]);
                    }
                }
                //リダイレクトが存在すれば、リダイレクトの要素を表示させる
                $scope.is_redirects_exist = !!(res.redirects);
                if (res.redirects) {
                    for (var r in res.redirects) {
                        $scope.redirects.push(res.redirects[r]);
                    }
                    console.log("redirects exist");
                }
                //リンクが存在すれば、リンク要素を表示させる
                $scope.is_links_exist = !!(res.links);
                if (res.links) {
                    for (var l in res.links) {
                        $scope.links.push(res.links[l]);
                    }
                    console.log("links exist");
                }
            }
            else {
                // ※※※ parseルート！！※※※
                $scope.id = res.pageid;
                $scope.title = res.title;
                // article 抽出
                {
                    var article = res.text["*"];
                    //hrefを削除(※必須)
                    //article = article.replace(/href="[^"]*"/g, "");
                    article = article.replace(/href="(?!#\.)([^"](?!\.png))*"/g, "");
                    // imgを削除
                    article = article.replace(/<img[^>]+>/g, "");
                    /* "※※一旦！！これでいきましょう※※ 後に外部リンクとか開きたくなるかもだけど */
                    $scope.article = $sce.trustAsHtml(article);
                    //リンクが存在すれば、リンク要素を表示させる
                    $scope.is_links_exist = !!(res.links);
                }
                // link 抽出
                if (res.links) {
                    for (var i = 0; i < res.links.length; i++) {
                        var title = res.links[i]["*"];
                        var splitted_title = title.split(":");
                        if (splitted_title.length > 1) {
                            continue;
                        } //template: なんとか みたいな結果は除きたい
                        $scope.links.push({
                            pageid: "",
                            title: title
                        });
                    }
                    console.log("links exist");
                }
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
        outlog(_args);
        // ロード時検索要求有りなら
        if (_args.onTransitionEnd && _args.onTransitionEnd.need_onload_search) {
            if (_args.onTransitionEnd.pageid) {
                console.log("in pageid root");
                getDetail(_args.onTransitionEnd.pageid);
            }
            else {
                //pageidがない場合、titleにて明細検索を行う
                // 以降、メインはこっち！
                console.log("in title root");
                getDetailByTitle(_args.onTransitionEnd.title);
            }
        }
    });
    module.controller("popoverController", function ($scope, popoverSharingService) {
        $scope.sharing = {
            id: "",
            title: "",
            caption: "",
            memo: ""
        };
        // 保存
        $scope.saveMemo = function () {
            storage_manager_memo.saveItem2Storage($scope.sharing.id, $scope.sharing.memo);
            showAlert("save success!! but, actually needed to check success or failure...");
        };
        $scope.deleteMemo = function () {
            storage_manager_memo.deleteItem($scope.sharing.id);
            $scope.sharing.memo = "";
            showAlert("delete success!! but, actually needed to check success or failure...");
        };
        // close押下時
        $scope.closePopover = function () {
            myPopoverMemo.hide();
        };
        $scope.$on('updateSharing', function (event, data) {
            console.log(data);
            $scope.sharing = data;
            console.log("memo is=" + $scope.sharing.memo);
        });
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
            for (var i = 0; i < objArr.length; i++) {
                this.addItem(objArr[i][key_name], objArr[i][value_name]);
            }
        };
        this.createItemsFromArr = function (arr) {
            for (var i = 0; i < arr.length; i++) {
                this.addItem("" + i, arr[i]);
            }
        };
    });
}
