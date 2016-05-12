/// <reference path="../../tsd/jquery/jquery.d.ts"/>

 class WikiAdapter{

   constructor(){

   }
   public getHeaderList(search_key: string): void{
     console.log("in getHeaderList");

     this.sendRequest("0", (res: any): void => {
       console.log("in getHeaderList callback!!");
       console.log(res);
     }, search_key);

   }
   public getDetailById(id: string): void{

   }
   private sendRequest(type: string, callback: (res: any)=>void, keyword?: string): any{

     // type 一覧検索か、1件検索か

     var params = {
       format: "json",
       action: "query"
     };

     switch(type){
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
       success: function(data){
         console.log("ajax success!!");
         callback(data);
         return;
       },
       error: function(data){
         alert("ajax error occured!! (" + data + ")");
       }
     });
   }
 }
