import pandas as pd
import requests
from requests.auth import HTTPBasicAuth
import json

topicData = pd.read_csv('ET & PAL3 topic mapping - ET & PAL3 topic mapping.csv')
topicData = topicData.loc[:,['Topic Name','Topic Summary Moodle Link','NEETs Link','Topic Summary Link']]

#Get rid of rows with empty values so we don't hit parse errors
topicData = topicData.dropna()

topicsToSummaryLinks = {}
topicsToSourceLinks = {}
topicsToNEETsLinks = {}

for i in range(0,topicData.shape[0]):
    row = topicData.iloc[[i]].values.tolist()[0]
    topicName = row[0].lower()
    summaryLink = row[1]
    neetsLink = row[2]
    topicSourceLink = row[3]
    if(pd.notnull(summaryLink)):
        topicsToSummaryLinks[topicName] = summaryLink
    if(pd.notnull(neetsLink)):
        topicsToNEETsLinks[topicName] = neetsLink
    if(pd.notnull(topicSourceLink)):
        topicsToSourceLinks[topicName] = topicSourceLink

df = pd.read_csv('ET_KC_MAPPING - Learning_Resource_KC_Mapping.csv')
#df = pd.read_csv('ET Assignment Bundles with Links - KC mapping.csv')

#Remove empty columns
df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

#Rename KC columns to use second row in spreadsheet
df.columns = df.columns[0:12].values.tolist() + df.iloc[[0]].values.tolist()[0][12:130] + df.columns[130:134].values.tolist()
df = df.drop(0)

#Get rid of unuseful columns
df = df.drop(columns=['GUID','Lesson_Name','DocsLink','HTML5 Link','KC Bashir','Checked Alignment?','Sum','BM comments','Converted'])

#Reorder to move moodle links to front
cols = list(df)
cols.insert(4, cols.pop(cols.index("Moodle html")))
cols.insert(5, cols.pop(cols.index("Direct Link")))
cols.insert(6, cols.pop(cols.index("Math")))
df = df.ix[:, cols]



#Get rid of duplicate/unuseful rows
df = df[pd.notnull(df['Topic'])]

dictAll = {}
lrToLRType = {}
itemsToLinks = {}
itemsToSourceLinks = {}
columns = df.columns.values.tolist()
itemHasMath = {}

for i in range(0,df.shape[0]):
    row = df.iloc[[i]].values.tolist()[0]
    item = row[0].lower()
    topic = row[1].lower()
    learningResource = row[2].lower()
#    if("skill builder" not in learningResource):
#        continue
    lrType = row[3].lower()
    link = row[4]
    sourceLink = row[5]
    math = row[6]
    if(pd.notnull(link)):
        itemsToLinks[item] = link
    if(pd.notnull(sourceLink)):
        itemsToSourceLinks[item] = sourceLink
    if(pd.notnull(math)):
        itemHasMath[item] = math == "1"
    if learningResource not in lrToLRType:
        lrToLRType[learningResource] = lrType
    if topic not in dictAll:
        dictAll[topic] = {}
    if learningResource not in dictAll[topic]:
        dictAll[topic][learningResource] = {}
    if item not in dictAll[topic][learningResource]:
        dictAll[topic][learningResource][item] = []
    for j in range(7,df.shape[1]):
        if(row[j] == '1'):
            dictAll[topic][learningResource][item].append(columns[j].lower())

topicsToKCs = {} #Used
for topic in dictAll:
    if topic not in topicsToKCs:
        topicsToKCs[topic] = set()
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            for kc in dictAll[topic][learningResource][item]:
                topicsToKCs[topic].add(kc)

KCsToTopics = {} #Used
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            for kc in dictAll[topic][learningResource][item]:
                if kc not in KCsToTopics:
                    KCsToTopics[kc] = set()
                KCsToTopics[kc].add(topic)

topicLRTypeToKCs = {} #Used
for topic in dictAll:
    for learningResource in dictAll[topic]:
        topicLRType = topic + "," + lrToLRType[learningResource]
        if topicLRType not in topicLRTypeToKCs:
            topicLRTypeToKCs[topicLRType] = set()
        for item in dictAll[topic][learningResource]:
            for kc in dictAll[topic][learningResource][item]:
                topicLRTypeToKCs[topicLRType].add(kc)

KCsToTopicLRType = {} #Used
for topic in dictAll:
    for learningResource in dictAll[topic]:
        topicLRType = topic + "," + lrToLRType[learningResource]
        for item in dictAll[topic][learningResource]:
            for kc in dictAll[topic][learningResource][item]:
                if kc not in KCsToTopicLRType:
                    KCsToTopicLRType[kc] = set()
                KCsToTopicLRType[kc].add(topicLRType)

