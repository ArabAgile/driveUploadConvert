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
]);
