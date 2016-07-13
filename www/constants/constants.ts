/*
  定数定義
*/

//module APP_CONFIGS{
namespace APP_CONFIGS{
  export const NAME = "APP_WIKI_DIVER";
}

namespace STORAGE_TYPE{
  export const FAVORITE = "WIKI_DIVER_FAVORITE";
  export const NOTE_FOR_ARTICLE = "WIKI_DIVER_NOTE";
  export const HISTORY = "WIKI_DIVER_HISOTRY";
  export const TREE = "WIKI_DIVER_TREE";
  export const SETTINGS = "WIKI_DIVER_SETTINGS";
}

namespace SETTING_TYPE{
    export const LANGUAGE = "language";
    export const IMG_HANDLE = "img_handle"; // value 0=トップのボタン押下で全画像ロード, 1=画像タッチでロード, 2=常にロード
    export const ARTICLE_TYPE = "article_type";
    export const HISTORY_LENGTH = "history_length";
}

namespace PAGE_TYPE{
  export const TYPE_MAP = {
    "search_result_header.html": "H",
    "search_result_detail.html": "D",
    "tree_view.html": "T"
  };
  export const NAME_MAP = {
    "search_result_header.html": "Header",
    "search_result_detail.html": "Detail",
    "tree_view.html": "Tree"
  };
}

namespace FAVORITE_KEY_PROP{
  export const KEY = "title";
}
