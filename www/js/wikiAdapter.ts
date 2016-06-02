/// <reference path="../../tsd/jquery/jquery.d.ts"/>

/*
Qiita
http://qiita.com/yubessy/items/16d2a074be84ee67c01f

入れるべきatomプラグイン
tag
emmet
*/

 class WikiAdapter{

   constructor(){

   }
   public getHeaderList(search_key: string, callback: (res: any)=>void): void{
     console.log("in getHeaderList. param=search_key: " + search_key);

     //callback地獄...jqueryのdefferedするべきか...
     this.sendRequest("0", (res: any): void => {
       console.log("in getHeaderList callback!!");
       //console.log(res);

       //pagesを確認
       console.log(res.query.pages);

       var pages_info = res.query.pages;

       //一番表層のcallbackを呼出
       callback(pages_info);

     }, search_key);

   }
   public getDetailById(id: string, callback: (res: any)=>void): void{
     console.log("in getDetailById. param=id: " + id);

     this.sendRequest("1", res => {
       console.log("in getDetailById callback!!");

       //resの構造は...
       /*
        root->
          query
            pages
              id_...
                ns
                pageid
                revisions
                title
       */

       if(res && res.query && res.query.pages && res.query.pages[id]){
         callback(res.query.pages[id]);
       }
       else{
         console.log("cannnot find target article...");
       }

     }, id);
   }
   public searchHeadersFromKeyword(keyword: string, callback: (res: any)=> void): void{
     console.log("in searchHeadersFromKeyword. param=keyword: " + keyword);

     this.sendRequest("2", res=> {
       console.log("in searchHeadersFromKeyword callback!!");
       console.log(res);
     });
   }
   public searchArticleLinksById(id: string, callback: (res: any)=> void): void{
     console.log("in searchArticleLinksById. param=id: " + id);

     this.sendRequest("3", res=> {
       console.log("in searchArticleLinksById callback!!");
       console.log(res);
     });
   }
   private sendRequest(type: string, callback: (res: any)=>void, main_query_orig?: string): any{

     // type 検索タイプ
     // 0=> タイトル検索
     // 1=> ID検索
     // 2=> キーワード検索
     // 3=> 参照検索


     //main_query
     //  keywordのヘッダ検索なら検索キーが、
     //  idの1記事検索ならidが入る


     //var main_query = main_query_orig ? encodeURIComponent(main_query_orig) : "";
     var main_query = main_query_orig;

     var params = {
       format: "json",
       action: "query",
       callback: "callback"
     };

     switch(type){
       case "0": //=> ヘッダ単一検索
        params["prop"] = "info";
        params["titles"] = main_query;
        break;
      case "1": //=> 明細検索
        //応答が微妙なんで一旦prop削除

        /*
        params["prop"] = "revisions";
        params["pageids"] = main_query;
        params["rvprop"] = "content";
        params["rvparse"] = "";
        */

        //params["action"] = "parse";
        params["prop"] = "extracts";
        params["exintro"] = "";
        params["explaintext"] = "";
        //params["titles"] = "Stack Overflow";
        params["pageids"] = main_query;

        break;
      case "2":
        params["list"] = "search";
        params["srsearch"] = main_query;
        /*
        srlimit	結果数の上限	（整数）
        srnamespace	記事の名前空間	0（通常の記事）, 1（ノート）, ...
        sroffset	結果のオフセット	（整数）
        srprop	結果に含める情報	size（記事サイズ）, wordcount（記事の単語数）, timestamp（記事の最終更新日時）, score（検索エンジンのスコア）, snippet（記事中の検索語を含む部分）, ...
        */
        break;
      case "3":
        params["prop"] = "links";
        params["pageids"] = main_query;
        break;
     }

     jQuery.ajax({
       type: "GET",
       url: "http://ja.wikipedia.org/w/api.php",
       dataType: "jsonp",
       jsonpCallback: "callback",
       data: params,
       beforeSend: function(){
         console.log("ajax beforeSend. params=");
         console.log(params);
       },
       success: function(data){
         console.log("ajax success!!");
         console.log(data);
         callback(data);
         return;
       },
       error: function(data){
         alert("ajax error occured!!)");
         console.log(data);
       }
     });
   }
 }
