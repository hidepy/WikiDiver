/*
  定数定義
*/
//module APP_CONFIGS{
var APP_CONFIGS;
(function (APP_CONFIGS) {
    APP_CONFIGS.NAME = "APP_WIKI_DIVER";
})(APP_CONFIGS || (APP_CONFIGS = {}));
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
    SETTING_TYPE.LANGUAGE = "language";
    SETTING_TYPE.ARTICLE_TYPE = "article_type";
    SETTING_TYPE.HISTORY_LENGTH = "history_length";
})(SETTING_TYPE || (SETTING_TYPE = {}));
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
