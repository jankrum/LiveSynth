import Device from '/namespaces/device.js';
import { isLoopbackCall, isCommandCall, PREVIOUS_CC, PLAY_CC, PAUSE_CC, NEXT_CC, STOP_CC, isButtonPress } from '/namespaces/constants.js';
import Transporter from '/namespaces/transporter.js';
import Controller from '/namespaces/controller.js';
import Synthesizer from '/namespaces/synthesizer.js';
import filesystem from './filesystem.js';

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

    return Controller.makeJsonSysexMessage({ controllerState });
}

// Handles command calls from the controller
function dealWithControllerCommandCalls(data) {
    console.debug('The data from the controller:');
    console.debug(data);
}

async function getScriptControllerAndSynthesizerFromScorePart(scorePart) {
    const partName = scorePart.querySelector('part-name').innerHTML.toUpperCase();
    const playerName = scorePart.querySelector('player-name').innerHTML;

    const scriptText = filesystem.scripts.find(scriptFile => scriptFile.name === playerName).script;

    if (!scriptText) {
        throw new Error('Could not find matching script');
    }

    console.log(scriptText);
    console.log(eval(scriptText));

    // The connection to the controller
    const controller = new Controller(partName);

    controller.addHandler(isLoopbackCall, sendControllerState);
    controller.addHandler(isCommandCall, dealWithControllerCommandCalls);

    await controller.createConnection();

    const synthesizer = new Synthesizer(partName);

    await synthesizer.createConnection();

    const result = { scriptText, controller, synthesizer };

    return result;
}

async function loadChart() {
    const chartText = filesystem.charts[state.chartIndex].body;

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
    console.log('sending state');
    const stateToSend = {
        cannotPrevious: state.chartIndex <= 0,
        cannotPlay: state.playing,
        cannotPause: !state.playing,
        cannotNext: state.chartIndex >= (filesystem.charts.length - 1),
        cannotStop: !state.playing && !state.paused,
        songTitle: filesystem.charts[state.chartIndex].title
    };

    const message = Device.makeJsonSysexMessage(stateToSend)
    console.log({ message });
    return message;
}

// Deals with button presses
async function dealWithTransporterButtonPresses(data) {
    console.log({ data });
    switch (data[1]) {
        case PREVIOUS_CC:
            stopPlaying();
            // Checks to make sure we aren't on the first chart
            if (state.chartIndex > 0) {
                state.playing = false;
                state.paused = false;
                state.chartIndex -= 1;
                await loadChart();
            }
            break;
        case PLAY_CC:
            if (!state.paused) {
                // If we weren't paused
                startPlaying();
            } else {
                // If we were paused
                resumePlaying();
            }
            state.playing = true;
            state.paused = false;
        case PAUSE_CC:
            pausePlaying();
            state.playing = false;
            state.paused = true;
            break;
        case NEXT_CC:
            stopPlaying();
            // Checks to make sure we aren't on the last chart
            if (state.chartIndex < state.charts.length - 1) {
                state.playing = false;
                state.paused = false;
                state.chartIndex += 1;
                await loadChart();
            }
            break;
        case STOP_CC:
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
    await Device.initialize();

    // The connection to the transporter
    const transporter = new Transporter();

    // Handler functions
    transporter.addHandler(isLoopbackCall, sendTransportState);
    transporter.addHandler(isButtonPress, dealWithTransporterButtonPresses);

    // Establishes the MIDI connection
    await transporter.createConnection();

    loadChart();
}

window.addEventListener('load', main);