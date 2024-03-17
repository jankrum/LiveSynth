// import Controller from './controller.js';
// import Synthesizer from './synthesizer.js';

function parseXml(xmlToParse) {
    const parser = new DOMParser();
    const parsedXml = parser.parseFromString(xmlToParse, 'text/xml');

    const errorNode = parsedXml.querySelector('parsererror');
    if (errorNode) {
        throw new Error('Error parsing XML');
    }

    return parsedXml;
}

function extractPartAndPlayerName(part) {
    const partNameObj = part.querySelector('part-name');
    const playerNameObj = part.querySelector('player-name').innerHTML;

    if (!partNameObj) {
        throw new Error('Chart missing part name');
    }

    if (!playerNameObj) {
        throw new Error('Chart missing player name');
    }

    const partAndPlayerName = {
        partName: partNameObj.innerHTML.toUpperCase(),
        playerName: playerNameObj.innerHTML
    };

    return partAndPlayerName;
}

function getPartAndPlayerNames(chartObj) {
    const parts = chartObj.querySelectorAll('score-part');

    if (parts.length === 0) {
        throw new Error('No parts found in chart!');
    }

    const partAndPlayerNames = parts.map(extractPartAndPlayerName);

    return partAndPlayerNames;
}

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

export default class Leader {
    constructor(scripts) {
        this.scripts = scripts;
        this.transporter = null;
        this.controllers = {};
        this.synthesizers = {};
    }

    async load(chartToLoad) {
        try {
            const chartText = chartToLoad.body;

            const chart = parseXml(chartText);

            const partAndPlayerNames = getPartAndPlayerNames(chart);

        } catch (err) {
            console.error(err);
        }
    }

    async play() {
        console.log('playing');
    }

    async resume() {
        console.log('resuming');
    }

    async pause() {
        console.log('pausing');
    }

    async stop() {
        console.log('stopping');
    }
}