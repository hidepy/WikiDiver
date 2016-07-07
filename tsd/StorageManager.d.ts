/**
 * @description Typedefinition of StorageManager
 */
interface StorageManager {
  /**
   * @param {String} localstorageのキーを文字列で指定
   * @description 与えられたキーのデータを取得する(なければ生成).初期化用
   */
    init(storage_key_name: string): void;

    setLimit(obj: any): void;

    /**
     * @return {objectArray} storageの全オブジェクト
     * @description storageに保持する全オブジェクトを返却する
     */
    getAllItem(): objectArray;

    /**
     * @param {String} オブジェクトのキー
     * @return {objectArray} keyに紐づくオブジェクト
     * @description storage内でkeyに一致するオブジェクトを返却する
     */
    getItem(key: string): any;

    /**
     * @param {String} オブジェクトのキー
     * @description storage内でkeyに一致するオブジェクトを削除する
     */
    deleteItem(key: string): void;

    /**
     * @param {stringArray} オブジェクトのキー配列
     * @description storage内でkey配列に一致するオブジェクトを削除する
     */
    deleteItems(keys: stringArray): void;

    /**
     * @description storage内の全てのデータを削除する
     */
    deleteAllItem(): void;

    /**
     * @param {String} オブジェクトのキー
     * @param {any} オブジェクトのデータ
     * @description storageにオブジェクトを1件保存する
     */
    saveItem2Storage(key: string, data: any): void;

    /**
     * @param {String} オブジェクトのキー
     * @param {boolean} 降順とする場合にtrue
     * @return {objectArray} ソート結果の配列
     * @description 与えられたキーによりソートを行う
     */
    sortByKey(key: string, desc: boolean): any;

    /**
     * @return {number} オブジェクト配列の要素数
     * @description オブジェクト配列の要素数を返却する
     */
    getItemLength(): number;
}
