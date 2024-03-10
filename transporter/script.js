import { CC_HEADER, FULL, isSysexMessage } from '/namespaces/constants.js';
import { getObjectFromJsonSysex } from '/namespaces/utilities.js';
import Sequencer from '/namespaces/sequencer.js';

function getElements(namesAndSelectors) {
    const result = {};

    for (const [name, selector] of Object.entries(namesAndSelectors)) {
        const allElements = document.querySelectorAll(selector);

        if (allElements.length) {
            result[name] = allElements.length > 1 ? allElements : allElements[0];
        }
    }

    return result;
}

// Selectors for HTML elements
const elements = getElements({
    TRANSPORTER_DIV: '#transporterDiv',
    TRANSPORTER_CHILD: '#transporterDiv>*',
    TRANSPORTER_BUTTONS: '.transporterButton',
    PREVIOUS_BUTTON: '#prevBtn',
    PLAY_BUTTON: '#playBtn',
    PAUSE_BUTTON: '#pauseBtn',
    NEXT_BUTTON: '#nextBtn',
    STOP_BUTTON: '#stopBtn',
    DISPLAY_TEXT: '#displayText'
});

// Controls when the buttons will be locked
let suppressPresses = true;

// Get the data from the SYSEX message and use it to update
function dealWithSysex(data) {
    const transporterState = getObjectFromJsonSysex(data);

    elements.PREVIOUS_BUTTON.disabled = !transporterState.canPrevious;
    elements.PLAY_BUTTON.disabled = transporterState.state === 'playing';
    elements.PAUSE_BUTTON.disabled = transporterState.state === 'paused' || transporterState.state === 'stopped';
    elements.NEXT_BUTTON.disabled = !transporterState.canNext;
    elements.STOP_BUTTON.disabled = transporterState.state === 'stopped';
    elements.DISPLAY_TEXT.innerHTML = transporterState.title;

    // Start accepting presses again
    suppressPresses = false;
}

// Makes the transporter send MIDI CC's when clicked on
function setUpTransporter(outputToSequencer) {
    function addOnMouseDown(button) {
        // The command change that should be sent for our button
        const commandChange = button.getAttribute('command-change');

        button.onmousedown = () => {
            // Don't send anything if we haven't gotten a response
            if (!suppressPresses) {
                outputToSequencer.send([CC_HEADER, commandChange, FULL]);
                // Don't accept any more presses until we get a response
                suppressPresses = true;
            }
        }

        // Let the controller know when we have released it (this doesn't really do anything)
        button.onmouseup = () => {
            outputToSequencer.send([CC_HEADER, commandChange, 0]);
        }
    }

    // Apply this to all the transporter's buttons
    const transporterButtons = elements.TRANSPORTER_BUTTONS;
    transporterButtons.forEach(addOnMouseDown);

    // Start accepting presses
    suppressPresses = false;
}

// The connection to the sequencer
const sequencer = new Sequencer('Transporter');

// Handler functions
sequencer.addHandler(isSysexMessage, dealWithSysex);

// Establishes the MIDI connection
sequencer.createConnection();

// Can't do this without an initialized outputToDevice
setUpTransporter(sequencer.outputToDevice);

// Display transporter for interacting with
const transporterDiv = elements.TRANSPORTER_DIV;
transporterDiv.style.display = 'block';