itemsToKCs = {} #Used
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            if item not in itemsToKCs:
                itemsToKCs[item] = set()
            for kc in dictAll[topic][learningResource][item]:
                itemsToKCs[item].add(kc)

beetleTopics = ["Ohm's Law & Kirchhoff's Law".lower(),"Series & Parallel Circuit".lower(),"Series/Parallel Combination".lower()]
itemsToTopic = {} #Used
for topic in dictAll:
    itemsToTopic[topic] = topic
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            #Hacky solution for us including beetle items as viable in all topics
            #Need this to prevent mess ups with performance scores and last topic
            if "beetle" in item.lower():
                if topic not in beetleTopics:
                    continue
            itemsToTopic[item] = topic

topicLRTypeToItems = {} #Used
for topic in dictAll:
    for learningResource in dictAll[topic]:
        pair = topic + "," + lrToLRType[learningResource]
        if pair not in topicLRTypeToItems:
            topicLRTypeToItems[pair] = set()
        for item in dictAll[topic][learningResource]:
            topicLRTypeToItems[pair].add(item)

topicLRTypeKCToItems = {} #Used
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            kcs = dictAll[topic][learningResource][item]
            for kc in kcs:
                topicLRTypeKC = topic + "," + lrToLRType[learningResource] + "," + kc;
                if topicLRTypeKC not in topicLRTypeKCToItems:
                    topicLRTypeKCToItems[topicLRTypeKC] = set()
                topicLRTypeKCToItems[topicLRTypeKC].add(item)

itemsToLR = {}
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            if(item not in itemsToLR):
                itemsToLR[item] = set()
            itemsToLR[item].add(learningResource)

itemsToLRType = {}
for item in itemsToLR:
    lr = list(itemsToLR[item])[0]
    itemsToLRType[item] = lrToLRType[lr]
for topic in topicsToSummaryLinks:
    itemsToLRType[topic] = "Topic Summary".lower()

itemsToTopicLRType = {}
for item in itemsToLRType:
    itemsToTopicLRType[item] = itemsToTopic[item] + "," + itemsToLRType[item];

topicDifficulties = {
    "Ohm's Law & Kirchhoff's Law".lower():1,
    'Series & Parallel Circuit'.lower():2,
    'Series/Parallel Combination'.lower():3,
    'Filter'.lower():3,
    'PN Junction'.lower():2,
    'Rectifier'.lower():3,
    'Power Supply'.lower():4,
    'Diode Limiter & Clamper'.lower():3,
    'Zener Diode & Regulator'.lower():4,
    'Transistor'.lower():3,
    'CE Amplifier'.lower():4,
    'CC Amplifier'.lower():5,
    'CB Amplifier'.lower():5,
    'Multistage Amplifier'.lower():6,
    'PushPull Amplifier'.lower():6
}

topicOrder = {
    0:"Ohm's Law & Kirchhoff's Law".lower(),
    1:'Series & Parallel Circuit'.lower(),
    2:'Series/Parallel Combination'.lower(),
    3:'Filter'.lower(),
    4:'PN Junction'.lower(),
    5:'Rectifier'.lower(),
    6:'Power Supply'.lower(),
    7:'Diode Limiter & Clamper'.lower(),
    8:'Zener Diode & Regulator'.lower(),
    9:'Transistor'.lower(),
    10:'CE Amplifier'.lower(),
    11:'CC Amplifier'.lower(),
    12:'CB Amplifier'.lower(),
    13:'Multistage Amplifier'.lower(),
    14:'PushPull Amplifier'.lower()
}

#Rescale to 0 to 1
for topic in topicDifficulties:
    topicDifficulties[topic] = ((topicDifficulties[topic] - 1)/5)

#Output of scaled topic difficulties
#Output: {"Ohm's Law & Kirchhoff’s Law": 0.0, 'Series & Parallel Circuit': 0.2, 'Series/Parallel Combination': 0.4, 'Filter': 0.4, 'PN Junction': 0.2, 'Rectifier': 0.4, 'Power Supply': 0.6, 'Diode Limiter & Clamper': 0.4, 'Zener Diode & Regulator': 0.6, 'Transistor': 0.4, 'CE Amplifier': 0.6, 'CC Amplifier': 0.8, 'CB Amplifier': 0.8, 'Multistage Amplifier': 1.0, 'PushPull Amplifier': 1.0}

