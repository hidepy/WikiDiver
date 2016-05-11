/*
	class: WikiAdapter

	summary: wikipediaへの問い合わせを行う

	functions:
		getHeaderList(keyword)
			keywordに紐づくwikipediaの情報(ヘッダ)を取得する



		getSingleArticle(id)


*/
var WikiAdapter = function(){

};

!function(proto){
	proto.getHeaderList = function(keyword){

	};

	proto.getSingleArticle = function(id){

	};

}(WikiAdapter.prototype);


//参考
/*
			キーワードを含むページのリストを得る
			http://ja.wikipedia.org/w/api.php?action=opensearch&search=%E3%83%AA%E3%83%B3%E3%82%B


			キーワードのページ全部取る
			「リンゴ」のページの内容
			http://ja.wikipedia.org/w/api.php?action=query&export&titles=%E3%83%AA%E3%83%B3%E3%82%B4
*/