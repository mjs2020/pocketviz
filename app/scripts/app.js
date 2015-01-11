/*jshint unused: vars */
define(['angular', 'jquery', 'bootstrap', 'controllers/navbar', 'controllers/main', 'controllers/login', 'controllers/viz', 'controllers/stats', 'controllers/demo', 'services/pocketdata']/*deps*/, function (angular, $, bootstrap, NavbarCtrl, MainCtrl, LoginCtrl, VizCtrl, StatsCtrl, DemoCtrl, PocketdataService)/*invoke*/ {
  'use strict';

  // General setup for app
  window.DEBUG = true;              // Change to false to avoid console logging.

  // Setup UI
  $('.mytooltip').tooltip()

  /**
   * @ngdoc overview
   * @name ReadFlowsApp
   * @description
   * # ReadFlowsApp
   *
   * Main module of the application.
   */
  return angular
  .module('ReadFlowsApp', [
    'ReadFlowsApp.controllers.MainCtrl',
    'ReadFlowsApp.controllers.NavbarCtrl',
    'ReadFlowsApp.controllers.LoginCtrl',
    'ReadFlowsApp.controllers.VizCtrl',
    'ReadFlowsApp.controllers.StatsCtrl',
    'ReadFlowsApp.controllers.DemoCtrl',
    'ReadFlowsApp.services.Pocketdata',
    /*angJSDeps*/
    'ngCookies',
    'ngAria',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'ngTouch',
    'pouchdb'
  ])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'scripts/views/main.html',
      controller: 'MainCtrl'
    })
    .when('/login', {
      templateUrl: 'scripts/views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/viz', {
      templateUrl: 'scripts/views/viz.html',
      controller: 'VizCtrl'
    })
    .when('/stats', {
      templateUrl: 'scripts/views/stats.html',
      controller: 'StatsCtrl'
    })
    .when('/demo', {
      templateUrl: 'scripts/views/demo.html',
      controller: 'DemoCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  });
});
