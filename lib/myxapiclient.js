log = function(msg){
  console.log(msg);
}

setupConfig = function(err, launchdata, xAPIWrapper) {
    if (!err) {
      wrapper = ADL.XAPIWrapper = xAPIWrapper;
      log("--- content launched via xAPI Launch ---");
    } else {
      wrapper = ADL.XAPIWrapper;
      setRegAPIConfig();
      log("--- content statically configured ---");
    }
    if(window.cb){
      window.cb();
    }
}

sendKCScore = function(learningResource,problemID,kcNamesAndScores){
  var vars = window.location.search.substring(1).split('&');
  var params = {}
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = pair[1];
  }
  var email = "mailto:" + decodeURIComponent(params['user']);
  var fullName = decodeURIComponent(params['fullname']);
  var SKOTitle = learningResource + ":" + problemID;

  for(var kcName in kcNamesAndScores){
    var kcScore = kcNamesAndScores[kcName];
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
          "http://autotutor&46;x-in-y&46;com/AT": QueryStringToJSON(SKOTitle)
        }
      },
      "result": {
        "response": kcName,
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
        "http://autotutor&46;x-in-y&46;com/AT": QueryStringToJSON(SKOTitle)
      }
    }
  }

  var ret = wrapper.sendStatement(allData);
}

sendTopicAssignment = function(studentEmails,topic){
  console.log("topic: " + topic + ", studentEmails: " + JSON.stringify(studentEmails));
  setRegAPIConfig();
  var vars = window.location.search.substring(1).split('&');
  var params = {}
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    params[pair[0]] = pair[1];
  }
  var email = "mailto:" + decodeURIComponent(params['user']);
  var fullName = decodeURIComponent(params['fullname']);
  var statements = [];

  for(var index in studentEmails){
    var studentEmail = "mailto:" + studentEmails[index];
    allData = {
      "actor" :{
        "mbox" : email,
        "name" : fullName,
        "objectType" : "Agent"
      },
      "verb" : {
        "display": {
          "en-US": "assigned"
        },
        "id": "http://activitystrea.ms/schema/1.0/assign"
      },
      "object": {
        "objectType": "StatementRef",
        "id": "80be9dae-f3c4-45ec-841d-1a5a2dcd4def"
      },
      "context": {
        "extensions": {
          "http://autotutor&46;x-in-y&46;com/AT" : {
            "target": {
              "mbox": studentEmail,
            },
            "topic": topic
          }

        }
      }
    }
    statements.push(allData);
  }
  console.log("statements: " + JSON.stringify(statements));
  var ret = wrapper.sendStatements(statements);
  window.ret = ret;
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

getRandomArrayValue = function(arr){
  return arr[getRandomNumber(arr.length)];
}

getRandomNumber = function(max){
  return Math.floor(Math.random() * max);
}

toTitleCase = function(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}

getMappingsAndDifficulties = function(){
  log("getMappingsAndDifficulties");
  try{
    setRegAPIConfig();
    var search = ADL.XAPIWrapper.searchParams();
    search['verb'] = "https://umiis.github.io/ITSProfile/System/Store_Data";
    search['agent'] = JSON.stringify({"mbox":"mailto:data@electronixtutor.com","objectType":"Agent"});
    search['limit'] = 1;
    var ret = ADL.XAPIWrapper.getStatements(search);
    if(ret){
      var mappingsAndDifficulties = ret['statements'][0]['context']["extensions"]["https://umiis.github.io/ITSProfile/System/Data"];
      log("mappingsAndDifficulties: " + JSON.stringify(mappingsAndDifficulties));
      return mappingsAndDifficulties;
    }
  }catch(e){
    log("error getting mappings and difficulties: " + e);
  }
}


getItemFromTopicLRTypeWithZPDAlgorithm = function(topicLRType, curUserData,mappingsAndDifficulties, recommendationsArr){
  //Handle no items for topic summary
  if(topicLRType.indexOf(TS.toLowerCase()) != -1){
    recommendationsArr.push(topicLRType + ",");
  }else{
    log("getItemFromTopicLRTypeWithZPDAlgorithm");
    var items = mappingsAndDifficulties["mappings"]["topicLRTypeToItems"][topicLRType];
    log("topicLRType: " + topicLRType + ", items: " + JSON.stringify(items));
    var items = getItemsViaZPDAlgorithm(1,items,curUserData,mappingsAndDifficulties);
    for(var index in items){
      recommendationsArr.push(items[index]);
    }
  }
}

