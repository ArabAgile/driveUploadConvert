angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.config', 'ngResource', 'gapi']).run([
  '$ionicPlatform', function($ionicPlatform) {
    return $ionicPlatform.ready = function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    };
  }
]).config([
  '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    }).state('app.home', {
      url: "/home",
      views: {
        'menuContent': {
          templateUrl: "templates/home.html",
          controller: 'HomeCtrl'
        }
      }
    }).state('app.convert', {
      url: "/convert",
      views: {
        'menuContent': {
          templateUrl: "templates/convert.html",
          controller: 'ConvertCtrl'
        }
      }
    }).state('app.convertLocal', {
      url: "/convert-local",
      views: {
        'menuContent': {
          templateUrl: "templates/convert-local.html",
          controller: 'ConvertLocalCtrl'
        }
      }
    }).state('app.upload', {
      url: "/upload",
      views: {
        'menuContent': {
          templateUrl: "templates/upload.html",
          controller: 'UploadCtrl'
        }
      }
    });
    $urlRouterProvider.otherwise('/app/home');
  }
]).config([
  '$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
]);


/*
  .config ['$resourceProvider', ($resourceProvider) ->
    $resourceProvider.defaults.useXDomain = true
    delete $resourceProvider.defaults.headers.common['X-Requested-With']
    return
  ]
 */

angular.module('starter.config', []).value('GoogleApp', {
  apiKey: 'AIzaSyC16izxX7Vo8VY501SKn5CicFbUuFTI4-o',
  clientId: '542713923673-kg80hg153dd4c7vvg42pa2uepggmj14h.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/drive']
});

