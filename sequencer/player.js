// import Controller from './controller.js';
// import Synthesizer from './synthesizer.js';

// Calculates state for controller
function makeSendControllerState(controllerState) {
    return _ => [RESET, ...Device.makeJsonSysexMessage(controllerState)];
}

// Handles command calls from the controller
function dealWithControllerCommandCalls(data) {
    console.debug('The data from the controller:');
    console.debug(data);
}

async function getScriptControllerAndSynthesizerFromScorePart(scorePart) {

    const scriptText = filesystem.scripts.find(scriptFile => scriptFile.name === playerName).script;

    if (!scriptText) {
        throw new Error('Could not find matching script');
    }

    const scriptObj = eval(scriptText);
    // console.log(scriptObj.controllerState);

    // The connection to the controller
    const controller = new Controller(partName);

    controller.addHandler(isLoopbackCall, makeSendControllerState(scriptObj));
    controller.addHandler(isCommandCall, dealWithControllerCommandCalls);

    await controller.createConnection();

    const synthesizer = new Synthesizer(partName);

    await synthesizer.createConnection();

    const result = { scriptText, controller, synthesizer };

    return result;
}

export default class Player {
    constructor(scripts) {
        this.scripts = scripts;
        this.transporter = null;
        this.controllers = {};
        this.synthesizers = {};
    }

    async load(chartToLoad) {
        console.log('loading');
        return;

        const chartText = chartToLoad.body;

        const parser = new DOMParser();
        const chart = parser.parseFromString(chartText, 'text/xml');

        const errorNode = chart.querySelector('parsererror');
        if (errorNode) {
            alert('error while parsing');
            return;
        }

        const rawParts = chart.querySelectorAll('score-part');

        for (const rawPart of rawParts) {
            const partName = rawPart.querySelector('part-name').innerHTML.toUpperCase();
            const playerName = rawPart.querySelector('player-name').innerHTML;

            if (Object.hasOwn(possibleTransitions, actionName)) {
                return await possibleTransitions[actionName]();
            }

            console.log({ partName, playerName });
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