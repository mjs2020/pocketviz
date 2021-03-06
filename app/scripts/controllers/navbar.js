define(['angular', 'jquery', 'bootstrap', 'text!../../views/about.html', 'text!../../views/credits.html', 'text!../../views/privacy.html'], function (angular, $, _bootstrap, aboutTxt, creditsTxt, privacyTxt) {
  'use strict';

  /**
   * @ngdoc function
   * @name ReadFlowsApp.controller:NavbarCtrl
   * @description
   * # NavbarCtrl
   * Controller of the ReadFlowsApp
   */
  angular.module('ReadFlowsApp.controllers.NavbarCtrl', [])
  .controller('NavbarCtrl', function ($scope, Pocketdata) {

    $('#navbarModal').modal({
      keyboard: false,
      show: false
    });

    $scope.openModal = function (modal) {
      $scope.modalTitle = modal;
      switch(modal) {
        case 'about':
          $scope.modalBody = aboutTxt;
          break;
        case 'credits':
          $scope.modalBody = creditsTxt;
          break;
        case 'privacy':
          $scope.modalBody = privacyTxt;
          break;
      }
      $('#navbarModal').modal('show')
    };

    $scope.clearData = function () {
      $scope.modalTitle = 'Clear local data'
      $('#navbarModal').modal('show')
      $scope.modalBody = 'Clearing your locally stored data...'
      Pocketdata.clearDB(function () {
        $scope.modalBody = 'Clearing your locally stored data... Done!'
        $scope.$apply();
      });
    }

  });
});
