//------------------------ SELECTORS FOR HTML ELEMENTS ------------------------
const SELECTORS = {
    TRANSPORT_DIV: '#transportDiv',
    TRANSPORT_CHILD: '#transportDiv>*',
    TRANSPORT_BUTTON: '.transportButton',
    PREVIOUS_BUTTON: '#prevBtn',
    PLAY_BUTTON: '#playBtn',
    PAUSE_BUTTON: '#pauseBtn',
    NEXT_BUTTON: '#nextBtn',
    STOP_BUTTON: '#stopBtn',
    DISPLAY_TEXT: '#displayText',
    TRANSPORT_STATE_ATTRIBUTE: 'state-key',
    TRANSPORT_ELEMENT_PROPERTY: 'property'
}

//-------------------------------- GLOBAL STATE -------------------------------
let suppressPresses = true;

//-------------------------- SETTING UP THE TRANSPORT -------------------------
/**
 * Have the current state of the transport reflect the state in the arg
 * @param {object} transportState - used to set state for transport
 * @returns
 */
function updateTransport(transportState) {
    function updateElement(transportElement) {
        // An HTML attribute's value that says what we care about from the transport state object
        const stateKey = transportElement.getAttribute(SELECTORS.TRANSPORT_STATE_ATTRIBUTE);
        // The value from transport state SYSEX we are going to apply
        const stateValue = transportState[stateKey];
        // The property we are going to apply the value from state to
        const property = transportElement.getAttribute(SELECTORS.TRANSPORT_ELEMENT_PROPERTY);
        // Assign the value from the state transfer to the element's property
        transportElement[property] = stateValue;
    }

    const transportChildElements = document.querySelectorAll(SELECTORS.TRANSPORT_CHILD);
    transportChildElements.forEach(updateElement);
}

/**
 * Makes buttons send messages when pressed, then makes them wait until response
 * @param {MIDIOutput} outputToSequencer
 */
function setUpTransport(outputToSequencer) {
    function addOnMouseDown(button) {
        // The command change that should be sent for our button
        const commandChange = button.getAttribute('command-change');

        button.onmousedown = () => {
            if (!suppressPresses) {
                outputToSequencer.send([MIDI_CONSTANTS.CC_HEADER, commandChange, MIDI_CONSTANTS.FULL]);
                // Don't accept any more presses until we get a response
                suppressPresses = true;
            }
        }

        button.onmouseup = () => {
            outputToSequencer.send([MIDI_CONSTANTS.CC_HEADER, commandChange, 0]);
        }
    }

    const transportButtons = document.querySelectorAll(SELECTORS.TRANSPORT_BUTTON);
    transportButtons.forEach(addOnMouseDown);

    // Start accepting presses
    suppressPresses = false;
}

/**
* Take the data from a sysex message then update and unlock the transport
* @param {Int8Array} data
*/
function dealWithSysex(data) {
    console.debug('Heard a sysex message');
    const transportState = UTILITIES.getObjectFromJsonSysex(data);
    updateTransport(transportState);
    // Start accepting presses again
    suppressPresses = false;
}

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Shows the transport
 */
function showTransport() {
    const transportDiv = document.querySelector(SELECTORS.TRANSPORT_DIV);
    transportDiv.style.display = 'block';
}

//------------------------------------------------------------------------------------------------------------------------

async function main() {
    await MidiDevice.initialize();

    // Example usage
    const sequencer = new MidiDevice(
        "Sequencer to Transporter",
        "Transporter to Sequencer",
        MIDI_CONSTANTS.LOOPBACK_REQUEST
    );


    // Add handlers
    sequencer.addHandler(MIDI_CONSTANTS.isLoopbackCall, MIDI_CONSTANTS.sendLoopbackCall);
    sequencer.addHandler(MIDI_CONSTANTS.isSysexMessage, dealWithSysex);

    // At this point, you can call createConnection() to establish the MIDI connection
    sequencer.createConnection();

    setUpTransport(sequencer.outputToDevice);

    showTransport();

    console.log('Done!');
}

window.addEventListener('load', main);