class TreeManager{
  private _tree = [];
  private _STORAGE_KEY_NAME= STORAGE_TYPE.TREE;
  private _save_history_tree = true;

  constructor(){
    if(this._save_history_tree){
      var data = window.localStorage.getItem(this._STORAGE_KEY_NAME);

      if(data){ this._tree = JSON.parse(data); }
      else{ this._set2storage(); }
    }
  };
  private _set2storage(){
    if(!this._save_history_tree){ return; } // 保存しないなら無視
    window.localStorage.setItem(this._STORAGE_KEY_NAME, JSON.stringify(this._tree));
  };
  public push(obj: any){
    this._tree.push(obj);
    this._set2storage();
  };
  public pop(){
    this._tree.pop();
    this._set2storage();
  };
  public getCurrent(){
    if(this._tree && this._tree.length && (this._tree.length > 0)){
      return this._tree[this._tree.length - 1];
    }
    return null;
  };
  public getAll(){
    return this._tree;
  };
}
