import Device from '/namespaces/device.js';
import { CC_HEADER, FULL, isSysexMessage } from '/namespaces/constants.js';
import Sequencer from '/namespaces/sequencer.js';

// Selectors for HTML elements
const SELECTORS = {
    TRANSPORTER_DIV: '#transporterDiv',
    TRANSPORTER_CHILD: '#transporterDiv>*',
    TRANSPORTER_BUTTON: '.transporterButton',
    PREVIOUS_BUTTON: '#prevBtn',
    PLAY_BUTTON: '#playBtn',
    PAUSE_BUTTON: '#pauseBtn',
    NEXT_BUTTON: '#nextBtn',
    STOP_BUTTON: '#stopBtn',
    DISPLAY_TEXT: '#displayText',
    TRANSPORTER_STATE_ATTRIBUTE: 'state-key',
    TRANSPORTER_ELEMENT_PROPERTY: 'property'
}

// Controls when the buttons will be locked
let suppressPresses = true;

// Make the transporter use the information from the sequencer
function updateTransporter(transporterState) {
    function updateElement(transporterElement) {
        // An HTML attribute's value that says what we care about from the transport state object
        const stateKey = transporterElement.getAttribute(SELECTORS.TRANSPORTER_STATE_ATTRIBUTE);
        // The value from transport state SYSEX we are going to apply
        const stateValue = transporterState[stateKey];
        // The property we are going to apply the value from state to
        const property = transporterElement.getAttribute(SELECTORS.TRANSPORTER_ELEMENT_PROPERTY);
        // Assign the value from the state transfer to the element's property
        transporterElement[property] = stateValue;
    }

    const transporterChildElements = document.querySelectorAll(SELECTORS.TRANSPORTER_CHILD);
    transporterChildElements.forEach(updateElement);
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
    const transporterButtons = document.querySelectorAll(SELECTORS.TRANSPORTER_BUTTON);
    transporterButtons.forEach(addOnMouseDown);

    // Start accepting presses
    suppressPresses = false;
}

// Get the data from the SYSEX message and use it to update
function dealWithSysex(data) {
    console.debug('Heard a sysex message');
    const transporterState = Sequencer.getObjectFromJsonSysex(data);
    updateTransporter(transporterState);
    // Start accepting presses again
    suppressPresses = false;

    return false;
}

// Shows the transport
function showTransporter() {
    const transporterDiv = document.querySelector(SELECTORS.TRANSPORTER_DIV);
    transporterDiv.style.display = 'block';
}

// For when the page is loaded
async function main() {
    await Device.initialize();

    // The connection to the sequencer
    const sequencer = new Sequencer('Transporter');

    // Handler functions
    sequencer.addHandler(isSysexMessage, dealWithSysex);

    // Establishes the MIDI connection
    sequencer.createConnection();

    // Can't do this without an initialized outputToDevice
    setUpTransporter(sequencer.outputToDevice);

    // Display transporter for interacting with
    showTransporter();
}

window.addEventListener('load', main);