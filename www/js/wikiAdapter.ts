/// <reference path="../../tsd/jquery/jquery.d.ts"/>

/*
Qiita
http://qiita.com/yubessy/items/16d2a074be84ee67c01f

入れるべきatomプラグイン
tag
emmet
*/

var IS_DEBUG = false;

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
       //console.log(res.query.pages);

       var pages_info = res.query.pages;

       //一番表層のcallbackを呼出
       callback(pages_info);

     }, search_key);

   }
   public getDetailById(id: string, callback: (res: any)=>void): void{
     console.log("in getDetailById. param=id: " + id);

     this.sendRequest("1", res => {
       console.log("in getDetailById callback!!");

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
       //console.log(res);

       if(res && res.query && res.query.search){
         callback(res.query); //queryの階層にヒット件数があるので...
       }

     }, keyword);
   }
   public searchArticleLinksById(id: string, callback: (res: any)=> void): void{
     console.log("in searchArticleLinksById. param=id: " + id);

     this.sendRequest("3", res=> {
       console.log("in searchArticleLinksById callback!!");
       //console.log(res);
     }, id);
   }
   public getDetailByTitle(keyword: string, callback: (res: any)=>void): void{
     console.log("in getDetailByTitle. param=keyword: " + keyword);

     this.sendRequest("4", res => {
       console.log("in getDetailByTitle callback!!");
       //console.log(res);

       if(res && res.query && res.query.pages){
         var key = "";
         for(key in res.query.pages){ break; }

         callback(res.query.pages[key]);
       }
       else{
         console.log("cannnot find target article...");
       }
     }, keyword);
   }
   private sendRequest(type: string, callback: (res: any)=>void, main_query_orig?: string, language_type?: string): any{

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

     switch(type){
       case "0": //=> [ヘッダ]ヘッダ単一検索
        params["prop"] = "info";
        params["titles"] = main_query;
        break;
      case "1": //=> [明細]ID検索
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
      case "2": //[ヘッダ] タイトル部分一致検索
        params["list"] = "search";
        params["srsearch"] = main_query;
        break;
      case "3": //[ヘッダ] リンク検索
        params["prop"] = "links";
        params["pageids"] = main_query;
        break;
      case "4": //[明細] タイトル検索
      //これ一応OK版
      params["prop"] = "extracts|links";//redirectsは不要に！！なぜなら、redirectsは、redirects元を指すようなので
      params["titles"] = main_query;
      params["pllimit"] = 50;
     }


     if(IS_DEBUG){
       if(type == "1" || type == "4"){ //明細なら
         console.log("dummy detail");
         return callback(this._getDeummyDetail());
       }
       else{
         console.log("dummy header");
         return callback(this._getDummyHeader());
       }
     }


     jQuery.ajax({
       type: "GET",
       url: "http://" + l_type + ".wikipedia.org/w/api.php",
       dataType: "jsonp",
       jsonpCallback: "callback",
       data: params,
       beforeSend: function(){
         console.log("ajax beforeSend. params=");
         //console.log(params);
       },
       success: function(data){
         console.log("ajax success!!");
         if(!isDevice()){ console.log(console.log(data)); }
         callback(data);
         return;
       },
       error: function(data){
         alert("ajax error occured!!)");
         //console.log(data);
       }
     });
   }

   private _getDummyHeader = function(): any{
     //return JSON.parse('{"batchcomplete":"","continue":{"sroffset":10,"continue":"-||"},"query":{"searchinfo":{"totalhits":81},"search":[{"ns":0,"title":"スズキ・GN","snippet":"ビジネスユースも意識したオールマイティな仕様         <span class=\"searchmatch\">GN125</span>は125cc4ストローク単気筒エンジンを搭載し、1982年4月に発売された。 日本国内では全車キャストホイール仕様のGN125Eという名称で販売されていたが、スポークホイール仕様の設定があった日本国外輸出向けモデルには<span class=\"searchmatch\">GN125</span>","size":5967,"wordcount":906,"timestamp":"2015-05-07T02:48:08Z"},{"ns":0,"title":"スズキ・GN125","snippet":"スズキ・GN &gt; スズキ・<span class=\"searchmatch\">GN125</span>      <span class=\"searchmatch\">GN125</span>（ジーエヌひゃくにじゅうご）とは、スズキが製造・発売するオートバイ（第二種原動機付自転車）である。 本項では、1980年代に販売された日本国内生産車種と、1990年以降に日本国外でOEM生産された車種とを、「<span class=\"searchmatch\">GN125</span>","size":9985,"wordcount":1377,"timestamp":"2016-02-09T05:09:05Z"},{"ns":0,"title":"スズキ・エポ","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":2246,"wordcount":407,"timestamp":"2015-04-07T21:34:34Z"},{"ns":0,"title":"スズキ・GSX400FW","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":2037,"wordcount":320,"timestamp":"2015-03-18T23:12:08Z"},{"ns":0,"title":"スズキ・RGV-Γ500","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":4571,"wordcount":799,"timestamp":"2016-03-08T08:00:27Z"},{"ns":0,"title":"スズキ・マローダー","snippet":" 1998年に発売された排気量125ccクラスのアメリカンバイク。モデルネームはGZ125。 エンジンは<span class=\"searchmatch\">GN125</span>に搭載された124cc空冷単気筒4サイクル・SOHC2バルブを搭載する。最高出力12ps/9,000rpm。車体はマローダー250とほぼ共通で1","size":17851,"wordcount":2244,"timestamp":"2015-05-16T10:40:11Z"},{"ns":0,"title":"スズキ・K","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":4066,"wordcount":645,"timestamp":"2016-01-14T09:28:07Z"},{"ns":0,"title":"スズキ・ジェンマ","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":4355,"wordcount":717,"timestamp":"2015-12-08T07:04:29Z"},{"ns":0,"title":"スズキ・アクロス","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":5497,"wordcount":390,"timestamp":"2015-04-06T04:00:45Z"},{"ns":0,"title":"スズキ・GS50","snippet":"(UZ50L5) · 薔薇 · 蘭    51 - 125cc  DF125 · DR125S · GP125 · GT100 · GT125（en） · <span class=\"searchmatch\">GN125</span> · GS125E（カタナ） · K90/125 · RA125 · RG80E · RG125/E · RG125Γ · RV75/90/125（バンバン） ·","size":4753,"wordcount":680,"timestamp":"2015-03-22T10:11:57Z"}]}}');
     return {
       query:{
         search:{
           "0": {
             title: "ヤマハ・YBR"
           },
           "1": {
             title: "カナダの空港の一覧"
           }
         }
       }
     };
   };
   private _getDeummyDetail = function(): any{
     return {
       query:{
         pages:{
           "1063468":{
             extract: '"<p><b>YBR</b>（ワイビーアール）は、ヤマハ発動機が日本国外で生産を行っているオートバイである。2011年現在は125ccと250ccの2車種がある。</p><p></p><h2><span id=".E3.83.A2.E3.83.87.E3.83.AB.E4.B8.80.E8.A6.A7">モデル一覧</span></h2><h3><span id="YBR125">YBR125</span></h3><p><b>YBR125</b>は2000年に発表された。当初はブラジルにおいて圧倒的なシェアを誇るホンダ・CG125への対抗車種としての位置づけで現地の工場で生産が行われ、非常に好評を得たことから125ccクラスにおける世界戦略車として位置づけられるようになり、2002年には中国（重慶建設ヤマハ社）、2004年にはインドでの生産が開始され、その他の国でも部品供給によるノックダウン生産が行われており、欧州を含む世界的な規模で販売される車両にまでなった。なお、下位グレードはヤマハ・YBの名称を継承する形で<b>YB125</b>として販売されている。</p><p>車両に積まれているエンジンは、2000年に新設計された空冷単気筒 OHC4サイクルエンジン 123ccだが、販売地によって仕様・装備・スペック・車名が大きく異なり、フロントカウルの有無、ブレーキ方式（前後ドラム方式か、フロントのみディスク方式か）、キャブレターと燃料噴射装置の違いなどがある。変わったところでは中国で発表されたフロントカウル仕様の<b>YBR125天剣</b>・オフロード仕様の<b>YBR125G</b>・アメリカン仕様の<b>YBR125SP</b>（欧州仕様では<b>Custom</b>）・YBR125Gにウィンドシールド、大型のタンクシュラウド、キャブレターヒーターを装着した<b>YBR125KG</b>などがある。 なおエンジンにはバランサーが搭載されており、振動は他の単気筒オートバイと比べて少ない。燃費も良く、11Lの燃料タンクと相まって400～500kmの長い航続距離を実現している。</p><p>欧州向けモデルは欧州排出ガス規制のEURO-IIIに対応するため、2007年式よりエンジンにフューエルインジェクション（FI）が搭載されるようになり、厳しい排出ガス規制をクリアしているが、日本国内では原付二種クラスにおける非常に厳しい加速騒音規制のため、かつてのマジェスティ125と同様に並行輸入での販売しか行えない状況にある。</p>',
             pageid: "1063468",
             title: "ヤマハ・YBR",
             redirects: {
               "0": {
                 title: "YBR125",
                 pageid: "1173386"
               }
             }
           }
         }
       }
     };
   };

 }