#Get KC difficulties from name of KC
kcDifficulties = {}

allKCs = KCsToTopics.keys()

for kc in allKCs:
    difficulty = 0.5

    if("structure" in kc):
        difficulty = 0.25
    elif("function" in kc):
        difficulty = 0.50
    elif("behavior" in kc):
        difficulty = 0.75
    elif("parameter" in kc):
        difficulty = 1.0

    kcDifficulties[kc] = difficulty

lrDifficulties = {}

for lr in lrToLRType:
    LRType = lrToLRType[lr].lower()
    lrDifficulty = 0.5

    if 'circuit basics' in LRType or 'electronic laws' in LRType:
        lrDifficulty = 0.25
    elif 'autotutor knowledge check conversations' in LRType:
        lrDifficulty = 0.5
    elif 'autotutor deep reasoning conversations' in LRType or 'circuit reasoning' in LRType:
        lrDifficulty = 0.75
    elif'dragoon modeling' in LRType:
        lrDifficulty = 1.0

    lrDifficulties[lr] = lrDifficulty

itemDifficulties = {}
itemProcessingThresholds = {}

#15 minutes * 60 seconds/min * 1000 milliseconds/sec
processingTimeConstant = 15 * 60 * 1000

items = itemsToKCs.keys()

for item in items:
    lr = list(itemsToLR[item])[0]

    KCs = itemsToKCs[item]

    numKCs = len(KCs)

    numKCsScaled = (1 - (1 / pow(numKCs,2)))

    lrDifficulty = lrDifficulties[lr]

    difficulty = numKCsScaled + lrDifficulty

    for kc in KCs:
        kcDifficulty = kcDifficulties[kc]
        difficulty += kcDifficulty

    #Unweighted average of numKCsScaled, LR difficulty, and each of the KC difficulties
    difficulty = difficulty / (2 + numKCs)

    itemDifficulties[item] = difficulty
    itemProcessingThresholds[item] = difficulty * processingTimeConstant

#JSON encoding class to handle set objects as lists
class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

mappings = {
             "topicLRTypeToItems" : topicLRTypeToItems,
             "topicLRTypeKCToItems" : topicLRTypeKCToItems,
             "topicLRTypeToKCs" : topicLRTypeToKCs,
             "topicsToKCs" : topicsToKCs,
             "itemsToKCs" : itemsToKCs,
             "itemsToLRType" : itemsToLRType,
             "itemsToTopic" : itemsToTopic,
             "itemsToTopicLRType" : itemsToTopicLRType,
             "KCsToTopics" : KCsToTopics,
             "KCsToTopicLRType" : KCsToTopicLRType,
             "lrToLRType" : lrToLRType,
             "itemProcessingThresholds" : itemProcessingThresholds,
             "itemHasMath" : itemHasMath,
             "itemsToLinks" : itemsToLinks,
             "itemsToSourceLinks" : itemsToSourceLinks,
             "topicsToSummaryLinks" : topicsToSummaryLinks,
             "topicsToSourceLinks" : topicsToSourceLinks,
             "topicsToNEETsLinks" : topicsToNEETsLinks,
             "topicOrder" : topicOrder }

difficulties = { "topicDifficulties" : topicDifficulties,
                 "kcDifficulties" : kcDifficulties,
                 "itemDifficulties" : itemDifficulties,
                 "lrDifficulties" : lrDifficulties }

allData = { "actor" :{
    "mbox" : "mailto:data@electronixtutor.com",
    "name" : "Data",
    "objectType" : "Agent"
    },
    "verb" : {
        "id" : "https://umiis.github.io/ITSProfile/System/Store_Data",
        "display" : {
            "en-US" : "Store Data"
            }
    },
    "object": {
        "id" : "ff365267-1fc9-485b-8918-fb926757369e",
        "objectType": "StatementRef"
    },
    "context": {
        "extensions": {
            "https://umiis.github.io/ITSProfile/System/Data": {
                "mappings" : mappings,
                "difficulties" : difficulties
            }
        }
    }
}

allDataJSON = json.dumps(allData,cls=SetEncoder)

#with open('kcMappings.json','w') as outfile:
#    json.dump(itemsToKCs,outfile,cls=SetEncoder)


headers = {'Content-Type': 'application/json', 'charset' : 'utf-8', "X-Experience-API-Version" : "1.0.3", 'Authorization' : str('Basic ' + basicAuth)}

r = requests.post(lrsURL,data=allDataJSON, headers=headers)

print(r.text)
