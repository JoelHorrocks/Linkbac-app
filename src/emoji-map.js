// Try to find descriptive emoji based on title
export function textToEmoji(text, subject) {
    text = text.toLowerCase();
    switch (true) {
        case ["writing", "paragraph"].some(substring=>text.includes(substring)):
            return getRandom(["✏️", "✍️", "✒️", "🖊️"]);
        case ["analysis"].some(substring=>text.includes(substring)):
            return "🔍";
        case ["timed"].some(substring=>text.includes(substring)):
            return "⏳";
        case ["space"].some(substring=>text.includes(substring)):
            return getRandom(["🚀", "☄️", "🌌", "🧑‍🚀", "🛰️", "🔭"]);
        case ["dance"].some(substring=>text.includes(substring)):
            return "🪩";
        case ["physics", "atom"].some(substring=>text.includes(substring)):
            return "⚛️";
        case ["biology", "plant"].some(substring=>text.includes(substring)):
            return "🌱";
        case ["chemistry", "experiment"].some(substring=>text.includes(substring)):
            return "🧪";
        case ["pe", "p.e", "phe", "sport"].some(substring=>text.includes(substring)):
            return getRandom(["🚴", "🏅", "🏃", "⚾", "🏏"]);
        case ["french", "critère"].some(substring=>text.includes(substring)):
            return "🇫🇷";
        case ["english", "read"].some(substring=>text.includes(substring)):
            return getRandom(["📚", "📖"]);
        case ["math"].some(substring=>text.includes(substring)):
            return getRandom(["🧮", "📏", "📐"]);
        case ["art"].some(substring=>text.includes(substring)):
            return "🎨";
        case ["history"].some(substring=>text.includes(substring)):
            return getRandom(["📜", "🏛️"]);
        case ["i&s"].some(substring=>text.includes(substring)):
            return "🗺️";
        default:
            return subjectToEmoji(subject);
    }
}

// Otherwise find emoji from subject name
function subjectToEmoji(text) {
    text = text.toLowerCase();
    switch (true) {
        case ["physics"].some(substring=>text.includes(substring)):
            return "⚛️";
        case ["biology"].some(substring=>text.includes(substring)):
            return "🌱";
        case ["chemistry"].some(substring=>text.includes(substring)):
            return "🧪";
        case ["pe", "phe"].some(substring=>text.includes(substring)):
            return getRandom(["🚴", "🏅", "🏃", "⚾", "🏏"]);
        case ["french"].some(substring=>text.includes(substring)):
            return getRandom(["🇫🇷"]);
        case ["english"].some(substring=>text.includes(substring)):
            return getRandom(["📚", "📖"]);
        case ["math"].some(substring=>text.includes(substring)):
            return getRandom(["🧮", "📏", "📐"]);
        case ["art"].some(substring=>text.includes(substring)):
            return "🎨";
        case ["i&s"].some(substring=>text.includes(substring)):
            return "🗺️";
        case ["design"].some(substring=>text.includes(substring)):
            return "📐";
        default:
            return "🏫";
    }
}

function getRandom(list) {
    return list[Math.floor((Math.random()*list.length))];
}