import pandas as pd
import requests
from requests.auth import HTTPBasicAuth

df = pd.read_csv('ET Assignment Bundles with Links - KC mapping.csv')

#Rename columns to use second row in spreadsheet
df.columns = df.iloc[[0]].values.tolist()[0]
df = df.drop(0)

#Get rid of unuseful columns
df = df.drop(columns=['Old_Link','Old_Topic','Maths'])
df = df.iloc[:,:-2]

#Get rid of duplicate/unuseful rows
df = df[pd.notnull(df['Topic'])]

dictAll = {}

columns = df.columns.values.tolist()

for i in range(0,df.shape[0]):
    row = df.iloc[[i]].values.tolist()[0]
    topic = row[0]
    learningResource = row[1]
    item = row[2]
    if topic not in dictAll:
        dictAll[topic] = {}
    if learningResource not in dictAll[topic]:
        dictAll[topic][learningResource] = {}
    if item not in dictAll[topic][learningResource]:
        dictAll[topic][learningResource][item] = []
    else:
        print(topic+","+learningResource+","+item)
    for j in range(3,df.shape[1]):
        if(row[j] == '1'):
            dictAll[topic][learningResource][item].append(columns[j])

topicsToKCs = {}
for topic in dictAll:
    if topic not in topicsToKCs:
        topicsToKCs[topic] = set()
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            for kc in dictAll[topic][learningResource][item]:
                topicsToKCs[topic].add(kc)

KCsToTopics = {}
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            for kc in dictAll[topic][learningResource][item]:
                if kc not in KCsToTopics:
                    KCsToTopics[kc] = set()
                KCsToTopics[kc].add(topic)

itemsToKCs = {}
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            if item not in itemsToKCs:
                itemsToKCs[item] = set()
            for kc in dictAll[topic][learningResource][item]:
                itemsToKCs[item].add(kc)

topicLRToItems = {}
for topic in dictAll:
    for learningResource in dictAll[topic]:
        pair = topic + "," + learningResource
        if pair not in topicLRToItems:
            topicLRToItems[pair] = set()
        for item in dictAll[topic][learningResource]:
            topicLRToItems[pair].add(item)

itemsToLR = {}
for topic in dictAll:
    for learningResource in dictAll[topic]:
        for item in dictAll[topic][learningResource]:
            if(item not in itemsToLR):
                itemsToLR[item] = set()
            itemsToLR[item].add(learningResource)

topicDifficulties = {
"Ohm's Law & Kirchhoff’s Law":1,
'Series & Parallel Circuit':2,
'Series/Parallel Combination':3,
'Filter':3,
'PN Junction':2,
'Rectifier':3,
'Power Supply':4,
'Diode Limiter & Clamper':3,
'Zener Diode & Regulator':4,
'Transistor':3,
'CE Amplifier':4,
'CC Amplifier':5,
'CB Amplifier':5,
'Multistage Amplifier':6,
'PushPull Amplifier':6
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

    kc = kc.lower()
    if("structure" in kc):
        difficulty = 0.25
    elif("function" in kc):
        difficulty = 0.50
    elif("behavior" in kc):
        difficulty = 0.75
    elif("parameter" in kc):
        difficulty = 1.0

    kcDifficulties[kc] = difficulty

itemDifficulties = {}

items = itemsToKCs.keys()

for item in items:
    difficulty = 0.5

    lr = list(itemsToLR[item])[0]

    KCs = itemsToKCs[item]

    numKCs = len(KCs)

    numKCsScaled = (1 - (1 - pow(numKCs,2)))

    lrDifficulty = 0.5 #lrDifficulties[lr] when we get the difficulty values for LRs

    difficulty = numKCsScaled + lrDifficulty

    for kc in KCs:
        kcDifficulty = kcDifficulties[kc]
        difficulty += kcDifficulty

    #Unweighted average of numKCsScaled, LR difficulty, and each of the KC difficulties
    difficulty = difficulty / (2 + numKCs)

    itemDifficulties[item] = difficulty

#JSON encoding class to handle set objects as lists
class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

mappings = { "topicsToKCs" : topicsToKCs,
             "KCsToTopics" : KCsToTopics,
             "itemsToKCs" : itemsToKCs,
             "topicLRToItems" : topicLRToItems }

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



headers = {'Content-Type': 'application/json', 'charset' : 'utf-8', "X-Experience-API-Version" : "1.0.1", 'Authorization' : str('Basic ' + basicAuth)}

r = requests.post(lrsURL,data=allDataJSON, headers=headers)

#Testing
##test = []
##for topic in dictAll:
##    for learningResource in dictAll[topic]:
##        for item in dictAll[topic][learningResource]:
##            cur = (topic+","+learningResource+","+item)
##            if cur in test:
##                print(cur)
##            test.append(cur)
