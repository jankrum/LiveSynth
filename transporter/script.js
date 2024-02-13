//------------------------ SELECTORS FOR HTML ELEMENTS ------------------------
const TRANSPORT_DIV_SEL = '#transportDiv';
const TRANSPORT_CHILD_SEL = '#transportDiv>*';
const TRANSPORT_BUTTON_SEL = '.transportButton';
const PREVIOUS_BUTTON_SEL = '#prevBtn';
const PLAY_BUTTON_SEL = '#playBtn';
const PAUSE_BUTTON_SEL = '#pauseBtn';
const NEXT_BUTTON_SEL = '#nextBtn';
const STOP_BUTTON_SEL = '#stopBtn';
const DISPLAY_TEXT_SEL = '#displayText';
const TRANSPORT_STATE_ATTRIBUTE_SELECTOR = 'state-key';
const TRANSPORT_ELEMENT_PROPERTY_SELECTOR = 'property';

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
        const stateKey = transportElement.getAttribute(TRANSPORT_STATE_ATTRIBUTE_SELECTOR);
        // The value from transport state SYSEX we are going to apply
        const stateValue = transportState[stateKey];
        // The property we are going to apply the value from state to
        const property = transportElement.getAttribute(TRANSPORT_ELEMENT_PROPERTY_SELECTOR);
        // Assign the value from the state transfer to the element's property
        transportElement[property] = stateValue;
    }

    const transportChildElements = document.querySelectorAll(TRANSPORT_CHILD_SEL);
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
                outputToSequencer.send([CC_HEADER, commandChange, FULL]);
                // Don't accept any more presses until we get a response
                suppressPresses = true;
            }
        }

        button.onmouseup = () => {
            outputToSequencer.send([CC_HEADER, commandChange, 0]);
        }
    }

    const transportButtons = document.querySelectorAll(TRANSPORT_BUTTON_SEL);
    transportButtons.forEach(addOnMouseDown);

    // Start accepting presses
    suppressPresses = false;
}

/**
 * Sets up responding to MIDI messages and starts the handshake
 * @param {MIDIInput} inputFromSequencer
 * @param {MIDIOutput} outputToSequencer
 * @param {MIDIOutput} outputToSynth
 */
function setUpMIDI(inputFromSequencer, outputToSequencer) {
    /**
    * Responds to loopback calls with a loopback call, for the handshake
    * @param {Int8Array} data
    */
    function dealWithLoopbackCalls(data) {
        if (isLoopbackCall(data)) {
            console.debug('Heard a loopback call');
            outputToSequencer.send(LOOPBACK_CALL);
            return true;
        }
    }

    /**
    * Take the data from a sysex message then update and unlock the transport
    * @param {Int8Array} data
    */
    function dealWithSysex(data) {
        if (isSysexMessage(data)) {
            console.debug('Heard a sysex message');
            const transportState = getObjectFromJSONSysex(data);
            updateTransport(transportState);
            // Start accepting presses again
            suppressPresses = false;
            return true;
        }
    }

    inputFromSequencer.onmidimessage = createCallbackFromHandlerFunctions([
        dealWithLoopbackCalls,
        dealWithSysex
    ]);

    outputToSequencer.send(LOOPBACK_REQUEST);

    console.debug('MIDI has been set up');
}

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Shows the transport
 */
function showTransport() {
    const transportDiv = document.querySelector(TRANSPORT_DIV_SEL);
    transportDiv.style.display = 'block';
}


/**
 * Gets the ports we want, then use them to set up responding to MIDI messages
 */
async function main() {
    const PORTS = [
        { relationship: 'SequencerToTransporter', direction: 'inputs' },
        { relationship: 'TransporterToSequencer', direction: 'outputs' }
    ];

    try {
        const [inputFromSequencer, outputToSequencer] =
            await getDesiredPorts(PORTS);
        setUpMIDI(inputFromSequencer, outputToSequencer);
        showTransport();
    } catch (error) {
        alert(error.message);
        console.log(error);
    }
}

//-------------------------------- START IT UP --------------------------------
window.addEventListener('load', main);