// The mutable state for the sequencer
const state = {
    playing: false,
    paused: false,
    chartIndex: 0
};

// Calculates state for controller
function sendControllerState() {
    const controllerState = Array(12).fill().map((_, ind1) => {
        const result = {
            index: ind1,
            labelArray: Array(128).fill().map((__, ind2) => `Module #${ind1 + 1}\nValue: ${ind2}!`)
        }

        return result;
    })

    return UTILITIES.makeJsonSysexMessage({ controllerState });
}

// Handles command calls from the controller
function dealWithControllerCommandCalls(data) {
    console.debug('The data from the controller:');
    console.debug(data);
}

async function getScriptControllerAndSynthesizerFromScorePart(scorePart) {
    const partName = scorePart.querySelector('part-name').innerHTML.toUpperCase();
    const playerName = scorePart.querySelector('player-name').innerHTML;

    const script = fs.scripts.find(scriptFile => scriptFile.name === playerName).script;

    if (!script) {
        throw new Error('Could not find matching script');
    }

    // The connection to the controller
    const controller = new Controller(partName);

    controller.addHandler(MIDI_CONSTANTS.isLoopbackCall, sendControllerState);
    controller.addHandler(MIDI_CONSTANTS.isCommandCall, dealWithControllerCommandCalls);

    await controller.createConnection();

    const synthesizer = new Synthesizer(partName);

    await synthesizer.createConnection();

    const result = { script, controller, synthesizer };

    return result;
}

async function loadChart() {
    const chartText = fs.charts[state.chartIndex].body;

    const parser = new DOMParser();
    const chart = parser.parseFromString(chartText, 'text/xml');

    const errorNode = chart.querySelector('parsererror');
    if (errorNode) {
        alert('error while parsing');
        return;
    }

    const rawParts = chart.querySelectorAll('score-part');
    const parts = await Promise.all(Array.from(rawParts).map(getScriptControllerAndSynthesizerFromScorePart));

    console.log({ parts });
}

function startPlaying() {
    // pass
}

function resumePlaying() {
    // pass
}

function pausePlaying() {
    // pass
}

function stopPlaying() {
    // pass
}

// Calculates and returns a MIDI sysex message containing
// a JSON obj representing the state for the transport
function sendTransportState() {
    const stateToSend = {
        cannotPrevious: state.chartIndex <= 0,
        cannotPlay: state.playing,
        cannotPause: !state.playing,
        cannotNext: state.chartIndex >= (fs.charts.length - 1),
        cannotStop: !state.playing && !state.paused,
        songTitle: fs.charts[state.chartIndex].title
    };

    return UTILITIES.makeJsonSysexMessage(stateToSend);
}

// Deals with button presses
function dealWithTransporterButtonPresses(data) {
    switch (data[1]) {
        case MIDI_CONSTANTS.PREVIOUS_CC:
            stopPlaying();
            // Checks to make sure we aren't on the first chart
            if (state.chartIndex > 0) {
                state.playing = false;
                state.paused = false;
                state.chartIndex -= 1;
                loadChart();
            }
            break;
        case MIDI_CONSTANTS.PLAY_CC:
            if (!state.paused) {
                // If we weren't paused
                startPlaying();
            } else {
                // If we were paused
                resumePlaying();
            }
            state.playing = true;
            state.paused = false;
        case MIDI_CONSTANTS.PAUSE_CC:
            pausePlaying();
            state.playing = false;
            state.paused = true;
            break;
        case MIDI_CONSTANTS.NEXT_CC:
            stopPlaying();
            // Checks to make sure we aren't on the last chart
            if (state.chartIndex < state.charts.length - 1) {
                state.playing = false;
                state.paused = false;
                state.chartIndex += 1;
                loadChart();
            }
            break;
        case MIDI_CONSTANTS.STOP_CC:
            stopPlaying();
            state.playing = false;
            state.paused = false;
            break;
    }

    // Send new state
    return sendTransportState();
}

// For when the page is loaded
async function main() {
    await MidiDevice.initialize();

    // The connection to the transporter
    const transporter = new Transporter();

    // Handler functions
    transporter.addHandler(MIDI_CONSTANTS.isLoopbackCall, sendTransportState);
    transporter.addHandler(MIDI_CONSTANTS.isButtonPress, dealWithTransporterButtonPresses);

    // Establishes the MIDI connection
    transporter.createConnection();

    loadChart();
}

window.addEventListener('load', main);