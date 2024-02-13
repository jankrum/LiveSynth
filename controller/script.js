//------------------------ SELECTORS FOR HTML ELEMENTS ------------------------
const CASE_SELECTOR = '.case';
const MODULE_SELECTOR = '.module';
const LABEL_SELECTOR = 'h3';
const KNOB_SELECTOR = 'input';

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Sets up responding to MIDI messages and starts the handshake
 * @param {MIDIInput} inputFromSequencer
 * @param {MIDIOutput} outputToSequencer
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

    // Closure to speed up applyState function
    const controllerModules = document.querySelectorAll(MODULE_SELECTOR);

    /**
     * Given a new label for the controller, display it
     * @param {Object} param0 - destructured into index and labelArray
     */
    function applyState({ index, labelArray }) {
        // For newlines
        const labelsForBrowser = labelArray.map(x => x.replace('\n', '<br>'));
        // The module we are going to apply state to
        const moduleDiv = controllerModules[index];
        // The input we want to value of
        const knobInput = moduleDiv.querySelector(KNOB_SELECTOR);
        // The label we want to change the content of
        const labelHeader = moduleDiv.querySelector(LABEL_SELECTOR);
        // The command change we will send after applying state
        const commandChange = knobInput.getAttribute('command-change');

        // Update label with new label
        knobInput.oninput = () => {
            labelHeader.innerHTML = labelsForBrowser[knobInput.value];
        };

        labelHeader.innerHTML = labelsForBrowser[knobInput.value];

        // Dump state
        outputToSequencer.send([CC_HEADER, commandChange, knobInput.value]);
    }

    /**
    * Take the data from a sysex message then update and unlock the transport
    * @param {Int8Array} data
    */
    function dealWithSysex(data) {
        if (isSysexMessage(data)) {
            console.debug('Heard a sysex message');
            console.log(data);
            try {
                const { controllerState } = getObjectFromJSONSysex(data);
                controllerState.forEach(applyState);
            } catch (error) {
                alert(error.message);
                console.error(error);
            }

            return true;
        }
    }

    inputFromSequencer.onmidimessage = createCallbackFromHandlerFunctions([
        dealWithLoopbackCalls,
        dealWithSysex
    ]);

    function setUpKnob(knobInput) {
        // The command change to send the value under
        const commandChange = knobInput.getAttribute('command-change');

        // When the knob is actually changed, send the value under its cc
        knobInput.onchange = () => {
            outputToSequencer.send([CC_HEADER, commandChange, knobInput.value]);
        };
    }

    const knobInputs = document.querySelectorAll(KNOB_SELECTOR);
    knobInputs.forEach(setUpKnob);

    // Start the LOOPBACK handshake
    outputToSequencer.send(LOOPBACK_REQUEST);

    // Display the case
    const caseDiv = document.querySelector(CASE_SELECTOR);
    caseDiv.style.display = 'block';

    console.debug('MIDI has been set up');
}

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Gets the ports we want, then use them to set up responding to MIDI messages
 */
async function main() {
    const PORTS = [
        { relationship: 'SequencerToController', direction: 'inputs' },
        { relationship: 'ControllerToSequencer', direction: 'outputs' }
    ];

    try {
        const [inputFromSequencer, outputToSequencer] =
            await getDesiredPorts(PORTS);
        setUpMIDI(inputFromSequencer, outputToSequencer);
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

//-------------------------------- START IT UP --------------------------------
window.addEventListener('load', main);