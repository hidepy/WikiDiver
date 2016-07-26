/// <reference path="./storageManager.ts" />
/// <reference path="./commonFunctions.ts" />
/// <reference path="../constants/constants.ts"/>
//2016/07/04
/*
TODO

  2016/07/21
    残
      トランdelete, 右下メニュー

    directiveを使って、ラッピングできるところありそう。練習として取り入れたい

  2016/07/20
    残
      トランdelete 2回目の挙動!!

      キャッシュ... は不要か...実際、一番通信料かかるのは画像だし...
      データ操作後の挙動を統一
        note, favoriteに仕込みました。十分だよね。マスタはいいや

  2016/07/19

    statu表示-> okたぶん, globalメモの件数がおかしい-> okたぶん, historyなど2回目以降の削除がおかしい
    help, キャッシュ, コピーできない-> 実機でためす, データ操作後の挙動を完全にしたい

    が解決したらリリースする
      タイミングとしては、adsenseがokになったらadmobする

  希望
    概要のみ表示、その後展開的な
    トップに戻る
    ページ内検索

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
//(function(){
{
    'use strict';
    var module = ons.bootstrap(APP_CONFIGS.NAME, ['onsen', 'checklist-model']);
    // 記事のお気に入り
    var storage_manager_favorite = new StorageManager(STORAGE_TYPE.FAVORITE);
    // ノートの保存(キー=title又はid)
    var storage_manager_memo = new StorageManager(STORAGE_TYPE.NOTE_FOR_ARTICLE);
    // マスタ(設定)
    var storage_manager_settings = new StorageManager(STORAGE_TYPE.SETTINGS);
    // 履歴の保存
    var storage_manager_history = new StorageManager(STORAGE_TYPE.HISTORY);
    // wikiadapter
    var wikiAdapter = new WikiAdapter();
    //var myPopoverMemo: PopoverView; // ※※※ これ必要か？？declareされているが...
    ons.ready(function () {
        // マスタ設定確認
        // 言語設定
        var m_lang_ap = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);
        if (!m_lang_ap) {
            m_lang_ap = "ja";
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE_APPEARANCE, m_lang_ap);
        }
        // 取得先言語設定
        var m_lang = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE);
        if (!m_lang) {
            m_lang = "ja";
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE, m_lang);
        }
        // 画像ハンドル設定
        var m_img = storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE);
        if (!m_img) {
            m_img = "0";
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.IMG_HANDLE, m_img);
        }
        // 記事取得タイプ設定
        var m_art_type = storage_manager_settings.getItem(SETTING_TYPE.ARTICLE_TYPE);
        if (!m_art_type) {
            m_art_type = "5";
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.ARTICLE_TYPE, m_art_type);
        }
        // 履歴件数設定
        var m_his_len = storage_manager_settings.getItem(SETTING_TYPE.HISTORY_LENGTH);
        if (!m_his_len) {
            m_his_len = 10;
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.HISTORY_LENGTH, m_his_len);
        }
        // global memoが存在しない場合、空白をセットしておく
        var g_memo = storage_manager_memo.getItem(GLOBAL_MEMO_PROP.KEY);
        if (!g_memo) {
            storage_manager_memo.saveItem2Storage(GLOBAL_MEMO_PROP.KEY, "");
        }
        // WikiAdapter をインスタンス化
        //wikiAdapter = new WikiAdapter(m_lang, m_art_type);
        // だと、タイミングが間に合わないようなので、(rootControllerでundefinedする)先にインスタンス化＆ここでは値をセットするだけ
        wikiAdapter.setLanguage(m_lang); // 取得先言語設定
        wikiAdapter.setArticleType(m_art_type); // 記事タイプ(extract, parse)
        // storage_manager_history(履歴管理) をインスタンス化
        //storage_manager_history = new StorageManager(STORAGE_TYPE.HISTORY, {length: m_his_len, sort_key: "timestamp"})
        storage_manager_history.setLimit({ length: m_his_len, sort_key: "timestamp" });
        // メモのポップアップを生成しておく
        ons.createDialog('popover_memo.html').then(function (dialog) {
            myPopoverMemo = dialog;
        });
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
    });
    /*
        module.controller("rootController", function($scope){
          // modalに表示するメッセージ
          $scope.modal_msg = "";
          $scope.wikiAdapter = wikiAdapter;
    
          $scope.$watch($scope.wikiAdapter.status, function(newVal, oldVal){
            console.log("status changed!! newval, oldval=" + newVal + ", " + oldVal);
            // newValがconnectingになった(通信開始)で表示、それ以外ではクローズのみ行う
            switch(newVal){
              case WIKIADAPTER_CONSTANTS.STATUS.CONNECTING:
                $scope.modal_msg = "connecting...";
                myModal.show(); // 通信開始なのでmodal show
                break;
              case WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_DATA_PROCESSING:
                $scope.modal_msg = "data get ok. parsing...";
                // 特にmodalの状態は変更なし
                break;
              case WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_PROCESSEND:
                myModal.hide(); // 通信終了なのでmodal hide
                break;
              case WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_NORESULT:
                myModal.hide(); // 通信終了なのでmodal hide
                break;
              case WIKIADAPTER_CONSTANTS.STATUS.FATAL_ERROR:
                myModal.hide(); // 致命的エラーなのでmodal hide
                break;
              default:
                myModal.hide();
                break;
            }
          }, true);
        });
    */
    module.controller("MenuController", function ($scope) {
        // favoriteとhistory共通
        $scope.move2FavoriteOrHistory = function (type) {
            var type_string = type; // favorite or history
            myMenu.setMainPage('home.html', {
                closeMenu: true,
                callback: function () {
                    // ここでtreeをクリアする
                    myNavigator.pushPage("search_result_header.html", {
                        onTransitionEnd: {
                            is_favorite: (type_string == "favorite"),
                            is_history: (type_string == "history"),
                            is_notes: (type_string == "notes")
                        }
                    });
                }
            });
        };
        $scope.move2Tree = function () {
            myMenu.closeMenu();
            myNavigator.pushPage("tree_view.html");
        };
        $scope.move2setting = function () {
            myMenu.closeMenu();
            myNavigator.pushPage("settings.html");
        };
    });
    module.controller("HomeController", function ($scope, popoverSharingService) {
        $scope.search_key = "";
        $scope.favorite_length = storage_manager_favorite.getItemLength();
        $scope.history_length = storage_manager_history.getItemLength();
        $scope.notes_length = storage_manager_memo.getItemLength() - 1; // 常にglobalMemoが存在する仕様なので
        $scope.swipeup = function () {
            console.log("you swiped");
        };
        $scope.drag = function () {
            console.log("drag");
        };
        $scope.dive = function () {
            var el_keyword = document.getElementById("home_searchKey");
            var search_key = el_keyword.value;
            if (isEmpty(search_key)) {
                showAlert("please input search key...");
                return;
            }
            //次画面遷移
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    search_key: search_key,
                    is_from_home: true
                }
            });
        };
        // ランダム検索
        $scope.randomDive = function () {
            //次画面遷移
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    is_from_home: true,
                    is_random: true
                }
            });
        };
        // global memo ポップアップ表示
        $scope.showGlobalMemo = function () {
            // global memo情報取得
            var g_memo = storage_manager_memo.getItem(GLOBAL_MEMO_PROP.KEY);
            // popover オープン前に必要情報をコピー
            popoverSharingService.sharing.id = GLOBAL_MEMO_PROP.KEY;
            popoverSharingService.sharing.title = GLOBAL_MEMO_PROP.KEY;
            popoverSharingService.sharing.caption = "";
            popoverSharingService.sharing.memo = g_memo.memo || "";
            popoverSharingService.sharing.is_global = true; // globalメモなので
            // sharingの値更新をsubscribeする
            popoverSharingService.updateSharing();
            myPopoverMemo.show("#home_globalMemoButton");
        };
        $scope.move2setting = function () {
            console.log("in move2setting");
            myNavigator.pushPage("settings.html");
        };
        $scope.move2favorite = function () {
            console.log("in move2favorite");
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    is_favorite: true
                }
            });
        };
        $scope.move2history = function () {
            console.log("in move2history");
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    is_history: true
                }
            });
        };
        $scope.move2notes = function () {
            console.log("in move2notes");
            myNavigator.pushPage("search_result_header.html", {
                onTransitionEnd: {
                    is_notes: true
                }
            });
        };
    });
    module.controller("HeaderListController", function ($scope) {
        $scope.screen_title = "Header";
        $scope.items = [];
        $scope.completeMatch = false; //true-> getHeaderList, false-> searchHeadersFromKeyword
        $scope.is_favorite = false;
        $scope.is_history = false;
        $scope.is_notes = false;
        $scope.is_random = false;
        $scope.delete_mode = false;
        $scope.delete_hash = {}; // 削除対象hash
        $scope.no_result = false; // 結果0件の場合にtrue
        $scope.GLOBAL_MEMO_NAME = GLOBAL_MEMO_PROP.KEY; // Global memoのプロパティ名
        // 削除モード切替
        $scope.toggleDeletemode = function () {
            $scope.delete_mode = !$scope.delete_mode;
            //$scope.delete_targets.list = []; // 削除リストはクリア
            $scope.delete_hash = {}; // 削除ハッシュはクリア(こっちが実質本体)
        };
        $scope.toggleAllTargets = function () {
            var del_length = 0;
            for (var p in $scope.delete_hash) {
                if ($scope.delete_hash[p]) {
                    del_length++;
                }
            }
            if (del_length == $scope.items.length) {
                $scope.delete_hash = {};
            }
            else {
                // 全権削除対象にpush
                for (var i = 0; i < $scope.items.length; i++) {
                    $scope.delete_hash[$scope.items[i][FAVORITE_KEY_PROP.KEY]] = true;
                }
            }
        };
        // 削除処理
        $scope.deleteFavOrHis = function () {
            console.log("in deleteFavOrHis");
            console.log("current fav his flag=" + $scope.is_favorite + ", " + $scope.is_history);
            // 削除対象ハッシュを配列に変換
            var del_arr = [];
            for (var p in $scope.delete_hash) {
                del_arr.push(p);
            } // hashをarrに変換
            if ($scope.is_favorite) {
                storage_manager_favorite.deleteItems(del_arr);
                $scope.items = convHash2Arr(storage_manager_favorite.getAllItem());
                console.log("in favorite root");
            }
            else if ($scope.is_history) {
                storage_manager_history.deleteItems(del_arr);
                $scope.items = convHash2Arr(storage_manager_history.getAllItem());
                console.log("in history root");
            }
            else if ($scope.is_notes) {
                storage_manager_memo.deleteItems(del_arr);
                $scope.items = convHash2Arr(storage_manager_memo.getAllItem());
                console.log("in memo root");
            }
            showAlert("item deleted");
            $scope.toggleDeletemode(); // チェック切り替え
            //$scope.$apply(); // 画面更新
        };
        //レコード選択時
        $scope.processItemSelect = function (idx, event) {
            if ($scope.delete_mode) {
                $scope.delete_hash[$scope.items[idx][FAVORITE_KEY_PROP.KEY]] = !$scope.delete_hash[$scope.items[idx][FAVORITE_KEY_PROP.KEY]]; //true;
            }
            else {
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
            }
        };
        var getHeaderList = function (keyword) {
            myModal.show();
            wikiAdapter.getHeaderList(keyword, function (res) {
                console.log("callback level1(getHeaderList)");
                // wikiAdapterのステータスをチェック
                if (isWikiStatusSuccess()) {
                    for (var p in res) {
                        if (res[p].pageid) {
                            $scope.items.push(res[p]);
                        }
                    }
                    $scope.$apply();
                }
                else {
                    handleDispErrMsg();
                }
                myModal.hide();
            });
        };
        var searchHeadersFromKeywordCallback = function (res) {
            console.log("callback level1(searchHeadersFromKeywordCallback)");
            $scope.items = [];
            // ステータスsuccessなら
            if (isWikiStatusSuccess()) {
                if (res) {
                    if (res.has_no_contents) {
                        $scope.no_result = true;
                    }
                    else if (res.search) {
                        for (var r in res.search) {
                            $scope.items.push(res.search[r]);
                        }
                    }
                    else if (res.random) {
                        for (var r in res.random) {
                            $scope.items.push(res.random[r]);
                        }
                    }
                }
                else {
                    $scope.no_result = true;
                }
                $scope.$apply();
            }
            else {
                handleDispErrMsg();
            }
            myModal.hide();
        };
        var searchHeadersFromKeyword = function (keyword) {
            myModal.show();
            wikiAdapter.searchHeadersFromKeyword(keyword, searchHeadersFromKeywordCallback);
        };
        var searchRandomHeaders = function () {
            myModal.show();
            wikiAdapter.searchRandomHeaders(searchHeadersFromKeywordCallback // コールバック
            );
        };
        var _args = myNavigator.getCurrentPage().options;
        console.log("in HeaderListController start");
        //console.log(_args);
        // ホーム画面からの呼出の場合
        if (_args.onTransitionEnd && _args.onTransitionEnd.is_from_home) {
            if (_args.onTransitionEnd.search_key) {
                console.log("header. normal search");
                if ($scope.completeMatch) {
                    getHeaderList(_args.onTransitionEnd.search_key);
                }
                else {
                    searchHeadersFromKeyword(_args.onTransitionEnd.search_key);
                }
            }
            else {
                console.log("header. random search");
                searchRandomHeaders();
            }
        }
        else if (_args.onTransitionEnd && _args.onTransitionEnd.is_favorite) {
            console.log("header. favorite");
            $scope.is_favorite = true;
            $scope.screen_title = "Favorite";
            $scope.items = convHash2Arr(storage_manager_favorite.getAllItem());
            outlog($scope.items);
        }
        else if (_args.onTransitionEnd && _args.onTransitionEnd.is_history) {
            console.log("header. history");
            $scope.is_history = true;
            $scope.screen_title = "History";
            $scope.items = convHash2Arr(storage_manager_history.getAllItem());
        }
        else if (_args.onTransitionEnd && _args.onTransitionEnd.is_notes) {
            console.log("header. notes");
            $scope.is_notes = true;
            $scope.screen_title = "Note";
            $scope.items = convHash2Arr(storage_manager_memo.getAllItem());
        }
        else if (_args.onTransitionEnd && _args.onTransitionEnd.is_link) {
            $scope.items = _args.onTransitionEnd.links;
            console.log("header. link");
        }
        else {
            console.log("header. no operation");
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
        $scope.no_result = false; // 結果無しの場合にtrue
        $scope.img_handle_type = storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE) || "0"; // 設定無しならデフォルト"0"
        $scope.has_memo = false;
        $scope.openWithBrowser = function () {
            console.log("in open browser");
            var main_url = "http://ja.wikipedia.org/wiki/";
            var title_encoded = encodeURI($scope.title);
            window.open(main_url + title_encoded, '_system');
        };
        // 画像を表示する
        $scope.showImages = function () {
            var el_imgs = document.querySelectorAll("#detail_content img[data-original]");
            for (var i = 0; i < el_imgs.length; i++) {
                el_imgs[i].setAttribute("src", el_imgs[i].getAttribute("data-original"));
            }
        };
        // noteを開く
        $scope.openNote = function () {
            // note用のpopoverを表示する
            console.log("in open note");
            var memo_data = storage_manager_memo.getItem($scope[FAVORITE_KEY_PROP.KEY]);
            if (!memo_data) {
                memo_data = { title: $scope.title, memo: "" };
            }
            // popover オープン前に必要情報をコピー
            popoverSharingService.sharing.id = $scope.id;
            popoverSharingService.sharing.title = $scope.title;
            popoverSharingService.sharing.caption = "";
            popoverSharingService.sharing.memo = memo_data.memo; //タイトルから名称を引いてくる
            popoverSharingService.sharing.is_global = false; // globalメモではない
            // sharingの値更新をsubscribeする
            popoverSharingService.updateSharing();
            // popover show
            if (myPopoverMemo) {
                myPopoverMemo.show("#detail_note_button");
            }
            else {
                showAlert("cannnot find myPopoverMemo... create!!");
            }
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
            // 言語取得
            var lang = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);
            //保存 キーはtitleだが...問題なし？ wiki的には重複しない 文字化けが心配
            if (storage_manager_favorite.saveItem2Storage(favorite[FAVORITE_KEY_PROP.KEY], favorite)) {
                showAlert(GENERAL_MSG.SAVE_SUCCESS[lang]);
            }
            else {
                showAlert(GENERAL_MSG.SAVE_FAILURE[lang]);
            }
        };
        $scope.processArticleClick = function (e) {
            var tag = (e && e.target && e.target.tagName) ? e.target.tagName : null;
            if (!tag) {
                return;
            }
            // 対象のリンク要素なら
            if (tag.toLowerCase() == "a") {
                e.preventDefault();
                console.log("in processArticleClick(a tag)");
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
            // img要素で、かつ、マスタ設定が画像クリックロードの場合
            if (tag.toLowerCase() == "img") {
                e.preventDefault();
                console.log("in processArticleClick(img tag)");
                // タッチロードなら
                if (storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE) == "1") {
                    var src = e.target.getAttribute("data-original");
                    if (src) {
                        e.target.setAttribute("src", src);
                    } // src属性に値をセットして画像を取得しにいく
                }
            }
            //対象でなかったら無視
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
            console.log("callback level1(handleGetDetail)");
            console.log("response cd=" + wikiAdapter.status);
            // 成否判定
            if (isWikiStatusSuccess()) {
                if (res.has_no_contents) {
                    $scope.no_result = true;
                }
                else if (!res.isTypeParse) {
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
                    /*
                    if(article){
                      var s = article.match(/<p>.*?<\/p>/);
                      if(s){
                        $scope.summary = $sce.trustAsHtml(s[0]);
                      }
                    }
                    */
                    $scope.summary = ""; // 概要は...もう不要なのでは？
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
                        } // linkがあればつめてく
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
                        // img属性を調整
                        article = article.replace(/srcset="[^"]*"/g, ""); // 一旦 srcsetを削除
                        article = article.replace(/(<img.*)src="([^"]*)"([^>]*>)/g, "$1 data-original='https:$2' $3"); // その後、srcをほかの属性に置換
                        $scope.article = $sce.trustAsHtml(article);
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
                // parse, extractどちらでもここを通るんで
                wikiAdapter.status = WIKIADAPTER_CONSTANTS.STATUS.SUCCESS_PROCESSEND;
                // メモ登録有無を確認
                $scope.has_memo = !!(storage_manager_memo.getItem($scope[FAVORITE_KEY_PROP.KEY])); // ヒットするtitleがあれば
            }
            else {
                // 取得失敗...
                handleDispErrMsg();
            }
            // 詳細取得okならhistoryにタイトルを保存
            storage_manager_history.saveItem2Storage($scope[FAVORITE_KEY_PROP.KEY], {
                pageid: $scope.id,
                title: $scope.title,
                timestamp: formatDate(new Date())
            }); // とりあえず、pageidとtitleだけ！！後にキャッシュ数とか設定できれば...
            $scope.$apply();
            if (storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE) == "2") {
                setTimeout(function () {
                    $scope.showImages();
                }, 1);
            }
            myModal.hide();
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
        // 履歴又はお気に入りに存在すれば、そっちから持ってくる
        //  マスタの設定が最新のものを取得する場合は例外
        console.log("in DetailController start");
        outlog(_args);
        // ロード時検索要求有りなら
        if (_args.onTransitionEnd && _args.onTransitionEnd.need_onload_search) {
            if (false) {
            }
            else {
                //pageidがない場合、titleにて明細検索を行う
                // 以降、メインはこっち！
                console.log("in title root");
                myModal.show();
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
        var lang = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);
        // 保存
        $scope.saveMemo = function () {
            if (storage_manager_memo.saveItem2Storage($scope.sharing[FAVORITE_KEY_PROP.KEY], {
                title: $scope.sharing[FAVORITE_KEY_PROP.KEY],
                memo: $scope.sharing.memo
            })) {
                // 正常終了
                showAlert(GENERAL_MSG.SAVE_SUCCESS[lang]);
            }
            else {
                // 異常終了
                showAlert(GENERAL_MSG.SAVE_FAILURE[lang]);
            }
            popoverSharingService.sharing = $scope.sharing; // 次ポップアップオープン時用にコピー
            showAlert("save success!! but, actually needed to check success or failure...");
            myPopoverMemo.hide();
        };
        $scope.deleteMemo = function () {
            // global memoの場合は、本当に削除はしない
            if ($scope.id != GLOBAL_MEMO_PROP.KEY) {
                storage_manager_memo.deleteItem($scope.sharing.id);
            }
            else {
                storage_manager_memo.saveItem2Storage(GLOBAL_MEMO_PROP.KEY, "");
            }
            $scope.sharing.memo = "";
            showAlert("delete success!! but, actually needed to check success or failure...");
            myPopoverMemo.hide();
        };
        // close押下時
        $scope.closePopover = function () {
            myPopoverMemo.hide();
        };
        $scope.$on('updateSharing', function (event, data) {
            $scope.sharing = data;
            console.log("memo is=" + $scope.sharing.memo);
        });
    });
    module.controller("TreeViewController", function ($scope) {
        console.log("in TreeViewController");
        // ---------- initial process start ----------
        var nv_stack = myNavigator.getPages();
        $scope.page_stack = [];
        for (var i = 0; i < nv_stack.length; i++) {
            var type = PAGE_TYPE.TYPE_MAP[nv_stack[i].name];
            outlog(nv_stack[i]);
            var is_favorite = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_favorite : false;
            var is_history = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_history : false;
            var is_notes = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_notes : false;
            var is_random = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_random : false;
            var is_link = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_link : false;
            if (!type || (type == "T")) {
                continue;
            } // 表示不要のものは表示対象としない
            var options = nv_stack[i].options.onTransitionEnd; // ページへの引数を取得
            $scope.page_stack.push({
                p_name: nv_stack[i].name,
                l_name: PAGE_TYPE.NAME_MAP[nv_stack[i].name],
                type: type,
                search_key: (type == "H") ? (function () {
                    if (isEmpty(options.search_key)) {
                        // 検索キーがない=> お気に入りか履歴から来た場合
                        if (is_favorite) {
                            return "FAVORITE";
                        }
                        else if (is_history) {
                            return "HISTORY";
                        }
                        else if (is_notes) {
                            return "NOTES";
                        }
                        else if (is_random) {
                            return "RANDOM Search";
                        }
                        else if (is_link) {
                            return "LINK Search";
                        }
                        else {
                            return "UNKNOWN...";
                        }
                    }
                    else {
                        return options.search_key;
                    }
                })() : options.title,
                depth: i
            });
        }
        // ---------- initial process end ----------
        // 選択した深さに遷移する 自身の深さ以降のスタックは削除する
        $scope.move2SelectDepth = function (index) {
            console.log("in move2SelectDepth. index=" + index);
            var stack_idx = $scope.page_stack[index].depth;
            // 遷移先情報をコピーしておく(ループで削除予定なので)
            var dest_info = {
                page_url: nv_stack[stack_idx].page,
                options: angular.copy(nv_stack[stack_idx].options.onTransitionEnd)
            };
            console.log("before delete stacks, length=" + myNavigator.getPages().length);
            for (var i = (nv_stack.length - 1); i >= stack_idx; i--) {
                nv_stack.pop(); // 削除
            }
            // navigatorの
            myNavigator.pages = nv_stack;
            console.log("deleted stacks=");
            outlog(nv_stack);
            console.log("after delete stacks, length=" + myNavigator.getPages().length);
            // treeを選択要素まで削除した後にpushPage
            myNavigator.pushPage(dest_info.page_url, {
                onTransitionEnd: dest_info.options
            });
        };
    });
    // マスタ設定コントローラ
    module.controller("SettingsController", function ($scope) {
        $scope.radio_language_appearance = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);
        $scope.radio_language = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE);
        $scope.radio_imghandle = storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE);
        $scope.radio_article = storage_manager_settings.getItem(SETTING_TYPE.ARTICLE_TYPE);
        $scope.history_length = storage_manager_settings.getItem(SETTING_TYPE.HISTORY_LENGTH);
        // 言語関連情報
        $scope.msg_info = SETTING_MSG;
        $scope.saveMasterSetting = function () {
            if (isNaN($scope.history_length) || ($scope.history_length < 0)) {
                $scope.history_length = 0;
            }
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE_APPEARANCE, $scope.radio_language_appearance);
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE, $scope.radio_language);
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.IMG_HANDLE, $scope.radio_imghandle);
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.ARTICLE_TYPE, $scope.radio_article);
            storage_manager_settings.saveItem2Storage(SETTING_TYPE.HISTORY_LENGTH, $scope.history_length);
            wikiAdapter.setLanguage($scope.radio_language);
            wikiAdapter.setArticleType($scope.radio_article);
            storage_manager_history.setLimit({ length: $scope.history_length, sort_key: "timestamp" });
            showAlert("Commit Setting Change!!");
            // 安全に前画面に戻る
            popPageSafe(myNavigator);
        };
    });
}
