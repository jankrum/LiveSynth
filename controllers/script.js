import Device from '/namespaces/device.js';
import { isReset, CC_HEADER, isSysexMessage } from '/namespaces/constants.js';
import Sequencer from '/namespaces/sequencer.js';

// Selectors for HTML elements
const SELECTORS = {
    PART_NAME: '#part',
    CASE: '.case',
    MODULE: '.module',
    LABEL: 'h3',
    KNOB: 'input'
};

function resetController() {
    const controllerModules = document.querySelectorAll(SELECTORS.MODULE);

    function clearController(controllerToClear) {
        // The input we want to value of
        const knobInput = controllerToClear.querySelector(SELECTORS.KNOB);
        // The label we want to change the content of
        const labelHeader = controllerToClear.querySelector(SELECTORS.LABEL);

        // Update label with new label
        knobInput.oninput = () => { };

        labelHeader.innerHTML = '';
    }

    controllerModules.forEach(clearController);

}


// For a SYSEX message, get the changes we need to make, and make them
function dealWithSysex(data) {
    const { controllerState } = Sequencer.getObjectFromJsonSysex(data);

    // Not what we iterate over, but a closure for the applyState func
    const controllerModules = document.querySelectorAll(SELECTORS.MODULE);

    function scale(x, out_min, out_max) {
        return Math.round(x * (out_max - out_min) / 127 + out_min);
    }

    function applyState(labelData, index) {
        let labelArray = [];

        let prefix = labelData?.prefix || '';
        let suffix = labelData?.suffix || '';

        if ('options' in labelData) {
            for (let i = 0; i < 128; i += 1) {
                const scaledI = scale(i, 0, labelData.options.length - 1);
                const newLabel = prefix + labelData.options[scaledI] + suffix;
                labelArray.push(newLabel);
            }
        } else {
            for (let i = 0; i < 128; i += 1) {
                const scaledI = scale(i, labelData.min, labelData.max)
                const newLabel = prefix + scaledI + suffix;
                labelArray.push(newLabel);
            }
        }

        // For newlines
        const labelsForBrowser = labelArray.map(x => x.replace('\n', '<br>'));
        // The module we are going to apply state to
        const moduleDiv = controllerModules[index];
        // The input we want to value of
        const knobInput = moduleDiv.querySelector(SELECTORS.KNOB);
        // The label we want to change the content of
        const labelHeader = moduleDiv.querySelector(SELECTORS.LABEL);

        // Update label with new label
        knobInput.oninput = () => {
            labelHeader.innerHTML = labelsForBrowser[knobInput.value];
        };

        labelHeader.innerHTML = labelsForBrowser[knobInput.value];
    }

    // For all the controller states in the arg, update the corresponding moudle
    controllerState.forEach(applyState);
}

// Make the controller actually transmit MIDI messages
function setUpController(outputToSequencer) {
    // Make a given knob actually transmit cc messages
    function setUpKnob(knobInput) {
        // The command change to send the value under
        const commandChange = knobInput.getAttribute('command-change');

        // When the knob is actually changed, send the value under its cc
        knobInput.onchange = () => {
            outputToSequencer.send([CC_HEADER, commandChange, knobInput.value]);
        };
    }

    // Iterate over the knobs
    const knobInputs = document.querySelectorAll(SELECTORS.KNOB);
    knobInputs.forEach(setUpKnob);
}

// Shows the controller
function showController() {
    const caseDiv = document.querySelector(SELECTORS.CASE);
    caseDiv.style.display = 'block';
}

// For when the page is loaded
async function main() {
    await Device.initialize();

    const partName = document.querySelector(SELECTORS.PART_NAME).innerText.toUpperCase();
    const sourceName = partName + "Controller";

    // The connection to the sequencer
    const sequencer = new Sequencer(sourceName);

    // Handler functions
    sequencer.addHandler(isSysexMessage, dealWithSysex);
    sequencer.addHandler(isReset, resetController);

    // Establishes the MIDI connection
    sequencer.createConnection();

    // Can't do this without an initialized outputToDevice
    setUpController(sequencer.outputToDevice);

    // Display controller for interacting with
    showController();
}

window.addEventListener('load', main);