// some inspiration from https://stackoverflow.com/questions/15261030/web-audio-start-and-stop-oscillator-then-start-it-again

const buttonCount = document.querySelector(".buttons").children.length;
var context = new AudioContext(),
    oscillator;

function playOscillator(startTime, endTime, frequency) {
    oscillator = context.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime);
}

document.querySelector("#start-button").addEventListener("click", () => {
    if (!gamestart) {
        gamestart = true;
        sequence = [];
        nextRound();
    }
}
);

document.querySelectorAll(".buttons button").forEach((btn, index) => {
    btn.style.backgroundColor =  `hsl(${index * (360 / buttonCount)}, 100%, 50%)`;
    btn.setAttribute("orig_color", window.getComputedStyle(btn).getPropertyValue("background-color"));
});

document.querySelectorAll(".buttons button").forEach((btn, index) => btn.addEventListener("mousedown", () => {
    if(gamestart) return;
    oscillator = context.createOscillator();
    oscillator.frequency.value = 220 + index * 110;
    oscillator.connect(context.destination);
    oscillator.start();
}));

document.querySelectorAll(".buttons button").forEach((btn) => btn.addEventListener("mouseup", () => {
    if(gamestart) return;
    oscillator.stop();
}));

document.querySelectorAll(".buttons button").forEach((btn, index) => btn.addEventListener("click", () => {
    if (!gamestart || disableInput) return;
    playerSequence.push(index);
    playColor(index);
    // check the player's sequence against the game sequence
    for (let i = 0; i < playerSequence.length; i++) {
        if (playerSequence[i] !== sequence[i]) {
            alert("Game Over! You reached round " + sequence.length);
            gamestart = false;
            return;
        }
    }
    if (playerSequence.length === sequence.length) {
        setTimeout(() => {
            nextRound();
        }, 1000);
    }
}));

function playColor(colorIndex) {
    const button = document.querySelectorAll(".buttons button")[colorIndex];
    orig_color = button.getAttribute("orig_color");
    hsl = RGBtoHSL(orig_color);
    hsl_lighter = hsl;
    hsl_lighter[2] = clamp(hsl[2] + 0.3, 0, 1);
    button.style.backgroundColor = `hsl(${hsl_lighter[0]*360}, ${hsl_lighter[1]*100}%, ${hsl_lighter[2]*100}%)`;
    button.classList.add("playing");
    playOscillator(context.currentTime, context.currentTime + 0.5, 220 + colorIndex * 110);
    setTimeout(() => {
        button.style.backgroundColor = button.getAttribute("orig_color");
        button.classList.remove("playing");
    }, 500);
}

var gamestart = false;
var disableInput = false;

var sequence = [];
var playerSequence = [];

function nextRound() {
    const nextColor = Math.floor(Math.random() * buttonCount);
    sequence.push(nextColor);
    playerSequence = [];
    playSequence();
}

function playSequence() {
    disableInput = true;
    let delay = 0;
    sequence.forEach((colorIndex, i) => {
        setTimeout(() => {
            playColor(colorIndex);
        }, delay);
        delay += 1000; // wait 1 second between colors
    });
    disableInput = false;
}

function RGBtoHSL(rgb) {
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);

    for (let R in rgb) {
        let r = rgb[R];
        if (r.indexOf("%") > -1) 
            rgb[R] = Math.round(r.substr(0,r.length - 1) / 100 * 255);
    }

    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function clamp (value, min, max) {
    return Math.min(Math.max(value, min), max);
}