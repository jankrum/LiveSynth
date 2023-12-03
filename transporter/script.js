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

//---------------------------- SHORTHAND FUNCTIONS ----------------------------
/**
 * Makes it easier to query select
 * @param {String} selector
 * @returns {object} element
 */
function getHTML(selector) {
    return document.querySelector(selector);
}

/**
 * Makes it easier to query select all
 * @param {String} selector
 * @returns {object} element
 */
function getAllHTML(selector) {
    return document.querySelectorAll(selector);
}

//------------------- DEALING WITH MIDI MESSAGES WE RECEIVE -------------------
/**
 * Responds to loopback calls with a loopback call, for the handshake
 * @param {Int8Array} data
 */
function dealWithLoopbackCalls(outputToSequencer, data) {
    if (isLoopbackCall(data)) {
        console.debug('Heard a loopback call');
        outputToSequencer.send(LOOPBACK_CALL);
        return true;
    }
}

//-------------------------- SETTING UP THE TRANSPORT -------------------------
/**
 * Have the current state of the transport reflect the state in the arg
 * @param {object} transportState - used to set state for transport
 * @returns
 */
function updateTransport(transportState) {
    const transportChildElements = getAllHTML(TRANSPORT_CHILD_SEL);

    function updateElement(transportElement) {
        const stateKey = transportElement.getAttribute('state-key');
        const stateValue = transportState[stateKey];
        const property = transportElement.getAttribute('property');

        transportElement[property] = stateValue;
    }

    transportChildElements.forEach(updateElement);
}

/**
 * So you cannot send another message until we have received one back
 */
function disableTransport() {
    const transportButtons = getAllHTML(TRANSPORT_BUTTON_SEL);

    function removeOnMouseDown(button) {
        button.addOnMouseDown = null;
    }

    transportButtons.forEach(removeOnMouseDown);
}

/**
 * Makes buttons send messages when pressed, then makes them wait until response
 * @param {MIDIOutput} outputToSequencer
 */
function enableTransport(outputToSequencer) {
    const transportButtons = getAllHTML(TRANSPORT_BUTTON_SEL);

    function addOnMouseDown(button) {
        const commandChange = button.getAttribute('command-change');
        button.onmousedown = () => {
            outputToSequencer.send([CC_HEADER, commandChange, FULL]);
            disableTransport();
        }
    }

    transportButtons.forEach(addOnMouseDown);
}

/**
 * Take the data from a sysex message then update and unlock the transport
 * @param {Int8Array} data
 */
function dealWithSysex(outputToSequencer, data) {
    if (isSysexMessage(data)) {
        console.debug('Heard a sysex message');
        const transportState = getObjectFromJSONSysex(data);
        updateTransport(transportState);
        enableTransport(outputToSequencer);
        return true;
    }
}

/**
 * Sets up responding to MIDI messages and starts the handshake
 * @param {MIDIInput} inputFromSequencer
 * @param {MIDIOutput} outputToSequencer
 * @param {MIDIOutput} outputToSynth
 */
function setUpMIDI(inputFromTransport, outputToSequencer) {
    const handlerFunctions = [
        data => dealWithLoopbackCalls(outputToSequencer, data),
        data => dealWithSysex(outputToSequencer, data)
    ];

    inputFromTransport.onmidimessage = createCallbackFromHandlerFunctions(handlerFunctions);

    outputToSequencer.send(LOOPBACK_REQUEST);

    console.debug('MIDI has been set up');
}

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * So each button will have its trivial mouseup callback
 * @param {MIDIOutput} outputToSequencer
 */
function setUpButtons(outputToSequencer) {
    const transportButtons = getAllHTML(TRANSPORT_BUTTON_SEL);

    function addOnMouseUp(button) {
        const commandChange = button.getAttribute('command-change');
        button.onmouseup = () => { outputToSequencer.send([CC_HEADER, commandChange, 0]); }
    }

    transportButtons.forEach(addOnMouseUp);
}

/**
 * Shows the transport
 */
function showTransport() {
    const transport = getHTML(TRANSPORT_DIV_SEL);
    transport.style.display = 'block';
}


/**
 * Gets the ports we want, then use them to set up responding to MIDI messages
 */
async function main() {
    const PORTS = [
        { relationship: 'SequencerToTransport', direction: 'inputs' },
        { relationship: 'TransportToSequencer', direction: 'outputs' }
    ];

    try {
        const [inputFromSequencer, outputToSequencer] =
            await getDesiredPorts(PORTS);
        setUpMIDI(inputFromSequencer, outputToSequencer);
        setUpButtons(outputToSequencer);
        showTransport();
    } catch (error) {
        alert(error.message);
        console.log(error);
    }
}

//-------------------------------- START IT UP --------------------------------
window.addEventListener('load', main);