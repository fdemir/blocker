
(function(xhr) {
  const COMAR_SIGNS = ["💚", "🟢"]
  const XHR = XMLHttpRequest.prototype;
  const open = XHR.open;
  const send = XHR.send;
  const setRequestHeader = XHR.setRequestHeader;

  String.prototype.includesOne = function(arr) {
    for (var el of arr) {
        if(this.includes(el)) {
          return true
        }
    }
    return false  
  }


  XHR.blockUser = function(userId) {
    let xhr = new XMLHttpRequest()
    xhr.open('POST', "https://api.twitter.com/1.1/blocks/create.json?user_id=" + userId + "&skip_status=true", true);
    xhr.withCredentials = true;
    Object.keys(this._requestHeaders).map((key) => {
        xhr.setRequestHeader(key, this._requestHeaders[key])
    })
    xhr.send()
  }

  XHR.getBlockList = function(users) {
    let list = []
    Object.keys(users).map(function(key, index) {
        if(users[key].name.includesOne(COMAR_SIGNS)) {
            list.push({
                id: users[key].id_str,
                name: users[key].screen_name,
            })
        }
    });
    return list  
  }

  XHR.open = function(method, url) {
      this._method = method;
      this._url = url;
      this._requestHeaders = {};
      this._startTime = (new Date()).toISOString();

      return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function(header, value) {
      this._requestHeaders[header] = value;
      return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function() {

      this.addEventListener('load', function() {
          let myUrl = this._url ? this._url.toLowerCase() : this._url;
          let apiEndpoints = ["https://api.twitter.com/2/timeline/conversation", "https://api.twitter.com/2/timeline/home"]
          if(myUrl.includesOne(apiEndpoints)) {
            const tweet = JSON.parse(this.responseText)
            const comarList = this.getBlockList(tweet.globalObjects.users)
            if(comarList.length > 0) {
                comarList.map((comar) => {
                    this.blockUser(comar.id)
                    console.log("Block: " + comar.name)
                })
            }
          }
      });

      return send.apply(this, arguments);
  };
  

})(XMLHttpRequest);