angular.module('starter.controllers', []).controller('AppCtrl', [
  '$scope', 'GAPI', 'Drive', function($scope, GAPI, Drive) {
    GAPI.init();
  }
]).controller('HomeCtrl', ['$scope', function($scope) {}]).controller('ConvertCtrl', [
  '$scope', '$timeout', 'GAPI', 'Drive', function($scope, $timeout, GAPI, Drive) {
    var Download, printFile, uploadJSONFile, xlsx2json, _parent;
    $scope.convertedJSON = null;
    $scope.openPicker = function() {
      GAPI.createPicker($scope.pickerCallback);
    };
    Download = {
      click: function(node) {
        var ev;
        ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return node.dispatchEvent(ev);
      },
      encode: function(data) {
        return "data:application/octet-stream;base64," + btoa(data);
      },
      link: function(data, name) {
        var a;
        a = document.createElement("a");
        a.download = name || self.location.pathname.slice(self.location.pathname.lastIndexOf("/") + 1);
        a.href = data || self.location.href;
        return a;
      }
    };
    Download.save = function(data, name) {
      this.click(this.link(this.encode(data), name));
    };
    $scope.downloadFile = function(sheet) {
      return Download.save(JSON.stringify(sheet), sheet.name + ".json");
    };
    uploadJSONFile = function(fileData, fileName) {
      var base64Data, boundary, callback, close_delim, contentType, delimiter, metadata, multipartRequestBody, request;
      boundary = '-------314159265358979323846';
      delimiter = "\r\n--" + boundary + "\r\n";
      close_delim = "\r\n--" + boundary + "--";
      contentType = 'application/json';
      metadata = {
        'title': fileName,
        'mimeType': contentType,
        'parents': _parent
      };
      base64Data = btoa(fileData);
      multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
      request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {
          'uploadType': 'multipart'
        },
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
      });
      callback = function() {
        alert('File ' + fileName + ' Uploaded successfully to your Drive!');
      };
      request.execute(callback);
    };
    _parent = [];
    $scope.setFolder = function(sheet) {
      $scope.selectedSheet = sheet;
      GAPI.openFolderPicker($scope.folderCallback);
    };
    $scope.folderCallback = function(data) {
      var doc, url;
      doc = void 0;
      url = void 0;
      url = null;
      $timeout(function() {
        var folder;
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          folder = data[google.picker.Response.DOCUMENTS][0];
          _parent = [
            {
              "id": folder.id
            }
          ];
          $scope.uploadFile($scope.selectedSheet);
          return;
        }
      });
    };
    $scope.uploadFile = function(sheet) {
      return uploadJSONFile(JSON.stringify(sheet), sheet.name + ".json");
    };
    $scope.pickerCallback = function(data) {
      var doc, url;
      doc = void 0;
      url = void 0;
      url = null;
      $timeout(function() {
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          doc = data[google.picker.Response.DOCUMENTS][0];
          printFile(doc.id);
          return;
          url = doc[google.picker.Document.URL];
          $scope.convertedJSON = url;
          return;
        }
      });
    };
    xlsx2json = function(file, callback) {
      var accessToken, oReq, url;
      if (file.downloadUrl) {
        url = file.downloadUrl;
      } else if (file.exportLinks) {
        for (var prop in file.exportLinks) {
          if (file.exportLinks.hasOwnProperty(prop)) {
            // console.log(prop + ' -> ' + file.exportLinks[prop])
            if (prop == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
              url = file.exportLinks[prop]
          }

        };
      } else {
        url = file;
      }
      oReq = new XMLHttpRequest();
      accessToken = gapi.auth.getToken().access_token;
      oReq.open("GET", url, true);
      oReq.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      oReq.responseType = "arraybuffer";
      oReq.onload = function(e) {
        var arr, arraybuffer, bstr, data, sheet_name_list, sheets, workbook;
        arraybuffer = oReq.response;
        data = new Uint8Array(arraybuffer);
        arr = new Array();
        for(i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        bstr = arr.join("");
        workbook = XLSX.read(bstr, {
          type: "binary"
        });
        sheets = [];
        sheet_name_list = workbook.SheetNames;
        sheet_name_list.forEach(function(y) {
          var i, sheet, worksheet;
          worksheet = workbook.Sheets[y];
          sheet = {};
          sheet.name = y;
          sheet.data = [];
          i = 0;
          for (z in worksheet) {
            if(z[0] === '!') continue;

            var idx = z.substring(1);
            var value = worksheet[z].v;

            // New question
            if (parseInt(idx) > i) {
              i++;
              sheet.data[i-1] = {};
            }

            // Question (A)
            if (z[0] == 'A') {
              sheet.data[i-1].question = value;
            }

            // Answer (B)
            else if(z[0] == 'B') {
              sheet.data[i-1].answer = value;
            }

            // Correction (C)
            else if(z[0] == 'C') {
              sheet.data[i-1].correction = value;
            }
            
          };
          sheets.push(sheet);
        });
        $scope.sheets = sheets;
        $scope.$apply();
      };
      oReq.send();
    };
    printFile = function(fileId) {
      return Drive.getFiles(fileId).then(function(file) {
        xlsx2json(file);
      });
    };
  }
]).controller('UploadCtrl', [
  '$scope', 'Drive', 'GAPI', '$timeout', function($scope, Drive, GAPI, $timeout) {
    var uploadFile, _parent;
    uploadFile = function(fileData) {
      var boundary, close_delim, delimiter, reader;
      boundary = '-------314159265358979323846';
      delimiter = "\r\n--" + boundary + "\r\n";
      close_delim = "\r\n--" + boundary + "--";
      reader = new FileReader();
      reader.readAsBinaryString(fileData);
      reader.onload = function(e) {
        var base64Data, callback, contentType, metadata, multipartRequestBody, request;
        contentType = fileData.type || 'application/octet-stream';
        metadata = {
          'title': fileData.name,
          'mimeType': contentType,
          'parents': _parent
        };
        base64Data = btoa(reader.result);
        multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
        request = gapi.client.request({
          'path': '/upload/drive/v2/files',
          'method': 'POST',
          'params': {
            'uploadType': 'multipart'
          },
          'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
          },
          'body': multipartRequestBody
        });
        callback = function() {
          console.log('Uploaded');
        };
        return request.execute(callback);
      };
    };
    $scope.uploadFile = function() {
      var file, files, _i, _len;
      files = document.getElementById('filePicker').files;
      if (files.length <= 0) {
        alert('Please select file(s) to upload');
        return;
      }
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        uploadFile(file);
      }
    };
    _parent = [];
    $scope.setFolder = function() {
      GAPI.openFolderPicker($scope.folderCallback);
    };
    $scope.folderCallback = function(data) {
      var doc, url;
      doc = void 0;
      url = void 0;
      url = null;
      $timeout(function() {
        var folder;
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          folder = data[google.picker.Response.DOCUMENTS][0];
          _parent = [
            {
              "id": folder.id
            }
          ];
          return;
        }
      });
    };
  }
]).controller('ConvertLocalCtrl', [
  '$scope', '$timeout', 'GAPI', 'Drive', function($scope, $timeout, GAPI, Drive) {
    var Download, uploadJSONFile, xlsx2json, _parent;
    $scope.convertFile = function() {
      var file;
      file = document.getElementById('filePicker').files[0];
      if (file != null) {
        xlsx2json(file);
      } else {
        alert('Please select a file to upload');
        return;
      }
    };
    Download = {
      click: function(node) {
        var ev;
        ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return node.dispatchEvent(ev);
      },
      encode: function(data) {
        return "data:application/octet-stream;base64," + btoa(data);
      },
      link: function(data, name) {
        var a;
        a = document.createElement("a");
        a.download = name || self.location.pathname.slice(self.location.pathname.lastIndexOf("/") + 1);
        a.href = data || self.location.href;
        return a;
      }
    };
    Download.save = function(data, name) {
      this.click(this.link(this.encode(data), name));
    };
    $scope.downloadFile = function(sheet) {
      return Download.save(JSON.stringify(sheet), sheet.name + ".json");
    };
    uploadJSONFile = function(fileData, fileName) {
      var base64Data, boundary, callback, close_delim, contentType, delimiter, metadata, multipartRequestBody, request;
      boundary = '-------314159265358979323846';
      delimiter = "\r\n--" + boundary + "\r\n";
      close_delim = "\r\n--" + boundary + "--";
      contentType = 'application/json';
      metadata = {
        'title': fileName,
        'mimeType': contentType,
        'parents': _parent
      };
      base64Data = btoa(fileData);
      multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + contentType + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + base64Data + close_delim;
      request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {
          'uploadType': 'multipart'
        },
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
      });
      callback = function() {
        alert('File ' + fileName + ' Uploaded successfully to your Drive!');
      };
      request.execute(callback);
    };
    _parent = [];
    $scope.setFolder = function(sheet) {
      $scope.selectedSheet = sheet;
      GAPI.openFolderPicker($scope.folderCallback);
    };
    $scope.folderCallback = function(data) {
      var doc, url;
      doc = void 0;
      url = void 0;
      url = null;
      $timeout(function() {
        var folder;
        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
          folder = data[google.picker.Response.DOCUMENTS][0];
          _parent = [
            {
              "id": folder.id
            }
          ];
          $scope.uploadFile($scope.selectedSheet);
          return;
        }
      });
    };
    $scope.uploadFile = function(sheet) {
      return uploadJSONFile(JSON.stringify(sheet), sheet.name + ".json");
    };
    xlsx2json = function(file, callback) {
      var reader;
      reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function(theFile) {
        var sheet_name_list, sheets, workbook;
        workbook = XLSX.read(theFile.target.result, {
          type: "binary"
        });
        sheets = [];
        sheet_name_list = workbook.SheetNames;
        sheet_name_list.forEach(function(y) {
          var i, sheet, worksheet;
          worksheet = workbook.Sheets[y];
          sheet = {};
          sheet.name = y;
          sheet.data = [];
          i = 0;
          for (z in worksheet) {
            if(z[0] === '!') continue;

            var idx = z.substring(1);
            var value = worksheet[z].v;

            // New question
            if (parseInt(idx) > i) {
              i++;
              sheet.data[i-1] = {};
            }

            // Question (A)
            if (z[0] == 'A') {
              sheet.data[i-1].question = value;
            }

            // Answer (B)
            else if(z[0] == 'B') {
              sheet.data[i-1].answer = value;
            }

            // Correction (C)
            else if(z[0] == 'C') {
              sheet.data[i-1].correction = value;
            }
            
          };
          sheets.push(sheet);
        });
        $scope.sheets = sheets;
        $scope.$apply();
      };
    };
  }
]);

angular.module('starter.services', []).factory('LoaderService', [
  '$rootScope', '$ionicLoading', function($rootScope, $ionicLoading) {
    return {
      show: function() {
        var options;
        options = {
          content: '<i class="icon ion-looping"></i>',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 500
        };
        $rootScope.loading = $ionicLoading.show(options);
      },
      hide: function() {
        $ionicLoading.hide();
      }
    };
  }
]).factory('AGHelper', [
  '$ionicPopup', function($ionicPopup) {
    var helper;
    helper = {};
    helper.alert = function(msg) {
      var options;
      options = {
        title: 'Alert',
        template: msg
      };
      $ionicPopup.alert(options);
    };
    return helper;
  }
]);
