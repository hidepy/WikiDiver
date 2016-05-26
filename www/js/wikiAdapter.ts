/// <reference path="../../tsd/jquery/jquery.d.ts"/>

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
   public getDetailById(id: string): void{
     console.log("in getDetailById. param=id: " + id);

     this.sendRequest("1", res => {
       console.log("in getDetailById callback!!");

       console.log(res);

       
     });
   }
   private sendRequest(type: string, callback: (res: any)=>void, main_query?: string): any{

     // type 一覧検索か、1件検索か



     //main_query
     //  keywordのヘッダ検索なら検索キーが、
     //  idの1記事検索ならidが入る

     var params = {
       format: "json",
       action: "query",
       callback: "test"
     };

     switch(type){
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
       beforeSend: function(){
         console.log("ajax beforeSend");
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
