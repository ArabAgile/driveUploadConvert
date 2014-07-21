angular.module 'starter.controllers', []

  .controller 'AppCtrl', ['$scope', 'GAPI', 'Drive', ($scope, GAPI, Drive) ->

    GAPI.init();
    return
  ]

  .controller 'HomeCtrl', ['$scope', ($scope) ->
    return
  ]

  .controller 'ConvertCtrl', ['$scope', '$timeout', 'GAPI', 'Drive', ($scope, $timeout, GAPI, Drive) ->

    $scope.convertedJSON = null
    $scope.openPicker = ->
      GAPI.createPicker($scope.pickerCallback)
      return

    Download =
      click: (node) ->
        ev = document.createEvent("MouseEvents")
        ev.initMouseEvent "click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null
        node.dispatchEvent ev

      encode: (data) ->
        "data:application/octet-stream;base64," + btoa(data)

      link: (data, name) ->
        a = document.createElement("a")
        a.download = name or self.location.pathname.slice(self.location.pathname.lastIndexOf("/") + 1)
        a.href = data or self.location.href
        a

    Download.save = (data, name) ->
      @click @link(@encode(data), name)
      return


    $scope.downloadFile = (sheet) ->
      Download.save JSON.stringify(sheet), sheet.name + ".json"

    $scope.pickerCallback = (data) ->
      doc = undefined
      url = undefined
      url = null
      $timeout ->
        if data[google.picker.Response.ACTION] is google.picker.Action.PICKED
          doc = data[google.picker.Response.DOCUMENTS][0]
          # console.log doc
          printFile doc.id
          return

          url = doc[google.picker.Document.URL]
          $scope.convertedJSON = url
          return
        return

      return



    # Convert xlsx to json
    xlsx2json = (file, callback) ->
      if file.downloadUrl
        url = file.downloadUrl
      else
        url = file

      oReq = new XMLHttpRequest()
      accessToken = gapi.auth.getToken().access_token

      oReq.open "GET", url, true
      oReq.setRequestHeader 'Authorization', 'Bearer ' + accessToken
      oReq.responseType = "arraybuffer"

      oReq.onload = (e) ->
        arraybuffer = oReq.response

        # convert data to binary string
        data = new Uint8Array arraybuffer
        arr = new Array()

        `for(i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i])`
        bstr = arr.join("")

        # Call XLSX
        workbook = XLSX.read bstr, {type:"binary"}

        sheets = []

        sheet_name_list = workbook.SheetNames
        sheet_name_list.forEach (y) ->
          worksheet = workbook.Sheets[y]

          sheet = {}
          sheet.name = y
          sheet.data = []

          count = 1
          `for (z in worksheet) {
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
            
          }`

          sheets.push sheet
          return
        $scope.sheets = sheets
        $scope.$apply()
        return

      oReq.send()
      return


    # Print a files metadata
    printFile = (fileId) ->
      Drive.getFiles fileId
        .then (file) ->
          xlsx2json file
          return

    return
  ]



  .controller 'UploadCtrl', ['$scope', 'Drive', 'GAPI', '$timeout', ($scope, Drive, GAPI, $timeout) ->

    uploadFile = (fileData) ->
      boundary = '-------314159265358979323846'
      delimiter = "\r\n--" + boundary + "\r\n"
      close_delim = "\r\n--" + boundary + "--"

      reader = new FileReader()
      reader.readAsBinaryString fileData
      reader.onload = (e) ->
        contentType = fileData.type || 'application/octet-stream'
        metadata = {
          'title': fileData.name
          'mimeType': contentType
          'parents': _parent
        }

        base64Data = btoa reader.result
        multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim

        request = gapi.client.request {
          'path': '/upload/drive/v2/files'
          'method': 'POST'
          'params': {'uploadType': 'multipart'}
          'headers': {
            'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
          }
          'body': multipartRequestBody
        }

        callback = -> 
          console.log 'Uploaded'
          return
        
        request.execute callback
      return

    $scope.uploadFile = ->
      files = document.getElementById('filePicker').files
      if files.length <= 0
        alert 'Please select file(s) to upload'
        return

      for file in files
        uploadFile file

      return

    _parent = [];

    $scope.setFolder = ->
      GAPI.openFolderPicker($scope.folderCallback)
      return

    $scope.folderCallback = (data) ->
      doc = undefined
      url = undefined
      url = null
      $timeout ->
        if data[google.picker.Response.ACTION] is google.picker.Action.PICKED
          folder = data[google.picker.Response.DOCUMENTS][0]
          _parent = [{"id": folder.id}]
          return

        return

      return

    return
  ]