//Returns "topic,LRType,item" - comma separated string
getItemsViaZPDAlgorithm = function(numItemsToGet,items,curUserData,mappingsAndDifficulties){
  log("getItemsViaZPDAlgorithm");
  var itemScores = calcScoresForZPDAlgorithm(items,curUserData,mappingsAndDifficulties);
  log("itemScores: " + JSON.stringify(itemScores));
  var itemsToTopicLRType = mappingsAndDifficulties['mappings']['itemsToTopicLRType'];
  var itemsSorted = Object.keys(itemScores).map(function(key) {
      return [key, itemScores[key]];
  });

  itemsSorted.sort(function(first, second) {
      return first[1] - second[1];
  });

  itemsSorted = itemsSorted.slice(0, numItemsToGet);

  var items = [];
  for(var index in itemsSorted){
    var item = itemsSorted[index][0];
    var topicLRType = itemsToTopicLRType[item];
    items.push(topicLRType + "," + item);
  }

  log("items: " + JSON.stringify(items));
  return items;
}

calcScoresForZPDAlgorithm = function(items, curUserData,mappingsAndDifficulties){
  log("calcScoresForZPDAlgorithm");
  var itemDifficulties = mappingsAndDifficulties["difficulties"]["itemDifficulties"];
  var kcDifficulties = mappingsAndDifficulties["difficulties"]["kcDifficulties"];
  var itemsToKCs = mappingsAndDifficulties["mappings"]["itemsToKCs"];

  var itemScores = {};

  for(var index in items){
    var item = items[index];
    log("item: " + item);
    var kcsForItem = itemsToKCs[item];
    log("kcsForItem: " + JSON.stringify(kcsForItem));
    var avgKCScore = 0;
    var numKCs = 0;
    for(kc in kcsForItem){
      if(!!curUserData.kcScores[kc]){
        avgKCScore += curUserData.kcScores[kc];
        numKCs += 1;
      }
    }
    //Handle case where user hasn't encountered any of the kcs for the item in question
    if(numKCs != 0){
      avgKCScore = avgKCScore / numKCs;
    }
    var projectedPerformanceScore = avgKCScore;
    var itemDifficulty = itemDifficulties[item];
    var value = Math.pow(projectedPerformanceScore - itemDifficulty,2);
    itemScores[item] = value;
    log("projectedPerformanceScore: " + projectedPerformanceScore);
    log("itemDifficulty: " + itemDifficulty);
    log("value: " + value);
  }

  return itemScores;
}

getKCScores = function(curStudentEmail){
  try{
    setAggAPIConfig();
    var search = ADL.XAPIWrapper.searchParamsAgg();

    search['pipeline'] = JSON.stringify([
      {
        "$match":
          {"$and": [
            {"statement.verb.id":"https://umiis.github.io/ITSProfile/verbs/SaveKCScore"},
            {"statement.actor.mbox" : curStudentEmail}
          ]}
      },
      {
        "$project": {
          "kc":"$statement.result.response",
          "score":"$statement.result.score.scaled",
        }
      },
      {
        "$group":{
          "_id" : "$kc",
          "avg" : { "$avg" : "$score"}
        }
      }
    ]);

    var ret = ADL.XAPIWrapper.getStatementsAgg(search);
    if(ret){
      var kcScores = {};
      for(var index in ret){
        var name = ret[index]["_id"];
        var score = ret[index]["avg"];
        kcScores[name] = score;
      }
      log("kcScores: " + JSON.stringify(kcScores));
      return kcScores;
    }
  }catch(e){
    log("error getting records: " + e);
  }
}

var setAggAPIConfig = function(){
  wrapper.changeConfig({
    endpoint: "https://tokyo.x-in-y.com/api/",
    user: '7de555f2a64d85addeb9483a0d4e55af2ba1c447',
    password: '458fc929552d774648a25b2acfc5e15347e77bb8'
  });
}

var setRegAPIConfig = function(){
  wrapper.changeConfig({
    endpoint: "https://tokyo.x-in-y.com/data/xAPI/",
    user: '7de555f2a64d85addeb9483a0d4e55af2ba1c447',
    password: '458fc929552d774648a25b2acfc5e15347e77bb8'
  });
}

var wrapper;
var timeStart = new Date();
ADL.launch(setupConfig, true);
