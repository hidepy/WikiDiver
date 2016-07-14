{
    'use strict';
    var module = angular.module(APP_CONFIGS.NAME);
    module.service("popoverSharingService", function ($rootScope) {
        this.sharing = {
            id: "",
            title: "",
            caption: "",
            memo: "",
            is_global: false
        };
        this.updateSharing = function () {
            $rootScope.$broadcast("updateSharing", this.sharing);
        };
    });
}
