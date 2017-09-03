var xhr = new XMLHttpRequest()

var user = {
  'acc_string': '&account_id=',
  'acc_id': '',
  'access_token': '',
  'who': '/ping/whoami?',
  'getAccount': '/accounts?',
  'getBalance': '/balance?',
  'getBasicTrans': '/transactions?',
  'getAdvTrans': '/transactions?expand[]=merchant',
  getData: function(){
    monzoapi.makeCall(this.getAdvTrans);
  }
}

var monzoapi = {
  'api_url': 'https://api.monzo.com',
  makeCall: function(type){
    const endpoint = this.api_url + type + user.acc_string + user.acc_id;
    xhr.open("GET", endpoint, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + user.access_token);
    xhr.send();
    xhr.onpgrogess = type;
  }
}

xhr.onload = function (e) {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
        console.log('Data fetched');
        //parse and load data from api
        let data = JSON.parse(xhr.responseText);
        gotData(data);
        animationType = 'api';
    }
    else {
        //if error - parse sample data and load
        console.log('Error;', xhr.responseText);
        loadJSON('data/sample-data.json', gotData);
        animationType = 'sample';
    }
    //start engine and draw
    drawing = true;
    startEngineAndSetup();
    //disable button
    let btn = select('#btnsubmit');
    btn.attribute("disabled", "disabled");
  }
};