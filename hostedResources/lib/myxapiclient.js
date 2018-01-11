log = function(msg){
  console.log(msg);
}

setupConfig = function(err, launchdata, xAPIWrapper) {
    if (!err) {
      wrapper = ADL.XAPIWrapper = xAPIWrapper;
      log("--- content launched via xAPI Launch ---");
    } else {
      wrapper = ADL.XAPIWrapper;
      wrapper.changeConfig({
      });
      log("--- content statically configured ---");
    }
}

sendKCScore = function(learningResource,problemID,kcNames,kcScore){
  var vars = window.location.search.substring(1).split('&');
  var params = {}
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = pair[1];
  }
  var email = "mailto:" + decodeURIComponent(params['user']);
  var fullName = decodeURIComponent(params['fullname']);
  var SKOTitle = learningResource + ":" + problemID;

  allData = {
    "actor" :{
      "mbox" : email,
      "name" : fullName,
      "objectType" : "Agent"
    },
    "verb" : {
      "display": {
        "en-US": "SaveKCScore"
      },
      "id": "https://umiis.github.io/ITSProfile/verbs/SaveKCScore"
    },
    "object": {
      "objectType": "StatementRef",
      "id": "80be9dae-f3c4-45ec-841d-1a5a2dcd4def"
    },
    "context": {
      "extensions": {
        "http://beetle.x-in-y.com/BT": QueryStringToJSON(SKOTitle)
      }
    },
    "result": {
      "response": kcNames,
      "score": {
        "raw": kcScore,
        "max": 1,
        "min": 0,
        "scaled": kcScore
      }
    }
  }

  var ret = wrapper.sendStatement(allData);
}

sendCompleted = function(learningResource,problemID){
  var vars = window.location.search.substring(1).split('&');
  var params = {}
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = pair[1];
  }
  var email = "mailto:" + decodeURIComponent(params['user']);
  var fullName = decodeURIComponent(params['fullname']);
  var SKOTitle = learningResource + ":" + problemID;

  allData = {
    "actor" :{
      "mbox" : email,
      "name" : fullName,
      "objectType" : "Agent"
    },
    "verb" : {
      "display": {
        "en-US": "completed"
      },
      "id": "http://adlnet.gov/expapi/verbs/completed"
    },
    "object": {
      "objectType": "StatementRef",
      "id": "80be9dae-f3c4-45ec-841d-1a5a2dcd4def"
    },
    "context": {
      "extensions": {
        "http://topicSummary.x-in-y.com/TS": QueryStringToJSON(SKOTitle)
      }
    }
  }

  var ret = wrapper.sendStatement(allData);
}

QueryStringToJSON = function(SKOTitle) {
	var pairs = window.location.href.split('?')[1].split('&');

	var result = {};
	pairs.forEach(function(pair) {
		pair = pair.split('=');
		result[pair[0]] = decodeURIComponent(pair[1] || '');
	});
	result.SKOTitle=SKOTitle;
	result.timeStart=timeStart;
	var timeNow=new Date();
	result.timeNow=timeNow;
	result.timeTaken=timeNow.getTime()-timeStart.getTime();
	return JSON.parse(JSON.stringify(result));
}

qs = function(search_for) {
	var query = window.location.search.substring(1);
	var params = query.split('&');
	for (var i = 0; i<params.length; i++) {
		var pos = params[i].indexOf('=');
		if (pos > 0  && search_for == params[i].substring(0,pos)) {
			return params[i].substring(pos+1);
		}
	}
}

var wrapper;
var timeStart = new Date();
ADL.launch(setupConfig, true);
