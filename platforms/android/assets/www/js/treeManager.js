var TreeManager = (function () {
    function TreeManager() {
        this._tree = [];
        this._STORAGE_KEY_NAME = "WIKI_DIVER_HISTORY_TREE";
        var save_history_tree = true;
        if (save_history_tree) {
            var data = window.localStorage.getItem(this._STORAGE_KEY_NAME);
            if (data) {
                this._tree = JSON.parse(data);
            }
            else {
                this._set2storage();
            }
        }
    }
    ;
    TreeManager.prototype._set2storage = function () {
        window.localStorage.setItem(this._STORAGE_KEY_NAME, JSON.stringify(this._tree));
    };
    ;
    TreeManager.prototype.push = function (obj) {
        this._tree.push(obj);
        this._set2storage();
    };
    ;
    TreeManager.prototype.pop = function () {
        this._tree.pop();
        this._set2storage();
    };
    ;
    TreeManager.prototype.getCurrent = function () {
        if (this._tree && this._tree.length && (this._tree.length > 0)) {
            return this._tree[this._tree.length - 1];
        }
        return null;
    };
    ;
    return TreeManager;
}());
