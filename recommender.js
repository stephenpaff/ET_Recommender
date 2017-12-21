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

  var mappingsAndDifficulties = getMappingsAndDifficulties();

  if(!!curUserData){
    recommendations = {};
    for(var func in recommendationRules){
      recommendations[func] = recommendationRules[func](curUserData,mappingsAndDifficulties);
    }
    console.log(JSON.stringify(recommendations));
    return null;//recommendationRules.prePostRequisite(curUserData);
  }else{
    log("couldn't get data from LRS");
  }

  log("after main body");

  //TODO: Default recommendation code
}

masteryThreshold = 0.6;

populateUpdateCurUserData = function(curStudentEmail){
  curUserData = {};

  //Update and store calculated attributes

  //Items for repeatingTopics
  //topicScores should be derived data, i.e. mean of KCs associated with topic = topicScore
  curUserData["topicScores"] = {
    'series/parallel combination' : 0.3,
    'ce amplifier' : 0.3,
    'series & parallel circuit' : 0.3,
    'pn junction' : 0.3,
    'transistor' : 0.3,
    'rectifier' : 0.3,
    'power supply' : 0.3,
    'zener diode & regulator' : 0.6,
    'multistage amplifier' : 0.6,
    'diode limiter & clamper' : 0.6,
    'filter' : 0.6,
    'cb amplifier' : 0.6,
    'cc amplifier' : 0.6,
    "ohm's law & kirchhoff’s law" : 0.6,
    'pushpull amplifier' : 0.6
  };

  curUserData["kcScores"] = {
    'zener_diode_physics' : 0.1,
    'cb_transistor_amplifier_ac_behavior' : 0.2,
    'ce_transistor_behavior' : 0.3,
    'cb_transistor_amplifier_function' : 0.2,
    'resistor_series_behavior' : 0.2,
    'ce_transistor_fixed_bias_behavior' : 0.2,
    'resistance_structure' : 0.2,
    'resistor_capacitor_in_series_behavior' : 0.2,
    'inductor_behavior' : 0.2,
    'in_parallel_and_series_structure' : 0.2,
    'generator_behavior' : 0.6,
    'power_supply_function' : 0.8,
    'ohms_law_voltage' : 1.0
  }

  //max score for LR and topic combo
  curUserData["topicLRTypeScores"] = {
    'series/parallel combination,autotutor deep reasoning conversations' : 0.3,
    'ce amplifier,autotutor deep reasoning conversations' : 0.3,
    'series & parallel circuit,autotutor deep reasoning conversations' : 0.3,
    'pn junction,autotutor deep reasoning conversations' : 0.3,
    'transistor,autotutor deep reasoning conversations' : 0.3,
    'rectifier,autotutor deep reasoning conversations' : 0.3,
    'power supply,autotutor deep reasoning conversations' : 0.3,
    'zener diode & regulator,autotutor deep reasoning conversations' : 0.6,
    'multistage amplifier,autotutor deep reasoning conversations' : 0.6,
    'diode limiter & clamper,autotutor deep reasoning conversations' : 0.6,
    'filter,autotutor deep reasoning conversations' : 0.6,
    'cb amplifier,autotutor deep reasoning conversations' : 0.6,
    'cc amplifier,autotutor deep reasoning conversations' : 0.6,
    "ohm's law & kirchhoff’s law,autotutor deep reasoning conversations" : 0.6,
    'pushpull amplifier,autotutor deep reasoning conversations' : 0.6,
    'series/parallel combination,circuit basics' : 0.3,
    'ce amplifier,circuit basics' : 0.3,
    'series & parallel circuit,circuit basics' : 0.3,
    'pn junction,circuit basics' : 0.3,
    'transistor,circuit basics' : 0.3,
    'rectifier,circuit basics' : 0.3,
    'power supply,circuit basics' : 0.3,
    'zener diode & regulator,circuit basics' : 0.6,
    'multistage amplifier,circuit basics' : 0.6,
    'diode limiter & clamper,circuit basics' : 0.6,
    'filter,circuit basics' : 0.6,
    'cb amplifier,circuit basics' : 0.6,
    'cc amplifier,circuit basics' : 0.6,
    "ohm's law & kirchhoff’s law,circuit basics" : 0.6,
    'pushpull amplifier,circuit basics' : 0.6,
    'series/parallel combination,circuit reasoning' : 0.3,
    'ce amplifier,circuit reasoning' : 0.3,
    'series & parallel circuit,circuit reasoning' : 0.3,
    'pn junction,circuit reasoning' : 0.3,
    'transistor,circuit reasoning' : 0.3,
    'rectifier,circuit reasoning' : 0.3,
    'power supply,circuit reasoning' : 0.3,
    'zener diode & regulator,circuit reasoning' : 0.6,
    'multistage amplifier,circuit reasoning' : 0.6,
    'diode limiter & clamper,circuit reasoning' : 0.6,
    'filter,circuit reasoning' : 0.6,
    'cb amplifier,circuit reasoning' : 0.6,
    'cc amplifier,circuit reasoning' : 0.6,
    "ohm's law & kirchhoff’s law,circuit reasoning" : 0.6,
    'pushpull amplifier,circuit reasoning' : 0.6,
    'series/parallel combination,autotutor knowledge check conversations' : 0.3,
    'ce amplifier,autotutor knowledge check conversations' : 0.3,
    'series & parallel circuit,autotutor knowledge check conversations' : 0.3,
    'pn junction,autotutor knowledge check conversations' : 0.3,
    'transistor,autotutor knowledge check conversations' : 0.3,
    'rectifier,autotutor knowledge check conversations' : 0.3,
    'power supply,autotutor knowledge check conversations' : 0.3,
    'zener diode & regulator,autotutor knowledge check conversations' : 0.6,
    'multistage amplifier,autotutor knowledge check conversations' : 0.6,
    'diode limiter & clamper,autotutor knowledge check conversations' : 0.6,
    'filter,autotutor knowledge check conversations' : 0.6,
    'cb amplifier,autotutor knowledge check conversations' : 0.6,
    'cc amplifier,autotutor knowledge check conversations' : 0.6,
    "ohm's law & kirchhoff’s law,autotutor knowledge check conversations" : 0.6,
    'pushpull amplifier,autotutor knowledge check conversations' : 0.6,
    'series/parallel combination,dragoon modeling' : 0.3,
    'ce amplifier,dragoon modeling' : 0.3,
    'series & parallel circuit,dragoon modeling' : 0.3,
    'pn junction,dragoon modeling' : 0.3,
    'transistor,dragoon modeling' : 0.3,
    'rectifier,dragoon modeling' : 0.3,
    'power supply,dragoon modeling' : 0.3,
    'zener diode & regulator,dragoon modeling' : 0.6,
    'multistage amplifier,dragoon modeling' : 0.6,
    'diode limiter & clamper,dragoon modeling' : 0.6,
    'filter,dragoon modeling' : 0.6,
    'cb amplifier,dragoon modeling' : 0.6,
    'cc amplifier,dragoon modeling' : 0.6,
    "ohm's law & kirchhoff’s law,dragoon modeling" : 0.6,
    'pushpull amplifier,dragoon modeling' : 0.6,
    'series/parallel combination,electronic laws' : 0.3,
    'ce amplifier,electronic laws' : 0.3,
    'series & parallel circuit,electronic laws' : 0.3,
    'pn junction,electronic laws' : 0.3,
    'transistor,electronic laws' : 0.3,
    'rectifier,electronic laws' : 0.3,
    'power supply,electronic laws' : 0.3,
    'zener diode & regulator,electronic laws' : 0.6,
    'multistage amplifier,electronic laws' : 0.6,
    'diode limiter & clamper,electronic laws' : 0.6,
    'filter,electronic laws' : 0.6,
    'cb amplifier,electronic laws' : 0.6,
    'cc amplifier,electronic laws' : 0.6,
    "ohm's law & kirchhoff’s law,electronic laws" : 0.6,
    'pushpull amplifier,electronic laws' : 0.6,
  }

  curUserData["lastTopic"] = "filter";

  return curUserData;
}

