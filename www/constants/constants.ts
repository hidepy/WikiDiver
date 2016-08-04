/*
  定数定義
*/

//module APP_CONFIGS{
namespace APP_CONFIGS{
  export const NAME = "APP_WIKI_DIVER";
}

namespace FAVORITE_KEY_PROP{
  export const KEY = "title";
}

namespace GLOBAL_MEMO_PROP{
  export const KEY = "__GLOBAL_MEMO__"; // 1つのstoragemanagerを作るのは大げさなんで、通常memoの1プロパティとして定義
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

namespace WIKIADAPTER_CONSTANTS{
  export const STATUS = {
    NO_ACTION: "0",
    CONNECTING: "1",
    SUCCESS_DATA_PROCESSING: "2", // データ取得はok, DOMの準備など
    SUCCESS_PROCESSEND: "3",
    SUCCESS_NORESULT: "4",
    FATAL_ERROR: "9"
  };
  export const FAILURE_MSG = {
    "0": {
      "ja": "",
      "en": ""
    },
    "3": {
      "ja": "データ取得に成功しました",
      "en": "success!!"
    },
    "4": {
      "ja": "データが見つかりませんでした...",
      "en": "no data..."
    },
    "9": {
      "ja": "データ取得中にエラーが発生しました...",
      "en": "error occurred!!"
    }

  }
}

namespace STORAGE_TYPE{
  export const FAVORITE = "WIKI_DIVER_FAVORITE";
  export const NOTE_FOR_ARTICLE = "WIKI_DIVER_NOTE";
  export const HISTORY = "WIKI_DIVER_HISOTRY";
  export const TREE = "WIKI_DIVER_TREE";
  export const SETTINGS = "WIKI_DIVER_SETTINGS";
}

namespace SETTING_TYPE{
  export const LANGUAGE_APPEARANCE = "language_appearance"; // 見た目に関する言語設定
  export const LANGUAGE = "language"; // 取得先の言語設定
  export const IMG_HANDLE = "img_handle"; // value 0=トップのボタン押下で全画像ロード, 1=画像タッチでロード, 2=常にロード
  export const ARTICLE_TYPE = "article_type";
  export const HISTORY_LENGTH = "history_length";
  export const HISTORY_CACHE = "history_cache"; // 履歴をキャッシュする場合はtrue
}

namespace SETTING_MSG{
  export const LANGUAGE_APPEARANCE = {
    TITLE: {
      ja: "言語",
      en: "Language"
    },
    HELP: {
      ja: "見た目上の言語を設定します"
    }
  };

  export const LANGUAGE = {
    TITLE: {
      ja: "取得Wikiの言語",
      en: "Target Wiki language"
    },
    HELP: {
      ja: "どの言語のWiki情報を取得するかを決定します",
      en: "Decide which Language Wiki info to get"
    }
  };

  export const IMG_HANDLE = {
    TITLE: {
      ja: "Wiki内画像取得方法",
      en: "How to Get Images"
    },
    HELP: {
      ja: "Wiki内画像をどのように取得するか決定します。" +
          "default no disp= Wiki情報ロード時は非表示、画像を取得するボタン押下で全件取得します" +
          "touch load= 画像(緑枠で表示)を押下した時に、画像をロードします" +
          "always load= 記事取得時に常に画像をロードします",
      en: "default no disp= don't load images. By pushing \"Get All Images\" Button, you can get images." +
          "touch load= don't load images. By touching images, you can get images." +
          "always load= load images when article ready."
    }
  };

  export const ARTICLE_TYPE = {
    TITLE: {
      ja: "取得記事タイプ",
      en: "got article type"
    },
    HELP: {
      ja: "通常のWiki表示記事を取得するか、テキストのみの記事を取得するかを決定します。" +
          "parse= wiki表示記事" +
          "extract= テキスト記事",
      en: "parse= get wiki page." +
          "extract= get only text page."
    }
  };

  export const HISTORY_LENGTH = {
    TITLE:{
      ja: "履歴件数",
      en: "history length"
    },
    HELP: {
      ja: "履歴の保持件数です。"
    }
  };
}

namespace GENERAL_MSG {
  export const SAVE_SUCCESS = {
    ja: "保存しました",
    en: "success to save"
  };
  export const SAVE_FAILURE = {
    ja: "保存に失敗しました...",
    en: "failed to save..."
  }
};
