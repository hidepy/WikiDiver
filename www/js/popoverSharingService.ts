{
    'use strict';
    var module: any = angular.module(APP_CONFIGS.NAME);

    module.service("popoverSharingService", function($rootScope){

      this.sharing = {
        id: "",
        title: "",
        caption: "",
        memo: ""
      };

      this.updateSharing = function(){
        $rootScope.$broadcast("updateSharing", this.sharing);
      }

    });


}
