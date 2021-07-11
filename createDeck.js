/*
    This script uses AnkiConnect to create and add the decks and notes to Anki,
    If you are considering using this, check the AnkiConnect docs to setup up the environment.
*/

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const xhr = new XMLHttpRequest();
const rtk = require('../get kanjis per lesson/RTKcore6k.json');

const createDeck = {
    "action": "createDeck",
    "version": 6,
    "params": {
        "deck": "RTK Core 6K"
    }
};

const createSubDeck = (lesson) => {
    const prefix = lesson < 10 ? 0 : "";
    return {
        "action": "createDeck",
        "version": 6,
        "params": {
            "deck": `RTK Core 6K::Lesson ${prefix}${lesson}`
        }
    }
}

const addNote = (data) => {
    const prefix = data["RTK-Lesson"] < 10 ? 0 : "";
    return {
        "action": "addNote",
        "version": 6,
        "params": {
            "note": {
                "deckName": `RTK Core 6K::Lesson ${prefix}${data["RTK-Lesson"]}`,
                "modelName": "RTK Core 6K",
                "fields": {
                    "Vocabulary-Kanji": `${data["Vocabulary-Kanji"]}`,
                    "Vocabulary-Furigana": `${data["Vocabulary-Furigana"]}`,
                    "Vocabulary-Kana": `${data["Vocabulary-Kana"]}`,
                    "Vocabulary-English": `${data["Vocabulary-English"]}`,
                    "Vocabulary-Audio": `${data["Vocabulary-Audio"]}`,
                    "Vocabulary-Pos": `${data["Vocabulary-Pos"]}`,
                    "Caution": `${data["Caution"]}`,
                    "Expression": `${data["Expression"]}`,
                    "Reading": `${data["Reading"]}`,
                    "Sentence-Kana": `${data["Sentence-Kana"]}`,
                    "Sentence-English": `${data["Sentence-English"]}`,
                    "Sentence-Clozed": `${data["Sentence-Clozed"]}`,
                    "Sentence-Audio": `${data["Sentence-Audio"]}`,
                    "Notes": `${data["Notes"]}`,
                    "Core-Index": `${data["Core-Index"]}`,
                    "Optimized-Voc-Index": `${data["Optimized-Voc-Index"]}`,
                    "Optimized-Sent-Index": `${data["Optimized-Sent-Index"]}`,
                    "RTK-Lesson": `${data["RTK-Lesson"]}`
                },
                "options": {
                    "allowDuplicate": true,
                    "duplicateScope": "deck",
                    "duplicateScopeOptions": {
                        "deckName": `RTK Core 6K::Lesson ${prefix}${data["RTK-Lesson"]}`,
                        "checkChildren": false
                    }
                },
                "tags": [
                    `RTK-Lesson${data["RTK-Lesson"]}`
                ]
            }
        }
    }
}

const compare = ( a, b ) => {
    if ( parseInt(a["Optimized-Voc-Index"]) < parseInt(b["Optimized-Voc-Index"]) ){
      return -1;
    }
    if ( parseInt(a["Optimized-Voc-Index"]) > parseInt(b["Optimized-Voc-Index"]) ){
      return 1;
    }
    return 0;
};

const invoke = async (query) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:8765');
        xhr.send(JSON.stringify({action: query.action, version: query.version, params: query.params}));
    });
}

(async () => {
    // create main deck
    await invoke(createDeck).then(r => console.log(`Created deck with ID: ${r}`)).catch(e => console.log(e));

    // create 56 subdecks for each lesson
    for (let i = 0; i < 56; i++) {
        // create subdeck for lesson
        let subDeckID;
        await invoke(createSubDeck(i+1)).then((r)=>{
                console.log(`Created subdeck for lesson ${i+1} with ID: ${r}`)
                subDeckID = r;
            }
        ).catch(e => console.log(e));

        // check cards for this lesson
        let lessonElements = [];
        for (let element = 0; element < rtk.length; element++) {
            if (rtk[element]["RTK-Lesson"] == i+1) {
                // create array of matches
                lessonElements.push(rtk[element]);
            }   
        }

        // order array by Optimized-Voc-Index
        lessonElements.sort(compare);

        // add to anki
        for (let orderedElement = 0; orderedElement < lessonElements.length; orderedElement++) {
            await invoke(addNote(lessonElements[orderedElement])).catch(e => console.log(e));
        }
        
    }


})();
