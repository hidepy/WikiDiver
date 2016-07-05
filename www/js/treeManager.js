var TreeManager = (function () {
    function TreeManager() {
        this._tree = [];
        this._STORAGE_KEY_NAME = STORAGE_TYPE.TREE;
        this._save_history_tree = true;
        if (this._save_history_tree) {
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
        if (!this._save_history_tree) {
            return;
        } // 保存しないなら無視
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
    TreeManager.prototype.getAll = function () {
        return this._tree;
    };
    ;
    return TreeManager;
}());
