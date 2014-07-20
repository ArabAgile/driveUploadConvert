angular.module('starter.controllers', []).controller('AppCtrl', [
  '$scope', 'GAPI', 'Drive', function($scope, GAPI, Drive) {
    GAPI.init();
  }
]).controller('HomeCtrl', ['$scope', function($scope) {}]).controller('ConvertCtrl', [
  '$scope', '$timeout', 'GAPI', 'Drive', function($scope, $timeout, GAPI, Drive) {
    var Download, printFile, xlsx2json;
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
          var count, sheet, worksheet;
          worksheet = workbook.Sheets[y];
          sheet = {};
          sheet.name = y;
          sheet.data = [];
          count = 1;
          for (z in worksheet) {
            if(z[0] === '!' || z == 'A1' || z == 'B1') continue;

            if (count > 2)
              count = 1

            // Question
            if (count == 1) {
              var q = {};
              q.question = worksheet[z].v;
            }

            // Answer
            else {
              q.answer = worksheet[z].v;
              sheet.data.push(q);
              q = null;
            }

            count++
            
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
  '$scope', 'Drive', function($scope, Drive) {
    var uploadFile;
    uploadFile = function(fileData, callback) {
      var boundary, close_delim, delimiter, reader;
      boundary = '-------314159265358979323846';
      delimiter = "\r\n--" + boundary + "\r\n";
      close_delim = "\r\n--" + boundary + "--";
      reader = new FileReader();
      reader.readAsBinaryString(fileData);
      reader.onload = function(e) {
        var base64Data, contentType, metadata, multipartRequestBody, request;
        contentType = fileData.type || 'application/octet-stream';
        metadata = {
          'title': fileData.name,
          'mimeType': contentType
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
        if (!callback) {
          callback = function(file) {
            return alert('File uploaded successfully ');
          };
        }
        request.execute(callback);
      };
    };
    $scope.uploadFile = function() {
      var file;
      file = document.getElementById('filePicker').files[0];
      uploadFile(file);
    };
  }
]);
