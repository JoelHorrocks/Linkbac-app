// Try to find descriptive emoji based on title
export function textToEmoji(text, subject) {
    text = text.toLowerCase();
    switch (true) {
        case ["space", "astronomy"].some(substring=>text.includes(substring)):
            return getRandom(["🚀", "☄️", "🌌", "🧑‍🚀", "🛰️", "🔭"]);
        case ["solar"].some(substring=>text.includes(substring)):
            return getRandom(["☀️", "🌌"]);
        case ["dance", "dancing"].some(substring=>text.includes(substring)):
            return "🪩";
        case ["nervous system"].some(substring=>text.includes(substring)):
            return "🧠";
        case ["cell", "dna", "enzyme", "hormone"].some(substring=>text.includes(substring)):
            return "🧬";
        case ["dissection"].some(substring=>text.includes(substring)):
            return "🔪";
        case ["radiation"].some(substring=>text.includes(substring)):
            return "☢️";
        case ["magnet"].some(substring=>text.includes(substring)):
            return "🧲";
        case ["oil", "alkene", "alkane", "hydrocarbon"].some(substring=>text.includes(substring)):
            return "🛢️";
        case ["organic"].some(substring=>text.includes(substring)):
            return "🌱";
        case ["atom"].some(substring=>text.includes(substring)):
            return "⚛️";
        case ["plant"].some(substring=>text.includes(substring)):
            return "🌱";
        case ["computer"].some(substring=>text.includes(substring)):
            return "💻";
        case ["robot"].some(substring=>text.includes(substring)):
            return "🤖";
        case ["electricity"].some(substring=>text.includes(substring)):
            return "⚡";
        case ["light"].some(substring=>text.includes(substring)):
            return "🔦";
        case ["sound"].some(substring=>text.includes(substring)):
            return "🔊";
        case ["heat"].some(substring=>text.includes(substring)):
            return "🔥";
        case ["drugs"].some(substring=>text.includes(substring)):
            return "💊";
        case ["rocket"].some(substring=>text.includes(substring)):
            return "🚀";
        case ["probability"].some(substring=>text.includes(substring)):
            return getRandom(["🎲"], ["🎰"], ["🎱"]);
        case ["war"].some(substring=>text.includes(substring)):
            return "🪖";
        case ["pendulum"].some(substring=>text.includes(substring)):
            return "🕰️";
        case ["city", "urban"].some(substring=>text.includes(substring)):
            return "🏙️";
        case ["glacier", "mountain"].some(substring=>text.includes(substring)):
            return "🏔️";
        case ["forest"].some(substring=>text.includes(substring)):
            return "🌲";
        case ["ocean"].some(substring=>text.includes(substring)):
            return "🌊";
        case ["earth"].some(substring=>text.includes(substring)):
            return "🌍";
        case ["experiment", "lab"].some(substring=>text.includes(substring)):
            return "🧪";
        case ["ping pong", "table tennis"].some(substring=>text.includes(substring)):
            return "🏓";
        case ["soccer", "football"].some(substring=>text.includes(substring)):
            return "⚽";
        case ["basketball"].some(substring=>text.includes(substring)):
            return "🏀";
        case ["volleyball"].some(substring=>text.includes(substring)):
            return "🏐";
        case ["baseball"].some(substring=>text.includes(substring)):
            return "⚾";
        case ["cricket", "rounders"].some(substring=>text.includes(substring)):
            return "🏏";
        case ["tennis"].some(substring=>text.includes(substring)):
            return "🎾";
        case ["golf"].some(substring=>text.includes(substring)):
            return "🏌️";
        case ["badminton"].some(substring=>text.includes(substring)):
            return "🏸";
        case ["swimming"].some(substring=>text.includes(substring)):
            return "🏊";
        case ["hockey"].some(substring=>text.includes(substring)):
            return "🏒";
        case ["rugby"].some(substring=>text.includes(substring)):
            return "🏉";
        case ["skiing"].some(substring=>text.includes(substring)):
            return "⛷️";
        case ["snowboarding"].some(substring=>text.includes(substring)):
            return "🏂";
        case ["cycling"].some(substring=>text.includes(substring)):
            return "🚴";
        case ["running"].some(substring=>text.includes(substring)):
            return "🏃";
        case ["gymnastics"].some(substring=>text.includes(substring)):
            return "🤸";
        case ["archery"].some(substring=>text.includes(substring)):
            return "🏹";
        case ["boxing"].some(substring=>text.includes(substring)):
            return "🥊";
        case ["fencing"].some(substring=>text.includes(substring)):
            return "🤺";
        case ["wrestling"].some(substring=>text.includes(substring)):
            return "🤼";
        case ["weightlifting"].some(substring=>text.includes(substring)):
            return "🏋️";
        case ["judo"].some(substring=>text.includes(substring)):
            return "🥋";
        case ["karate"].some(substring=>text.includes(substring)):
            return "🥋";
        case ["sport"].some(substring=>text.includes(substring)):
            return getRandom(["🚴", "🏅", "🏃", "⚾", "🏏"]);
        case ["critère"].some(substring=>text.includes(substring)):
            return "🇫🇷";
        case ["read"].some(substring=>text.includes(substring)):
            return getRandom(["📚", "📖"]);
        case ["history"].some(substring=>text.includes(substring)):
            return getRandom(["📜", "🏛️"]);
        case ["writing", "paragraph", "essay"].some(substring=>text.includes(substring)):
            return getRandom(["✏️", "✍️", "✒️", "🖊️"]);
        case ["analysis"].some(substring=>text.includes(substring)):
            return "🔍";
        case ["timed"].some(substring=>text.includes(substring)):
            return "⏳";
        case ["test"].some(substring=>text.includes(substring)):
            return "📝";
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
        case ["pe", "phe", "p.e"].some(substring=>text.includes(substring)):
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