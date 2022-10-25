const tapButton = document.getElementById('tapButton')
const tempoDisplay = document.getElementById('tempoDisp')
const resetButton = document.getElementById('reset')
const outputText = document.getElementById('output')
const metronomeDiv = document.getElementById('metroDiv')
const timeSelect = document.getElementById('timeSig')
const startButton = document.getElementById('start')
const stopButton = document.getElementById('stop')
const muteCheck = document.getElementById('muteCheck')

var times = [];
var tweens = [];
var metronomeOn = false

var clickHi = new Audio(chrome.runtime.getURL("audio/click_hi.mp3"));
var clickLo = new Audio(chrome.runtime.getURL("audio/click_lo.mp3"));

const audioStop = audio => {
    audio.pause()
    audio.currentTime = 0
}

tapButton.addEventListener('click', () => {
    stop()
    var date = new Date()
    times.push(date.getSeconds()*1000 + date.getMilliseconds())
    if (times.length !== 1) {
        var diff = times[times.length-1] - times[times.length-2]
        if (diff < 0 ) {diff += 60000}
        tweens.push(diff)
        tempoDisplay.value = Math.round(60000/average(tweens));
        outputText.innerText = `(${(Math.round(6000000/average(tweens))/100).toFixed(2).toString()})`
    }
})

resetButton.addEventListener('click', () => {
    times = [];
    tweens = [];
    tempoDisplay.value = 120
    outputText.innerText = "(120.00)"
})

timeSelect.addEventListener('change', () => {
    metronomeDiv.innerHTML = ""
    let list;
    switch (timeSelect.value) {
        case '2/4':
            list = [[true, false]];
            break;
        case '3/4':
            list = [[true, false, false]];
            break;
        case '4/4':
            list = [[true, false, false, false]];
            break;
        case '5/4':
            list = [[true, false, false], [true, false]];
            break;
        case '6/8':
            list = [[true, false, false], [true, false, false]];
            break;
        case '7/8':
            list = [[true, false, false, false], [true, false, false]];
            break;
        case '9/8':
            list = [[true, false, false], [true, false, false], [true, false, false]];
            break;
        case '12/8':
            list = [[true, false, false], [true, false, false], [true, false, false], [true, false, false]];
            break;    
        default:
            list = [[true, false, false, false]];
    }
    list = createBeatDivs(list);
    let div;
    for (let i = 0; i < list.length; i++) {
        div = document.createElement('div')
        div.className = "hori-flex"
        for (let j = 0; j < list[i].length; j++) {
            div.appendChild(list[i][j])
        }
        metronomeDiv.appendChild(div)
    }
})

startButton.addEventListener('click', start)

stopButton.addEventListener('click', stop)

tempoDisplay.addEventListener('input', () => {
    stop()
    outputText.innerText = `(${parseInt(tempoDisplay.value != "" ? tempoDisplay.value : 0).toFixed(2).toString()})`
})

tempoDisplay.addEventListener('keydown', e => {
    console.log(e.key)
    if (e.key === 'Enter') {
        start()
    }
})

function timeout(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

function createBeatDivs(boolList) {
    var divList = [];
    for (let i = 0; i < boolList.length; i++) {
        divList.push([])
        for (let j = 0; j < boolList[i].length; j++) {
            divList[i].push(createBeatDiv(boolList[i][j]))
        }
    }
    return divList
}

function createBeatDiv(isDownbeat=false) {
    var div = document.createElement('div')
    div.className = `beat${isDownbeat ? ' downbeat' : ''}`
    return div
}

const highlight = div => {div.classList.add('highlight'), setTimeout(() => div.classList.remove('highlight'), 120)}

function stop() {
    metronomeOn = false
    let beats = document.getElementsByClassName('beat')
    for (let i = 0; i < beats.length; i++) {
        beats[i].classList.remove('highlight')
    }
}

async function start() {
    if (!metronomeOn) {
        let ms = 60000/tempoDisplay.value
        let beats = document.getElementsByClassName('beat')
        metronomeOn = true

        while (true) {
            for (let i = 0; i < beats.length; i++) {
                // break if turned off
                if (!metronomeOn) { return }

                //play sounds
                if (muteCheck.checked) {
                    if (beats[i].classList.contains('downbeat')) { clickHi.play() }
                    else { clickLo.play() }
                }

                // highlight metronome beat
                beats[i].classList.add('highlight')

                // wait
                await timeout(ms)

                // reset
                beats[i].classList.remove('highlight')
                audioStop(clickHi)
                audioStop(clickLo)
            }
        }
    }
}