//Variables to hold the specific strings associated with various LR Types in the data
var ATDRC = "autotutor deep reasoning conversations";
var CB = "circuit basics";
var CR = "circuit reasoning";
var ATKCC = "autotutor knowledge check conversations";
var DRAGOON = "dragoon modeling";
var EL = "electronic laws";

recommendationRules = {
    repeatingTopics : function(curUserData,mappingsAndDifficulties){
      log("repeatingTopics");
      var recommendations = [];

      for(var topic in curUserData.topicScores){
        if(curUserData.topicScores[topic] < masteryThreshold){
          //find AT DR Question associate with topic, select randomly, apply
          //branching to LR and Items within topic of the day
          topicLRType = topic + "," + ATDRC;
          getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);
        }
      }

      return recommendations;
    },
    focusOnUnderperformingKCs : function(curUserData,mappingsAndDifficulties){
      log("focusOnUnderperformingKCs");
      var recommendations = [];
      var subThresholdKCsAndTopics = [];

      for(var topic in curUserData.topicScores){
        if(0.39 < curUserData.topicScores[topic] < 0.69){
          topicsToKCs = mappingsAndDifficulties["mappings"]["topicsToKCs"];
          log("topic: " + topic);
          var KCs = topicsToKCs[topic];
          for(index in KCs){
            var kc = KCs[index];
            if(curUserData.kcScores[kc] < masteryThreshold){
              log("subThresholdKC: " + kc);
              subThresholdKCsAndTopics.push([kc,topic]);
            }
          }
        }
      }
      if(subThresholdKCsAndTopics.length > 0){
        log("subThresholdKCsAndTopics: " + JSON.stringify(subThresholdKCsAndTopics));
        var kcAndTopic = getRandomArrayValue(subThresholdKCsAndTopics);
        var chosenKC = kcAndTopic[0];
        var topic = kcAndTopic[1];

        var mapping = mappingsAndDifficulties["mappings"]["topicLRTypeKCToItems"];

        //Assign items from AT Convo w/Knowledge Check questions or Circuit Reasoning items
        var itemsToChooseFrom = [];
        var index = topic + "," + ATKCC + "," + chosenKC;
        for(item in mapping[index]){
          var recommendation = topic + "," + ATKCC + "," + mapping[index][item];
          itemsToChooseFrom.push(recommendation);
        }
        index = topic + "," + CR + "," + chosenKC;
        for(item in mapping[index]){
          var recommendation = topic + "," + CR + "," + mapping[index][item];
          itemsToChooseFrom.push(recommendation)
        }

        log("itemsToChooseFrom: " + JSON.stringify(itemsToChooseFrom));
        if(itemsToChooseFrom.length > 3){
          for(i=0;i<3;i++){
            recommendations.push(getRandomArrayValue(itemsToChooseFrom));
          }
        }else{
            for(i=0;i<itemsToChooseFrom.length;i++){
              recommendations.push(itemsToChooseFrom[i]);
            }
        }

        return recommendations;
      }else{
        return null;
      }
    },
    pushingTheEnvelope : function(curUserData,mappingsAndDifficulties){
      log("pushingTheEnvelope");
      var recommendations = [];
      var mapping = mappingsAndDifficulties["mappings"]["topicLRTypeToItems"];

      for(var topic in curUserData.topicScores){
        if(curUserData.topicScores[topic] > masteryThreshold){//a)
            //look for whether user has been assigned items from LRs: AT DR Convos, CR Items, or Dragoon items
            //if not then recommend that LR
            var topicLRType = topic + "," + ATDRC;
            if(!curUserData.topicLRTypeScores[topicLRType]){
              getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);
            }
            topicLRType = topic + "," + CR;
            if(!curUserData.topicLRTypeScores[topicLRType]){
              getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);
            }
            topicLRType = topic + "," + DRAGOON;
            if(!curUserData.topicLRTypeScores[topicLRType]){
              getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);
            }
        }
      }

      //b) look for LR with scores less than masteryThreshold ->
      //recommend AT DR Convos, Circuit Reasoning items, or Dragoon items
      var topicLRType = curUserData.lastTopic + "," + ATDRC;
      getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);
      topicLRType = curUserData.lastTopic + "," + CR;
      getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);
      topicLRType = curUserData.lastTopic + "," + DRAGOON;
      getRandomItemFromTopicLRType(topicLRType,mappingsAndDifficulties,recommendations);

      return recommendations;
    },
    motivatedBottomDweller : function(curUserData,mappingsAndDifficulties){
      var recommendations = [];


    },
    unmotivatedBottomDweller : function(curUserData,mappingsAndDifficulties){

    }
}

