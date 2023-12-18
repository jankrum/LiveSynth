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

    /**
     * Given a new label for the controller, display it
     * @param {Object} param0 - destructured into index and labelArray
     */
    function applyState({ index, labelArray }) {
        // For newlines
        const labelsForBrowser = labelArray.map(x => x.replace('\n', '<br>'));
        const controllerModules = document.querySelectorAll(MODULE_SELECTOR);
        const moduleDiv = controllerModules[index];
        const knobInput = moduleDiv.querySelector(KNOB_SELECTOR);
        const labelHeader = moduleDiv.querySelector(LABEL_SELECTOR);
        const commandChange = knobInput.getAttribute('command-change');

        knobInput.oninput = () => {
            labelHeader.innerHTML = labelsForBrowser[knobInput.value];
        };

        labelHeader.innerHTML = labelsForBrowser[knobInput.value];

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
                const sysexData = getObjectFromJSONSysex(data);
                sysexData.controllerState.forEach(applyState);
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

    outputToSequencer.send(LOOPBACK_REQUEST);

    function setUpKnob(knobInput) {
        const commandChange = knobInput.getAttribute('command-change');

        knobInput.onchange = () => {
            outputToSequencer.send([CC_HEADER, commandChange, knobInput.value]);
        };
    }

    const knobInputs = document.querySelectorAll(KNOB_SELECTOR);
    knobInputs.forEach(setUpKnob);

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