/*********************************

	localStorage manager

**********************************/

/*
**********	properties	**********
なし


**********	methods		**********
convStorage2Hash -private
	_storage_key_nameをキーとし、localstorageから保存されたデータを取得する

getAllItem -public
	現在保持しているハッシュの値を全件返却する

getItem(key) -public
	key に指定された値をキーとして、現在保持しているハッシュの値1件を返却する

getItemLength　-public
	保存されている要素の数を返却する

deleteItem(key) -public
	key に指定された値をキーとして、現在保持しているハッシュ、localstorageから1件削除する

deleteItems(keys) -public
	keys(文字配列) に指定された要素を、現在保持しているハッシュ、localstorageから削除する

saveItem2Storage(key, data) -public
	key に指定された値をキーとし、dataを現在保持しているハッシュ、localstorageに1件登録する

*/
var StorageManager = function(storage_key_name, limit_info?: any){ // limit_infoは、lengthとsort_keyプロパティを持たせたオブジェクト
	this.storage_key_name = storage_key_name;
	this.items = {};

	this.setLimit(limit_info); // 制限をかける

	this.init();

};


// プロトタイプ定義
!function(proto){

	proto.init = function() {

		//インスタンス化直後、現在のストレージの情報をハッシュに格納する
		this.items = convStorage2Hash(this.storage_key_name);

	};

	var convStorage2Hash = function(storage_key_name){

		var item_hash = {};

		try{

			var s = window.localStorage.getItem(storage_key_name);

			if(s){
				item_hash = JSON.parse(s);
			}

		}
		catch(e){
			console.log("convStorage2Hash eror occured");
		}

		return item_hash;
	};

	proto.setLimit = function(limit_info): boolean{
		if(limit_info && limit_info.length && limit_info.sort_key){ // 規定プロパティを満たしていれば
			this.limit_info = limit_info;

			return true;
		}

		return false;
	}

	proto.getAllItem = function(){
		return this.items;
	};

	proto.getItem = function(key){
		return this.items[key];
	}

	proto.deleteItem = function(key){

		delete　this.items[key];

		window.localStorage.setItem(this.storage_key_name, JSON.stringify(this.items));
	};

	proto.deleteItems = function(keys){
		if(keys && keys.length && (keys.length > 0)){
			var items = this.items;
			keys.forEach(function(v, i, arr){
				delete items[v];
			});
		}

		window.localStorage.setItem(this.storage_key_name, JSON.stringify(this.items));
	};

	proto.saveItem2Storage = function(key, data){

		console.log("in saveItem2Storage. my name is=" + this.storage_key_name);
		outlog(this.limit_info);

		if(this.limit_info){ // 制限ありの場合
			if(this.getItemLength() >= this.limit_info.length){ // 制限長を超えた
				var sorted_arr = this.getSorted(this.limit_info.sort_key, false);
				var target_key = sorted_arr[0]["__key"];

				console.log("saveItem2Storage#limit_item");
				console.log("got target_key=" + target_key);
				outlog(this.items[target_key]);

				this.deleteItem(target_key);
			}
		}

		this.items[key] = data;

		window.localStorage.setItem(this.storage_key_name, JSON.stringify(this.items));

	};

	proto.getSorted = function(key: string, desc?: boolean){
		var prefix = desc ? -1 : 1;
		var tmp_arr = convHash2Arr(this.items);

		tmp_arr.sort(function(a, b){
	    if(a[key] < b[key]) return -1 * prefix;
	    if(a[key] > b[key]) return 1 * prefix;
	    return 0;
		});

		return tmp_arr;
	};

	proto.getItemLength = function(){
		return Object.keys(this.items).length;
	}


	// ！！！！！！！！！！通常使用不可！！！！！！！！！！
	proto.deleteAllItem = function(){
		window.localStorage.setItem(this.storage_key_name, JSON.stringify({}));
	}

}(StorageManager.prototype);
