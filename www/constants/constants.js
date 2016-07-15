/*
  定数定義
*/
//module APP_CONFIGS{
var APP_CONFIGS;
(function (APP_CONFIGS) {
    APP_CONFIGS.NAME = "APP_WIKI_DIVER";
})(APP_CONFIGS || (APP_CONFIGS = {}));
var WIKIADAPTER_CONSTANTS;
(function (WIKIADAPTER_CONSTANTS) {
    WIKIADAPTER_CONSTANTS.STATUS = {
        NO_ACTION: "0",
        CONNECTING: "1",
        SUCCESS_DATA_PROCESSING: "2",
        SUCCESS_PROCESSEND: "3",
        SUCCESS_NORESULT: "4",
        FATAL_ERROR: "9"
    };
})(WIKIADAPTER_CONSTANTS || (WIKIADAPTER_CONSTANTS = {}));
var STORAGE_TYPE;
(function (STORAGE_TYPE) {
    STORAGE_TYPE.FAVORITE = "WIKI_DIVER_FAVORITE";
    STORAGE_TYPE.NOTE_FOR_ARTICLE = "WIKI_DIVER_NOTE";
    STORAGE_TYPE.HISTORY = "WIKI_DIVER_HISOTRY";
    STORAGE_TYPE.TREE = "WIKI_DIVER_TREE";
    STORAGE_TYPE.SETTINGS = "WIKI_DIVER_SETTINGS";
})(STORAGE_TYPE || (STORAGE_TYPE = {}));
var SETTING_TYPE;
(function (SETTING_TYPE) {
    SETTING_TYPE.LANGUAGE_APPEARANCE = "language_appearance"; // 見た目に関する言語設定
    SETTING_TYPE.LANGUAGE = "language"; // 取得先の言語設定
    SETTING_TYPE.IMG_HANDLE = "img_handle"; // value 0=トップのボタン押下で全画像ロード, 1=画像タッチでロード, 2=常にロード
    SETTING_TYPE.ARTICLE_TYPE = "article_type";
    SETTING_TYPE.HISTORY_LENGTH = "history_length";
})(SETTING_TYPE || (SETTING_TYPE = {}));
var SETTING_MSG;
(function (SETTING_MSG) {
    SETTING_MSG.LANGUAGE_APPEARANCE = {
        TITLE: {
            ja: "言語",
            en: "Language"
        },
        HELP: {
            ja: "見た目上の言語を設定します"
        }
    };
    SETTING_MSG.LANGUAGE = {
        TITLE: {
            ja: "取得Wikiの言語",
            en: "Target Wiki language"
        },
        HELP: {
            ja: "どの言語のWiki情報を取得するかを決定します",
            en: "Decide which Language Wiki info to get"
        }
    };
    SETTING_MSG.IMG_HANDLE = {
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
    SETTING_MSG.ARTICLE_TYPE = {
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
    SETTING_MSG.HISTORY_LENGTH = {
        TITLE: {
            ja: "履歴件数",
            en: "history length"
        },
        HELP: {
            ja: "履歴の保持件数です。"
        }
    };
})(SETTING_MSG || (SETTING_MSG = {}));
var PAGE_TYPE;
(function (PAGE_TYPE) {
    PAGE_TYPE.TYPE_MAP = {
        "search_result_header.html": "H",
        "search_result_detail.html": "D",
        "tree_view.html": "T"
    };
    PAGE_TYPE.NAME_MAP = {
        "search_result_header.html": "Header",
        "search_result_detail.html": "Detail",
        "tree_view.html": "Tree"
    };
})(PAGE_TYPE || (PAGE_TYPE = {}));
var FAVORITE_KEY_PROP;
(function (FAVORITE_KEY_PROP) {
    FAVORITE_KEY_PROP.KEY = "title";
})(FAVORITE_KEY_PROP || (FAVORITE_KEY_PROP = {}));
var GLOBAL_MEMO_PROP;
(function (GLOBAL_MEMO_PROP) {
    GLOBAL_MEMO_PROP.KEY = "__GLOBAL_MEMO__"; // 1つのstoragemanagerを作るのは大げさなんで、通常memoの1プロパティとして定義
})(GLOBAL_MEMO_PROP || (GLOBAL_MEMO_PROP = {}));
