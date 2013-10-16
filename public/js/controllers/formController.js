var controllers = require('../app.js').controllers;

controllers.controller('FormController', ['$scope', '$http', '$modal', '$q', 'tagsFactory', 'searchFactory', 'loginFactory', '$timeout', function($scope, $http, $modal, $q, tagsFactory, searchFactory, loginFactory, $timeout) {
  var urlRegEx = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;

  $scope.doneLoading = true;
  $scope.types = {
    'Tutorial': {
      name: 'Tutorial',
      chosen: false
    },
    'Op/Ed': {
      name: 'Op/Ed',
      chosen: false
    },
    'Reference': {
      name: 'Reference',
      chosen: false
    },
    'Intro': {
      name: 'Intro',
      chosen: false
    }
  };
  $scope.item = { tags : {}, categories: {} , yourTags: {}};
  $scope.typeaheadObj = {};
  $scope.suggestedData = {};

  $scope.currentUser = loginFactory.getLoggedInUser();
  $scope.hasLink = false;
  $scope.noTagsOnSubmit = false;



  //SHOULD CHANGE SCOPE.CATEGORIES THING TO TYPES ON THE SERVER SIDE TOO!!!

  $scope.send = function(){
    //Tag Validity Checks
    if (!Object.keys($scope.item.tags).length) {
      $scope.noTagsOnSubmit = true;
      console.log('tag check is happening');
      return;
    }
    //URL Validity Check
    if (!urlRegEx.test($scope.item.link)) {
      $scope.suggestedData.title = 'Snap! That link came back with nothing. How about pasting it in?';
      return;
    }
    for (var category in $scope.types) {
      var categoryObj = $scope.types[category];
      if(categoryObj.chosen) {
        $scope.item.categories[categoryObj.name] = categoryObj.name;
      }
    }

    // $scope.item.title = $('#title-input').val();

    $http.post('/_/items', $scope.item).success(function() {
    });
    $scope.hideAndClearLinkForm();
  };
  $scope.addTag = function(tag){
    if (!(tag in $scope.typeaheadObj)) {
      return;
    }
    var allTags = tag.split(',');
    for (var i = 0; i < allTags.length; i++) {
      var trimmed = allTags[i].trim();
      $scope.item.tags[trimmed] = trimmed;
      $scope.item.yourTags[trimmed] = trimmed;
      $scope.$apply();
    }
  };
  $scope.toggleTag = function(tag, suggested){
    if ($scope.item.tags[tag] === tag) {
      delete $scope.item.tags[tag];
    }else {
      $scope.item.tags[tag] = tag;
      $scope.noTagsOnSubmit = false;
    }
  };

  $scope.toggleClass = function(thing, type) {
    if (type === 'type') {
      return thing.chosen ? 'selected' : '';
    }else {
      return thing in $scope.item.tags ? 'selected' : '';
    }
  };

  $scope.getSearchResults = function() {
    searchFactory.searchDatabase($scope.searchValue);
  };

  $scope.toggleType = function(type) {
    if (type.chosen) {
      type.chosen = false;
    }else {
      type.chosen = true;
    }
  };

  $scope.hideAndClearLinkForm = function() {
    //TODO: Make this hide and clear data from link-form;
  };

  $scope.getSuggestedData = function(link) {
    var urlRegEx = /^(http(?:s)?\:\/\/[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,6}(?:\/?|(?:\/[\w\-]+)*)(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
    var deferred = $q.defer();

    //If entered data doesn't match the URL regex, then return error data, and don't actually make the AJAX request.
    if (!urlRegEx.test(link)) {
      deferred.resolve({title: "Snap! That link came back with nothing. How about pasting it in?", tags: []});
      $scope.suggestedData = deferred.promise;
      return;
    }
    $scope.doneLoading = false;

    $http.post('/_/preview', {url: link}).success(function(data) {
      deferred.resolve(data);
    });
    $scope.suggestedData = deferred.promise;
    deferred.promise.then(function() {
      $scope.doneLoading = true;
    });
  };

  // Autocomplete for adding tags
  $scope.typeahead = tagsFactory.getSuggestedTags();

  $scope.typeaheadFn = function() {
    return $.map($scope.typeahead, function(tag) {
      $scope.typeaheadObj[tag.name] = tag.name;
      return tag.name;
    });
  };

  // Autocomplete for the search
  $http.get('/_/tags').success(function(data){
    $scope.typeaheadSearch = data;
  });

  $scope.typeaheadSearchFn = function() {
    return $.map($scope.typeaheadSearch, function(tag) {
      return tag.name;
    });
  };
}]);