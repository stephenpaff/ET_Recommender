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
      var curStudentEmail = "mailto:andrew.tackett@gmail.com";
      log("output: " + JSON.stringify(getRecords(curStudentEmail)));
    }
}

var getRecords = function(curStudentEmail){
  log("Get Records");
  try{
    var search = ADL.XAPIWrapper.searchParamsAgg();
    search['pipeline'] = JSON.stringify([
      {
        "$match":
          {"$and": [
            {"statement.verb.id":"https://umiis.github.io/ITSProfile/verbs/SaveKCScore"},
            {"statement.actor.mbox" : curStudentEmail}
          ]}
      }
    ]);
    var ret = ADL.XAPIWrapper.getStatementsAgg(search);
    if(ret){
      window.ret = ret;
      return ret;
    }
  }catch(e){
    log("error getting records: " + e);
  }
}

var getMappingsAndDifficulties = function(){
  log("getMappingsAndDifficulties");

}

var wrapper;
ADL.launch(setupConfig, true);