getRandomItemFromTopicLRType = function(topicLRType,mappingsAndDifficulties,recommendationsArr){
  log("getRandomItemFromTopicLRType: " + topicLRType);
  var items = mappingsAndDifficulties["mappings"]["topicLRTypeToItems"][topicLRType]
  if(!!items && items.length > 0){
    var recommendation = topicLRType + "," + getRandomArrayValue(items);
    recommendationsArr.push(recommendation);
  }
}

//getProcessingTimeThresholdFor
getRandomArrayValue = function(arr){
  return arr[getRandomNumber(arr.length)];
}

getRandomNumber = function(max){
  return Math.floor(Math.random() * max);
}

var getMappingsAndDifficulties = function(){
  log("getMappingsAndDifficulties");
  try{
    var search = ADL.XAPIWrapper.searchParams();
    search['verb'] = "https://umiis.github.io/ITSProfile/System/Store_Data";
    search['agent'] = JSON.stringify({"mbox":"mailto:data@electronixtutor.com","objectType":"Agent"});
    search['limit'] = 1;
    var ret = ADL.XAPIWrapper.getStatements(search);
    if(ret){
      window.returnval = ret;
      var mappingsAndDifficulties = ret['statements'][0]['context']["extensions"]["https://umiis.github.io/ITSProfile/System/Data"];
      window.mappingsAndDifficulties = mappingsAndDifficulties;
      return mappingsAndDifficulties;
    }
  }catch(e){
    log("error getting mappings and difficulties: " + e);
  }
}

var wrapper;
ADL.launch(setupConfig, true);
