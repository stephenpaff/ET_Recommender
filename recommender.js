log = function(msg){
  console.log(msg);
  $("#log").append(msg + "<br />");
}

setupConfig = function(err, launchdata, xAPIWrapper) {
    if (!err) {
      wrapper = ADL.XAPIWrapper = xAPIWrapper;
      log("--- content launched via xAPI Launch ---\n" + wrapper.lrs + "\n" + launchdata);
    } else {
      wrapper = ADL.XAPIWrapper;
      wrapper.changeConfig({

            });
      log("--- content statically configured ---\n" + JSON.stringify(wrapper.lrs));
      var curStudentEmail = "mailto:xhu@memphis.edu";
      log("recommendation: " + JSON.stringify(getRecommendation(curStudentEmail)));
    }
}

getRecommendation = function(curStudentEmail){
  log("getRecommendation start");

  var recommendation = "";

  var curUserData = populateUpdateCurUserData(curStudentEmail);

  if(!!curUserData){
    recommendations = {};
    for(var func in recommendationRules){
      recommendations[func] = recommendationRules[func](curUserData);
    }
    console.log(JSON.stringify(recommendations));
    return recommendationRules.prePostRequisite(curUserData);
  }else{
    log("couldn't get data from LRS");
  }

  log("after main body");

  //TODO: Default recommendation code
}

masteryThreshold = 0.6;

populateUpdateCurUserData = function(curStudentEmail){
  curUserData = {};

  //Items for prePostRequisite
  var lastkcItemScoreAndFringes = getKCitemScoreAndFringes(curStudentEmail);
  if(!!lastkcItemScoreAndFringes){
    var lastkcItem = lastkcItemScoreAndFringes[0];
    var lastkcScore = lastkcItemScoreAndFringes[1];
    var fringeKCs = lastkcItemScoreAndFringes[2];
    //var KCs = fringeKCs[0];
    console.log(JSON.stringify(fringeKCs));
    var innerKCs = fringeKCs[0];
    var outerKCs = fringeKCs[1];
    curUserData["lastkcScore"] = lastkcScore;
    curUserData["innerKCs"] = innerKCs;
    curUserData["outerKCs"] = outerKCs;
  }else{
    curUserData["lastkcScore"] = NULL;
    curUserData["innerKCs"] = NULL;
    curUserData["outerKCs"] = NULL;
  }

  //Update and store calculated attributes

  //Items for repeatingTopics
  //topicScores should be derived data, i.e. mean of KCs associated with topic = topicScore
  curUserData["topicScores"] = {
    "Topic1" : 0.1,
    "Topic2" : 0.2,
    "Topic3" : 0.3,
    "Topic4" : 0.4,
    "Topic5" : 0.5,
    "Topic6" : 0.6,
    "Topic7" : 0.7,
    "Topic8" : 0.8,
    "Topic9" : 0.9,
    "Topic10" : 1.0,
  };

  curUserData["lastTopic"] = "Topic10";

  //Items for focusOnUnderperformingKCs


  return curUserData;
}

recommendationRules = {
    prePostRequisite : function(curUserData){
      if(curUserData.lastkcScore < 0.5){
        var selectedIndex = getRandomNumber(curUserData.innerKCs.length);
        return curUserData.innerKCs[selectedIndex]["Title"]["#text"];
      }else{
        var selectedIndex = getRandomNumber(curUserData.outerKCs.length);
        return curUserData.outerKCs[selectedIndex]["Title"]["#text"];
      }
    },
    repeatingTopics : function(curUserData){
      var recommendations = [];

      for(var topic in curUserData.topicScores){
        if(curUserData.topicScores[topic] < masteryThreshold){
          //find AT DR Question associate with topic, select randomly, apply
          //branching to LR and Items within topic of the day
        }
      }
    },
    focusOnUnderperformingKCs : function(curUserData){
      var recommendations = [];
      var subThresholdKCs = [];

      for(var topic in curUserData.topicScores){
        if(0.39 < curUserData.topicScores[topic] < 0.69){
          var KCs = findKCsForTopic(topic);
          for(var kc in KCs){
            if(kc < masteryThreshold){
              subThresholdKCs.push(kc);
            }
          }
        }
      }
      var chosenKC = subThresholdKCs[getRandomNumber(subThresholdKCs.length)]

      //Assign items from AT Convo w/Knowcalculateledge Check questions or Circuit Reasoning items
    },
    pushingTheEnvelope : function(curUserData){
      var recommendations = [];

      for(var topic in curUserData.topicScores){
        if(curUserData.topicScores[topic] < masteryThreshold){
          //recommend AT DR Convos, Circuit Reasoning items, or Dragoon items
        }else if(curUserData.topicScores[topic] > masteryThreshold){
          //look for whether user has been assigned items from LRs: AT DR Convos, CR Items, or Dragoon items
          //if not then recommend that LR
        }
      }
    },
    motivatedBottomDweller : function(curUserData){
      var recommendations = [];


    },
    unmotivatedBottomDweller : function(curUserData){

    }
}

findKCsForTopic(topic){
  var KCs = [];

  //TODO

  return KCs;
}

getProcessingTimeThresholdFor


getRandomNumber = function(max){
  return Math.floor(Math.random() * max);
}

splitInnerOuterFringe = function(items){
  var innerFringe = [];
  var outerFringe = [];
  for(index in items){
    console.log(items[index]["ContentType"]["#text"]);
    var innerOuter = items[index]["ContentType"]["#text"].toLowerCase();
    switch(innerOuter){
      case "outer fringe":
        outerFringe.push(items[index]);
        break;
      case "inner fringe":
        innerFringe.push(items[index]);
        break;
      default:
        log("error, item was neither inner nor outer, label: " + innerOuter + ", item: " + items[index]);
    }
  }
  return [innerFringe,outerFringe];
};

var getKCitemScoreAndFringes = function(curStudentEmail){
  log("get current KC score");
  try{
    var search = ADL.XAPIWrapper.searchParams();
    search['verb'] = "https://umiis.github.io/ITSProfile/verbs/SaveKCScore";
    search['agent'] = JSON.stringify({"mbox":curStudentEmail,"objectType":"Agent"});
    search['limit'] = 1;
    var ret = ADL.XAPIWrapper.getStatements(search);
    if(ret){
      log(ret);
      var KCitemAndScore = ret['statements'][0]['context']["extensions"]["https://umiis.github.io/ITSProfile/"]["Data"];
      log("KCitemAndScore: " + KCitemAndScore);
      var kcSplit = KCitemAndScore.split(':');
      var kcItem = kcSplit[0];
      var kcScore = kcSplit[1];
      log("kcItem: " + kcItem + ", kcScore: " + kcScore);
      var KCitems = ret['statements'][0]['context']["extensions"]["https://standards.ieee.org/findstds/standard/"]["KSAItems"]["KCitems"]["KCitem"];
      var innerOuterKCs = splitInnerOuterFringe(KCitems);
      return [kcItem,kcScore,innerOuterKCs];
    }
  }catch(e){
    log("error getting KC item and score: " + e);
  }

  return null;
};

//     function setupConfig() {
//     // get LRS credentials from user interface
//     var endpoint = "https://sko.waxlrs.com/TCAPI/";
//     var user = 'X88iLMqfLZs4o9nEDOhi';
//     var password = 'x8z43P0Xoi0oKXC6qSvQ';
//
//     var conf = {
//         "endpoint" : endpoint,
//         "auth" : "Basic " + toBase64(user + ":" + password),
//     };
//     ADL.XAPIWrapper.changeConfig(conf);
// }
var wrapper;
ADL.launch(setupConfig, true);
