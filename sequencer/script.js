// import Device from '/namespaces/device.js';
// import { RESET, isLoopbackCall, isCommandCall, PREVIOUS_CC, PLAY_CC, PAUSE_CC, NEXT_CC, STOP_CC } from '/namespaces/constants.js';
// import Fsm from './fsm.js';
import Transporter from './transporter.js';
// import Controller from './controller.js';
// import Synthesizer from './synthesizer.js';
import filesystem from './filesystem.js';

// // The mutable state for the sequencer
// const state = {
//     playing: false,
//     paused: false,
//     chartIndex: 0
// };

// // Calculates state for controller
// function makeSendControllerState(controllerState) {
//     return _ => [RESET, ...Device.makeJsonSysexMessage(controllerState)];
// }

// // Handles command calls from the controller
// function dealWithControllerCommandCalls(data) {
//     console.debug('The data from the controller:');
//     console.debug(data);
// }

// async function getScriptControllerAndSynthesizerFromScorePart(scorePart) {
//     const partName = scorePart.querySelector('part-name').innerHTML.toUpperCase();
//     const playerName = scorePart.querySelector('player-name').innerHTML;

//     const scriptText = filesystem.scripts.find(scriptFile => scriptFile.name === playerName).script;

//     if (!scriptText) {
//         throw new Error('Could not find matching script');
//     }

//     const scriptObj = eval(scriptText);
//     // console.log(scriptObj.controllerState);

//     // The connection to the controller
//     const controller = new Controller(partName);

//     controller.addHandler(isLoopbackCall, makeSendControllerState(scriptObj));
//     controller.addHandler(isCommandCall, dealWithControllerCommandCalls);

//     await controller.createConnection();

//     const synthesizer = new Synthesizer(partName);

//     await synthesizer.createConnection();

//     const result = { scriptText, controller, synthesizer };

//     return result;
// }

// async function loadChart() {
//     const chartText = filesystem.charts[state.chartIndex].body;

//     const parser = new DOMParser();
//     const chart = parser.parseFromString(chartText, 'text/xml');

//     const errorNode = chart.querySelector('parsererror');
//     if (errorNode) {
//         alert('error while parsing');
//         return;
//     }

//     const rawParts = chart.querySelectorAll('score-part');
//     const parts = await Promise.all(Array.from(rawParts).map(getScriptControllerAndSynthesizerFromScorePart));
// }


const player = {
    load(chartToLoad) {
        console.log('loading a song');
    },
    play() {
        console.log('playing');
    },
    resume() {
        console.log('resuming');
    },
    pause() {
        console.log('pausing');
    },
    stop() {
        console.log('stopping');
    },
    transporter: null
}


// const fsm = new Fsm(filesystem.charts, player);

// The connection to the transporter
const transporter = new Transporter(filesystem.charts, player);

// Establishes the MIDI connection
await transporter.createConnection();

console.log(player)

// loadChart();