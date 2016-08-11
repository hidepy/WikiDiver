// はじめてのtypescriptプロジェクトなのでよくわかっていないところがありますが勘弁
declare var angular: angular.IAngularStatic;
declare var myNavigator: NavigatorView;
declare var myMenu: SlidingMenuView;
declare var myPopoverMemo: PopoverView;
declare var myModal: ModalView;
declare var pageSearchResultHeader: any;
declare var pageSearchResultDetail: any;
declare var admob: any;
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
    var module = ons.bootstrap(APP_CONFIGS.NAME, ['onsen','checklist-model']);

    // 記事のお気に入り
    var storage_manager_favorite: StorageManager = new StorageManager(STORAGE_TYPE.FAVORITE);
    // ノートの保存(キー=title又はid)
    var storage_manager_memo: StorageManager = new StorageManager(STORAGE_TYPE.NOTE_FOR_ARTICLE);
    // マスタ(設定)
    var storage_manager_settings: StorageManager = new StorageManager(STORAGE_TYPE.SETTINGS);
    // 履歴の保存
    var storage_manager_history: StorageManager = new StorageManager(STORAGE_TYPE.HISTORY);

    // wikiadapter
    var wikiAdapter: WikiAdapter = new WikiAdapter();

    //var myPopoverMemo: PopoverView; // ※※※ これ必要か？？declareされているが...

    ons.ready(function(){

      // マスタ設定確認
      // 言語設定
      let m_lang_ap = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);
      if(!m_lang_ap){
        m_lang_ap = "ja";
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE_APPEARANCE, m_lang_ap);
      }
      // 取得先言語設定
      let m_lang = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE);
      if(!m_lang){
        m_lang = "ja";
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE, m_lang);
      }
      // 画像ハンドル設定
      let m_img = storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE);
      if(!m_img){
        m_img = "2";
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.IMG_HANDLE, m_img);
      }
      // 記事取得タイプ設定
      let m_art_type = storage_manager_settings.getItem(SETTING_TYPE.ARTICLE_TYPE);
      if(!m_art_type){
        m_art_type = "5";
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.ARTICLE_TYPE, m_art_type);
      }
      // 履歴件数設定
      let m_his_len = storage_manager_settings.getItem(SETTING_TYPE.HISTORY_LENGTH);
      if(!m_his_len){
        m_his_len = 10;
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.HISTORY_LENGTH, m_his_len);
      }
      // キャッシュ設定
      let m_his_cache = storage_manager_settings.getItem(SETTING_TYPE.HISTORY_CACHE);
      if(!m_his_cache){
        m_his_cache = 1;
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.HISTORY_CACHE, m_his_cache);
      }
      // フォントサイズ
      let m_font_size = storage_manager_settings.getItem(SETTING_TYPE.FONT_SIZE);
      if(!m_font_size){
        m_font_size = 100;
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.FONT_SIZE, m_font_size);
      }

      // global memoが存在しない場合、空白をセットしておく
      let g_memo = storage_manager_memo.getItem(GLOBAL_MEMO_PROP.KEY);
      if(!g_memo){
        storage_manager_memo.saveItem2Storage(GLOBAL_MEMO_PROP.KEY, {title: GLOBAL_MEMO_PROP.KEY});
      }

      // WikiAdapter をインスタンス化
      //wikiAdapter = new WikiAdapter(m_lang, m_art_type);
      // だと、タイミングが間に合わないようなので、(rootControllerでundefinedする)先にインスタンス化＆ここでは値をセットするだけ
      wikiAdapter.setLanguage(m_lang); // 取得先言語設定
      wikiAdapter.setArticleType(m_art_type); // 記事タイプ(extract, parse)

      // storage_manager_history(履歴管理) をインスタンス化
      //storage_manager_history = new StorageManager(STORAGE_TYPE.HISTORY, {length: m_his_len, sort_key: "timestamp"})
      storage_manager_history.setLimit({length: m_his_len, sort_key: "timestamp"});

      // メモのポップアップを生成しておく
      ons.createDialog('popover_memo.html').then(function(dialog) {
        myPopoverMemo = dialog;
      });

      //pageにback-button設定
      if(isDevice()){ //実機なら
        //全ページ分back-buttonイベントをアタッチ
        let pages = [pageSearchResultHeader, pageSearchResultDetail];

        for(var p in pages){
          (<any>p).setDeviceBackButtonHandler(function() {
            console.log("back button pushed!!");
          });
        }
      }

      admob.createBannerView({publisherId: "ca-app-pub-2131186805773040/8634150417"});


    });

    module.controller("RootController", function($scope){
      $scope.cache_length = {};
      $scope.cache_length.favorite_length = storage_manager_favorite.getItemLength();
      $scope.cache_length.history_length = storage_manager_history.getItemLength();
      $scope.cache_length.notes_length = storage_manager_memo.getItemLength() - 1; // 常にglobalMemoが存在する仕様なので

      // GLOBAL MEMOが正常に登録されていなかった場合
      if($scope.cache_length.notes_length < 0){
        // global memoが存在しない場合、空白をセットしておく
        let g_memo = storage_manager_memo.getItem(GLOBAL_MEMO_PROP.KEY);
        if(!g_memo){
          storage_manager_memo.saveItem2Storage(GLOBAL_MEMO_PROP.KEY, {title: GLOBAL_MEMO_PROP.KEY});
        }
      }
    });

    module.controller("MenuController", function($scope){

      // favoriteとhistory共通
      $scope.move2FavoriteOrHistory = function(type: string){

        var type_string = type; // favorite or history

        myMenu.setMainPage('home.html', {
          closeMenu: true,
          callback: function(){ // 直接favoriteに飛ぶのは難しそうなので...

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

      $scope.move2Tree = function(){
        myMenu.closeMenu();
        myNavigator.pushPage("tree_view.html");
      };

      $scope.move2setting = function(){
        myMenu.closeMenu();
        myNavigator.pushPage("settings.html");
      };

    });


    module.controller("HomeController", function($scope, popoverSharingService){
        $scope.search_key = "";

        $scope.handleSearchKeydown = function(event){
          if (event.which == 13) {
            $scope.dive();
          }
        };

        $scope.dive = function(){
          var el_keyword: HTMLElement = document.getElementById("home_searchKey");
          var search_key: string = (<HTMLInputElement>el_keyword).value;

          if(isEmpty(search_key)){ // 入力なしなら
            showAlert(GENERAL_MSG.NO_SEARCH_KEY[storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE)]);
            return;
          }

          //次画面遷移
          myNavigator.pushPage("search_result_header.html",{
              onTransitionEnd: {
                search_key: search_key,
                is_from_home: true
              }
            });
        };

        // ランダム検索
        $scope.randomDive = function(){
          //次画面遷移
          myNavigator.pushPage("search_result_header.html",{
            onTransitionEnd: {
              is_from_home: true,
              is_random: true
            }
          });
        }

        // global memo ポップアップ表示
        $scope.showGlobalMemo = function(){

          // global memo情報取得
          let g_memo = storage_manager_memo.getItem(GLOBAL_MEMO_PROP.KEY);
          if(!g_memo){
            storage_manager_memo.saveItem2Storage(GLOBAL_MEMO_PROP.KEY, {title: GLOBAL_MEMO_PROP.KEY});
          }

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

        $scope.move2setting = function(){
          console.log("in move2setting");
          myNavigator.pushPage("settings.html");
        };

        $scope.move2favorite = function(){
          console.log("in move2favorite");

          myNavigator.pushPage("search_result_header.html", {
            onTransitionEnd: {
              is_favorite: true
            }
          });
        };

        $scope.move2history = function(){
          console.log("in move2history");

          myNavigator.pushPage("search_result_header.html", {
            onTransitionEnd: {
              is_history: true
            }
          });
        };

        $scope.move2notes = function(){
          console.log("in move2notes");

          myNavigator.pushPage("search_result_header.html", {
            onTransitionEnd: {
              is_notes: true
            }
          });
        };

        $scope.showHelp = function(){
          myNavigator.pushPage("help.html");
        };

    });


    module.controller("HeaderListController", function($scope){

        $scope.screen_title = "Header";
        $scope.items = [];
        $scope.completeMatch = false; //true-> getHeaderList, false-> searchHeadersFromKeyword
        $scope.is_favorite = false;
        $scope.is_history = false;
        $scope.is_notes = false;
        $scope.is_random = false;
        $scope.delete_mode = false;
        $scope.delete_hash = {};// 削除対象hash
        $scope.no_result = false; // 結果0件の場合にtrue
        $scope.GLOBAL_MEMO_NAME = GLOBAL_MEMO_PROP.KEY; // Global memoのプロパティ名


        // 削除モード切替
        $scope.toggleDeletemode = function(){
          $scope.delete_mode = !$scope.delete_mode;
          //$scope.delete_targets.list = []; // 削除リストはクリア
          $scope.delete_hash = {}; // 削除ハッシュはクリア(こっちが実質本体)
        };

        $scope.toggleAllTargets = function(){

          let del_length = 0;
          for(let p in $scope.delete_hash){
            if($scope.delete_hash[p]){ del_length++; }
          }

          if(del_length == $scope.items.length){
            $scope.delete_hash = {};
          }
          else{
            // 全権削除対象にpush
            for(var i = 0; i < $scope.items.length; i++){
              $scope.delete_hash[$scope.items[i][FAVORITE_KEY_PROP.KEY]] = true;
            }
          }
        };

        // 削除処理
        $scope.deleteFavOrHis = function(){
          console.log("in deleteFavOrHis");

          console.log("current fav his flag=" + $scope.is_favorite + ", " + $scope.is_history);

          // 削除対象ハッシュを配列に変換
          let del_arr = [];
          for(let p in $scope.delete_hash){
            if(p == GLOBAL_MEMO_PROP.KEY){ continue; } // globalMemoは消去対象外

            del_arr.push(p);
          }// hashをarrに変換

          if($scope.is_favorite){
            storage_manager_favorite.deleteItems(del_arr);

            $scope.items = convHash2Arr(storage_manager_favorite.getAllItem());
            console.log("in favorite root");
          }
          else if($scope.is_history){
            storage_manager_history.deleteItems(del_arr);

            $scope.items = convHash2Arr(storage_manager_history.getAllItem());
            console.log("in history root");
          }
          else if($scope.is_notes){
            storage_manager_memo.deleteItems(del_arr);

            $scope.items = convHash2Arr(storage_manager_memo.getAllItem());
            console.log("in memo root");
          }

          showAlert(GENERAL_MSG.DELETE_SUCCESS[storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE)]);

          // ここで各種件数の値を更新
          $scope.cache_length.favorite_length = storage_manager_favorite.getItemLength();
          $scope.cache_length.history_length = storage_manager_history.getItemLength();
          $scope.cache_length.notes_length = storage_manager_memo.getItemLength() - 1; // 常にglobalMemoが存在する仕様なので

          $scope.toggleDeletemode(); // チェック切り替え
          //$scope.$apply(); // 画面更新
        };

        //レコード選択時
        $scope.processItemSelect = function(idx, event){

          if($scope.delete_mode){
            $scope.delete_hash[$scope.items[idx][FAVORITE_KEY_PROP.KEY]] = !$scope.delete_hash[$scope.items[idx][FAVORITE_KEY_PROP.KEY]];//true;
          }
          else{
            //idを求めてgetDetailByIdする
            var selectedItem = $scope.items[idx];

            //遷移だけして、次画面に検索をゆだねる
            if(selectedItem){
              //次画面遷移
              myNavigator.pushPage("search_result_detail.html",{
                  onTransitionEnd: {
                    pageid: selectedItem.pageid || false,
                    title: selectedItem.title,
                    need_onload_search: true
                  }
                });
            }
          }
        };

        var getHeaderList = (keyword: string)=> {

          myModal.show();

          wikiAdapter.getHeaderList(
            keyword,
            (res: any) => {
              console.log("callback level1(getHeaderList)");

              // wikiAdapterのステータスをチェック
              if(isWikiStatusSuccess()){
                for(var p in res){ //page idが存在すれば規定通りのレコードと判断
                  if(res[p].pageid){ $scope.items.push(res[p]); }
                }

                $scope.$apply();
              }
              else{
                handleDispErrMsg();
              }

              myModal.hide();
            });
        };

        var searchHeadersFromKeywordCallback = function(res){
          console.log("callback level1(searchHeadersFromKeywordCallback)");

          $scope.items = [];

          // ステータスsuccessなら
          if(isWikiStatusSuccess()){
            if(res){ // 返却値があれば
              if(res.has_no_contents){ // データ無しの場合
                $scope.no_result = true;
              }
              else if(res.search){ // 通常検索の場合
                for(var r in res.search){ $scope.items.push(res.search[r]); }
              }
              else if(res.random){ // ランダム検索の場合
                for(var r in res.random){ $scope.items.push(res.random[r]); }
              }
            }
            else{
              $scope.no_result = true;
            }

            $scope.$apply();
          }
          else{ // status failureなら
            handleDispErrMsg();
          }

          myModal.hide();
        };

        var searchHeadersFromKeyword = (keyword: string)=> {
          myModal.show();
          wikiAdapter.searchHeadersFromKeyword(
            keyword,
            searchHeadersFromKeywordCallback
          );
        };

        var searchRandomHeaders = ()=> {
          myModal.show();
          wikiAdapter.searchRandomHeaders(
            searchHeadersFromKeywordCallback // コールバック
          );
        };

        var _args = myNavigator.getCurrentPage().options;

        console.log("in HeaderListController start");
        //console.log(_args);

        // ホーム画面からの呼出の場合
        if(_args.onTransitionEnd && _args.onTransitionEnd.is_from_home){
          if(_args.onTransitionEnd.search_key){
            console.log("header. normal search");
            if($scope.completeMatch){ //完全一致検索
              getHeaderList(_args.onTransitionEnd.search_key);
            }
            else{ //本文検索
              searchHeadersFromKeyword(_args.onTransitionEnd.search_key);
            }
          }
          else{ //検索キーがないということは...random検索に全ておとす
            console.log("header. random search");
            searchRandomHeaders();
          }
        }
        // favorite検索時
        else if(_args.onTransitionEnd && _args.onTransitionEnd.is_favorite){
          console.log("header. favorite");
          $scope.is_favorite = true;
          $scope.screen_title = "Favorite";
          $scope.items = convHash2Arr(storage_manager_favorite.getAllItem());
          outlog($scope.items);
        }
        // history検索時
        else if(_args.onTransitionEnd && _args.onTransitionEnd.is_history){
          console.log("header. history");
          $scope.is_history = true;
          $scope.screen_title = "History";
          $scope.items = convHash2Arr(storage_manager_history.getAllItem());
        }
        // notes検索時
        else if(_args.onTransitionEnd && _args.onTransitionEnd.is_notes){
          console.log("header. notes");
          $scope.is_notes = true;
          $scope.screen_title = "Note";
          $scope.items = convHash2Arr(storage_manager_memo.getAllItem());

          outlog($scope.items);
        }
        // link選択時
        else if(_args.onTransitionEnd && _args.onTransitionEnd.is_link){
          $scope.items = _args.onTransitionEnd.links;
          console.log("header. link");
        }
        else{
          console.log("header. no operation");
        }

    });

    module.controller("DetailController", function($scope, $sce, $compile, popoverSharingService) {

      $scope.id = ""; //詳細ページ-> id
      $scope.title = "";　//詳細ページ-> タイトル
      $scope.article = ""; //詳細ページ-> メイン記事
      $scope.is_redirects_exist = false; //詳細ページ-> リダイレクト有無フラグ
      $scope.is_links_exist = false; //詳細ページ-> リンク有無フラグ
      $scope.show_redirects_pageid = false; //詳細ページ-> リダイレクト可視性フラグ
      $scope.redirects = []; //詳細ページ-> リダイレクトlist
      $scope.links = []; //詳細ページ-> リンクlist
      $scope.no_result = false; // 結果無しの場合にtrue
      $scope.img_handle_type = storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE) || "0"; // 設定無しならデフォルト"0"
      $scope.has_memo = false;
      $scope.has_favorite = false;
      $scope.font_size = storage_manager_settings.getItem(SETTING_TYPE.FONT_SIZE) || "100";

      $scope.move2Top = function(){
        $('.page__content').animate({scrollTop:0},'fast');
      };

      $scope.openWithBrowser = function(){
        console.log("in open browser");
        let main_url = "http://ja.wikipedia.org/wiki/";
        let title_encoded = encodeURI($scope.title);
        window.open(main_url + title_encoded, '_system');
      };

      // 画像を表示する
      $scope.showImages = function(){
        var el_imgs = document.querySelectorAll("#detail_content img[data-original]");

        for(var i = 0; i < el_imgs.length; i++){
          el_imgs[i].setAttribute("src", el_imgs[i].getAttribute("data-original"));
        }
      }

      // noteを開く
      $scope.openNote = function(){
        // note用のpopoverを表示する
        console.log("in open note");

        var memo_data = storage_manager_memo.getItem($scope[FAVORITE_KEY_PROP.KEY]);

        if(!memo_data){ memo_data = {title: $scope.title, memo: ""}; }

        // popover オープン前に必要情報をコピー
        popoverSharingService.sharing.id = $scope.id;
        popoverSharingService.sharing.title = $scope.title;
        popoverSharingService.sharing.caption = "";
        popoverSharingService.sharing.memo = memo_data.memo; //タイトルから名称を引いてくる
        popoverSharingService.sharing.is_global = false; // globalメモではない

        // sharingの値更新をsubscribeする
        popoverSharingService.updateSharing();

        // popover show
        if(myPopoverMemo){ myPopoverMemo.show("#detail_note_button"); }
        else{ showAlert("cannnot find myPopoverMemo... create!!"); }
      };

      // お気に入り保存
      $scope.saveAsFavorite = function(){

        console.log("in saveAsFavorite");

        // favorite layout
        // title. article, is_links_exist, links
        let favorite = {
          title: $scope.title,
          article: $scope.article,
          is_links_exist: $scope.is_links_exist,
          links: $scope.links,
          update_date: formatDate(new Date())
        };

        // 言語取得
        let lang = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);

        //保存 キーはtitleだが...問題なし？ wiki的には重複しない 文字化けが心配
        if(storage_manager_favorite.saveItem2Storage(favorite[FAVORITE_KEY_PROP.KEY], favorite)){
          showAlert(GENERAL_MSG.SAVE_SUCCESS[lang]);
          $scope.has_favorite = true;

          $scope.cache_length.favorite_length = storage_manager_favorite.getItemLength();
        }
        else{
          showAlert(GENERAL_MSG.SAVE_FAILURE[lang]);
        }

      }

      $scope.processArticleClick = function(e){

        var tag = (e && e.target && e.target.tagName) ? e.target.tagName : null;

        if(!tag){ return; }

        // 対象のリンク要素なら
        if(tag.toLowerCase() == "a"){
          e.preventDefault();
          console.log("in processArticleClick(a tag)");

          let title = e.target.getAttribute("title");

          if(title){
            // 自身のページに遷移
            myNavigator.pushPage("search_result_detail.html",{
                onTransitionEnd: {
                  title: title,
                  need_onload_search: true
                }
              });
          }
        }

        // img要素で、かつ、マスタ設定が画像クリックロードの場合
        if(tag.toLowerCase() == "img"){
          e.preventDefault();

          console.log("in processArticleClick(img tag)");

          // タッチロードなら
          if(storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE) == "1"){
            var src = e.target.getAttribute("data-original");
            if(src){ e.target.setAttribute("src", src); } // src属性に値をセットして画像を取得しにいく
          }
        }

        //対象でなかったら無視
      };

      $scope.back2home = function(){
        //resetToPage
        myNavigator.resetToPage("home.html");
      };

      $scope.processRedirectItemSelect = function(idx, event){
        console.log("in processRedirectItemSelect");

        //var pageid = $scope.redirects[idx] ? $scope.redirects[idx].pageid : false;
        var title = $scope.redirects[idx] ? $scope.redirects[idx].title : false;
        if(title){

          console.log("redirect search. title exist.");

          // 自身のページに遷移
          myNavigator.pushPage("search_result_detail.html",{
              onTransitionEnd: {
                title: title,
                need_onload_search: true
              }
          });
        }
        else{
          alert("faild to get pageid...");
        }
      };

      $scope.processLinkSearch = function(){
        myNavigator.pushPage("search_result_header.html",{
            onTransitionEnd: {
              is_link: true,
              links: $scope.links
            }
          });
      };

      var handleGetDetail = (res: any, is_cache?: boolean)=> {
          console.log("callback level1(handleGetDetail)");
          console.log("response cd=" + wikiAdapter.status);

          // 成否判定 ただし、キャッシュからの場合は必ず成功なので通す
          if(isWikiStatusSuccess() || is_cache){
            if(res.has_no_contents){ // データがなければ
              $scope.no_result = true;
            }
            else if(!res.isTypeParse){ //parseでなければ
              //※※※ parseじゃなくてextractルート ※※※
              $scope.id = res.pageid;
              $scope.title = res.title;
              $scope.summary = "";

              var article = "";

              if(res.extract){
                article = res.extract;
                article = article.replace(/[\r\n]/g,"<br />");

                $scope.article = $sce.trustAsHtml(article);
              }
              else if(res.revisions && res.revisions["0"] && res.revisions["0"]["*"]){
                article = res.revisions["0"]["*"];
                article = article.replace(/[\r\n]/g,"<br />");

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

              if(res.redirects){
                for(var r in res.redirects){ $scope.redirects.push(res.redirects[r]); }
                console.log("redirects exist");
              }

              //リンクが存在すれば、リンク要素を表示させる
              $scope.is_links_exist = !!(res.links);

              if(res.links){
                for(var l in res.links){ $scope.links.push(res.links[l]); } // linkがあればつめてく
                console.log("links exist");
              }

            }
            else{
              // ※※※ parseルート！！※※※
              $scope.id = res.pageid;
              $scope.title = res.title;

              // article 抽出
              {
                var article: string = <string>res.text["*"];

                //hrefを削除(※必須)
                //article = article.replace(/href="[^"]*"/g, "");
                article = article.replace(/href="(?!#\.)([^"](?!\.png))*"/g, "");

                // img属性を調整
                article = article.replace(/srcset="[^"]*"/g, ""); // 一旦 srcsetを削除
                article = article.replace(/(<img.*)src="([^"]*)"([^>]*>)/g, "$1 data-original='https:$2' $3"); // その後、srcをほかの属性に置換

                $scope.article = $sce.trustAsHtml(article);
              }

              // リンク有無を確認
              $scope.is_links_exist = !!(res.links);

              // link 抽出
              if(res.links){
                for(let i = 0; i < res.links.length; i++){

                  let title = res.links[i]["*"];
                  let splitted_title = title.split(":");

                  if(splitted_title.length > 1){ continue; } //template: なんとか みたいな結果は除きたい

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

            // お気に入り登録有無を確認
            $scope.has_favorite = !!(storage_manager_favorite.getItem($scope[FAVORITE_KEY_PROP.KEY])); // ヒットするtitleがあれば
          }
          else{
            // 取得失敗...
            handleDispErrMsg();
          }

          // hisotryとして格納する詳細情報を作成
          let save_history_data = {
            pageid: $scope.id,
            title: $scope.title,
            timestamp: formatDate(new Date()),
            has_cache: false //キャッシュ情報保持フラグ(基本はfalseで。後にキャッシュ有りならtrueとする)
          }

          // historyをキャッシュとして利用する場合
          console.log("history_cache=" + storage_manager_settings.getItem(SETTING_TYPE.HISTORY_CACHE));
          if(storage_manager_settings.getItem(SETTING_TYPE.HISTORY_CACHE) == "1"){
            save_history_data["has_cache"] = true;
            save_history_data["cache_data"] = res; // 取得情報をまんまキャッシュとして保存しておく
          }

          // 詳細取得okならhistoryにタイトルを保存
          storage_manager_history.saveItem2Storage($scope[FAVORITE_KEY_PROP.KEY], save_history_data);

          // 履歴の長さを更新
          $scope.cache_length.history_length = storage_manager_history.getItemLength();

          $scope.$apply();

          // 全画像取得設定になっている場合はロード
          if(storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE) == "2"){
            setTimeout(function(){
              $scope.showImages();
            }, 1);
          }

          myModal.hide();
      };

      //idから詳細情報を取得する
      var getDetail = (key: string)=> {
          wikiAdapter.getDetailById(
              key,
              handleGetDetail
          );
      };
      //titleから詳細情報を取得する(searchだとpageidが取得できないので...)
      var getDetailByTitle = (key: string)=> {
          wikiAdapter.getDetailByTitle(
            key,
            handleGetDetail
          );
      };

      //---------- on detailpage load ----------
      var _args = myNavigator.getCurrentPage().options;

      // 履歴又はお気に入りに存在すれば、そっちから持ってくる
      //  マスタの設定が最新のものを取得する場合は例外

      console.log("in DetailController start");
      outlog(_args);

      // ロード時検索要求有りなら
      if(_args.onTransitionEnd && _args.onTransitionEnd.need_onload_search){
        if(false){ // 一旦、pageidルートは削除(お気に入り、履歴からの場合にこっちのルートに入ってしまう)
          //getDetail(_args.onTransitionEnd.pageid);
        }
        else{
          //pageidがない場合、titleにて明細検索を行う
          // 以降、メインはこっち！
          console.log("in title root");

          // 前画面から受け取った検索タイトル
          let title = _args.onTransitionEnd.title;
          // キャッシュデータがあれば格納
          let cached_data = storage_manager_history.getItem(title);

          // 履歴のキャッシュ使用有りで、履歴データのキャッシュ情報有りなら
          if((storage_manager_settings.getItem(SETTING_TYPE.HISTORY_CACHE) == "1") && (cached_data) && (cached_data.has_cache == true)){
            console.log("from cache");
            // データ取得後と同様のフローを走らせる
            handleGetDetail(cached_data.cache_data, true);
          }
          else{
            // データ取得waiting表示
            myModal.show();
            // wiki情報取得処理開始
            getDetailByTitle(title);
          }
        }
      }
    });


    module.controller("popoverController", function($scope, popoverSharingService){
      $scope.sharing = {
        id: "",
        title: "",
        caption: "",
        memo: ""
      };

      let lang = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);

      // 保存
      $scope.saveMemo = function(){
        if(storage_manager_memo.saveItem2Storage($scope.sharing[FAVORITE_KEY_PROP.KEY], {
          title: $scope.sharing[FAVORITE_KEY_PROP.KEY],
          memo: $scope.sharing.memo
        })){
          // 正常終了
          showAlert(GENERAL_MSG.SAVE_SUCCESS[lang]);
        }
        else{
          // 異常終了
          showAlert(GENERAL_MSG.SAVE_FAILURE[lang])
        }

        $scope.cache_length.notes_length = storage_manager_memo.getItemLength() - 1;

        popoverSharingService.sharing = $scope.sharing; // 次ポップアップオープン時用にコピー

        //showAlert("save success!! but, actually needed to check success or failure...");

        myPopoverMemo.hide();
      };

      $scope.deleteMemo = function(){
        // global memoの場合は、本当に削除はしない
        if($scope.title != GLOBAL_MEMO_PROP.KEY){
          storage_manager_memo.deleteItem($scope.sharing.id);
        }
        else{
          storage_manager_memo.saveItem2Storage(GLOBAL_MEMO_PROP.KEY, {title: GLOBAL_MEMO_PROP.KEY});
        }
        $scope.sharing.memo = "";

        showAlert(GENERAL_MSG.SAVE_SUCCESS[lang]);

        myPopoverMemo.hide();
      };

      // close押下時
      $scope.closePopover = function(){
        myPopoverMemo.hide();
      };

      $scope.$on('updateSharing', function(event, data) {
        $scope.sharing = data;
        console.log("memo is=" + $scope.sharing.memo);
      });
    });


    module.controller("TreeViewController", function($scope){
      console.log("in TreeViewController");

      // ---------- initial process start ----------

      var nv_stack: any = myNavigator.getPages();
      $scope.page_stack = [];

      for(var i = 0; i < nv_stack.length; i++){

        var type = PAGE_TYPE.TYPE_MAP[nv_stack[i].name];

        outlog(nv_stack[i]);

        var is_favorite = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_favorite : false;
        var is_history = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_history : false;
        var is_notes = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_notes : false;
        var is_random = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_random : false;
        var is_link = (nv_stack[i].options && nv_stack[i].options.onTransitionEnd && nv_stack[i].options.onTransitionEnd) ? nv_stack[i].options.onTransitionEnd.is_link : false;

        if(!type || (type == "T")){ continue; } // 表示不要のものは表示対象としない

        var options = nv_stack[i].options.onTransitionEnd; // ページへの引数を取得

        $scope.page_stack.push({
          p_name: nv_stack[i].name,
          l_name: PAGE_TYPE.NAME_MAP[nv_stack[i].name],
          type: type,
          search_key: (type == "H") ? (function(){
            if(isEmpty(options.search_key)){
              // 検索キーがない=> お気に入りか履歴から来た場合
              if(is_favorite){ return "[FAVORITE]"; }
              else if(is_history){ return "[HISTORY]"; }
              else if(is_notes){ return "[NOTES]"; }
              else if(is_random){ return "[RANDOM Search]"; }
              else if(is_link){ return "[LINK Search]"; }
              else{ return "[UNKNOWN...]"; }
            }
            else{
              return options.search_key;
            }
          })() : options.title,
          depth: i
        });
      }

      // ---------- initial process end ----------


      // 選択した深さに遷移する 自身の深さ以降のスタックは削除する
      $scope.move2SelectDepth = function(index){
        console.log("in move2SelectDepth. index=" + index);

        var stack_idx = $scope.page_stack[index].depth;

        // 遷移先情報をコピーしておく(ループで削除予定なので)
        var dest_info = {
          page_url: nv_stack[stack_idx].page,
          options: angular.copy(nv_stack[stack_idx].options.onTransitionEnd)
        };

        console.log("before delete stacks, length=" + (<any>myNavigator.getPages()).length);

        for(var i = (nv_stack.length - 1); i >= stack_idx; i--){ // 末尾から今回選択のindexまでを削除する
          nv_stack.pop(); // 削除
        }

        // navigatorの
        (<any>myNavigator).pages = nv_stack;

        console.log("deleted stacks=");
        outlog(nv_stack);

        console.log("after delete stacks, length=" + (<any>myNavigator.getPages()).length);

        // treeを選択要素まで削除した後にpushPage
        myNavigator.pushPage(dest_info.page_url, {
          onTransitionEnd: dest_info.options
        });
      };

    });


    // マスタ設定コントローラ
    module.controller("SettingsController", function($scope){

      $scope.radio_language_appearance = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE);
      $scope.radio_language = storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE);
      $scope.radio_imghandle = storage_manager_settings.getItem(SETTING_TYPE.IMG_HANDLE);
      $scope.radio_article = storage_manager_settings.getItem(SETTING_TYPE.ARTICLE_TYPE);
      $scope.history_length = storage_manager_settings.getItem(SETTING_TYPE.HISTORY_LENGTH);
      $scope.history_cache = storage_manager_settings.getItem(SETTING_TYPE.HISTORY_CACHE);
      $scope.font_size = storage_manager_settings.getItem(SETTING_TYPE.FONT_SIZE);

      // 言語関連情報
      $scope.msg_info = SETTING_MSG;

      $scope.saveMasterSetting = function(){
        if(isNaN($scope.history_length) || ($scope.history_length < 0)){
          $scope.history_length = 0;
        }

        if(isNaN($scope.font_size) || ($scope.font_size < 20) || ($scope.font_size > 200)){
          $scope.history_length = 100;
        }

        storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE_APPEARANCE, $scope.radio_language_appearance);
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.LANGUAGE, $scope.radio_language);
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.IMG_HANDLE, $scope.radio_imghandle);
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.ARTICLE_TYPE, $scope.radio_article);
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.HISTORY_LENGTH, $scope.history_length);
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.HISTORY_CACHE, $scope.history_cache);
        storage_manager_settings.saveItem2Storage(SETTING_TYPE.FONT_SIZE, $scope.font_size);

        wikiAdapter.setLanguage($scope.radio_language);
        wikiAdapter.setArticleType($scope.radio_article);

        storage_manager_history.setLimit({length: $scope.history_length, sort_key: "timestamp"});

        showAlert(GENERAL_MSG.SAVE_SUCCESS[storage_manager_settings.getItem(SETTING_TYPE.LANGUAGE_APPEARANCE)]);

        // 安全に前画面に戻る
        popPageSafe(myNavigator);
      }

    });

    // マスタ設定コントローラ
    /*
    module.controller("HelpController", function($scope){

    });
    */

}
