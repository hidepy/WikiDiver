class TreeManager{
  private _tree = [];
  private _STORAGE_KEY_NAME= "WIKI_DIVER_HISTORY_TREE";

  constructor(){

    var save_history_tree = true;

    if(save_history_tree){
      var data = window.localStorage.getItem(this._STORAGE_KEY_NAME);

      if(data){
        this._tree = JSON.parse(data);
      }
      else{
        this._set2storage();
      }
    }
  };
  private _set2storage(){
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
}
