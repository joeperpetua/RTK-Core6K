const rtk = require('./kanjis-6th-edition.json');
const core6k = require('./core6k.json');
const fs = require('fs');

// get lesson 1 vocab
let filteredCore6k = [];
let rtkCore6k = [];

// step 1 filter between hiragana and compound vocab
for (let core6kElement = 0; core6kElement < core6k.length; core6kElement++) {
    if (hasKanji(core6k[core6kElement]["Vocabulary-Kanji"])) {
        filteredCore6k.push(core6k[core6kElement]);
    }
}

// console.log(core6k.length, filteredCore6k.length);
let deleted = 0;
// step 2 get amount of kanji in vocab
for (let fCore6kElement = 0; fCore6kElement < filteredCore6k.length; fCore6kElement++) {
    let vocabKanjis = [];
    for (let char = 0; char < filteredCore6k[fCore6kElement]["Vocabulary-Kanji"].length; char++) {
        if (isKanji(filteredCore6k[fCore6kElement]["Vocabulary-Kanji"][char])) {
            vocabKanjis.push(filteredCore6k[fCore6kElement]["Vocabulary-Kanji"][char]);
        }
    }
    // console.log(filteredCore6k[fCore6kElement]["Vocabulary-Kanji"], vocabKanjis);
    
    // step 3 search each kanji in the RTK lessons
    let matchingKanji = {
        matches: 0,
        lesson: 0
    };

    for (let rtkElement = 0; rtkElement < rtk.length; rtkElement++) {
        vocabKanjis.forEach(element => {
            // console.log(rtk[rtkElement].kanji, element)
            if (rtk[rtkElement].kanji === element) {
                // console.log('found in RTK');
                matchingKanji.matches++;
                matchingKanji.lesson = rtk[rtkElement].lesson > matchingKanji.lesson ? rtk[rtkElement].lesson : matchingKanji.lesson;
            }else{
                // console.log('not found in RTK');
            }
        });
    }

    // check if the kanjis were found in rtk
    if (matchingKanji.matches === vocabKanjis.length) { // add property lesson to filteredCore6k
        // console.log('matches')
        filteredCore6k[fCore6kElement]["RTK-Lesson"] = matchingKanji.lesson.toString();
        rtkCore6k.push(filteredCore6k[fCore6kElement]);
    }else{
        // console.log('not matches', matchingKanji.matches, vocabKanjis.length)
        filteredCore6k.splice(fCore6kElement, 1);
        deleted++;
    }

    // console.log(filteredCore6k[fCore6kElement])


}
console.log(deleted, core6k.length, filteredCore6k.length, rtkCore6k.length);

let deckString = JSON.stringify(rtkCore6k);

fs.writeFile('./RTKcore6k.json', deckString, err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        console.log('Successfully wrote file')
    }
});










/////////////////////////////////////////////////////

function some(str, callback) {
    return Array.prototype.some.call(str, callback);
}

function hasKanji(str) {
    return some(str, isKanji);
}

function isKanji(ch) {
    return (ch >= "\u4e00" && ch <= "\u9faf") ||
	(ch >= "\u3400" && ch <= "\u4dbf");
}

