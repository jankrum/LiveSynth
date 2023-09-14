//------------------------ IMPORTS FROM THE GENERIC.JS ------------------------
const {
    isLoopbackRequest,
    LOOPBACK_CALL,
    isLoopbackCall,
    makeJSONSysexMessage,
    isCommandCall,
    PREVIOUS_CC,
    PLAY_CC,
    PAUSE_CC,
    NEXT_CC,
    STOP_CC,
    createCallbackFromHandlerFunctions,
    getDesiredPorts
} = Exports;

//------------------------ MUTABLE STATE FOR SEQUENCER ------------------------
let playing = false;
let paused = false;
let index = 0;

const timeouts = [];
const currentNotes = [];


//------------------- DEALING WITH MIDI MESSAGES WE RECEIVE -------------------
/**
 * If a MIDI message is a loopback request, send a loopback call back
 * @param {Int8Array} data 
 */
function dealWithLoopbackRequests(outputToTransport, data) {
    // console.log(data);
    if (isLoopbackRequest(data)) {
        // console.log('Heard a loopback request');
        outputToTransport.send(LOOPBACK_CALL);
    }
}

/**
 * Gets the current state of transport and make a JSON sysex message from it
 * @returns {Object} transportState
 */
function getTransportState() {
    const transportState = {
        cannotPrevious: index === 0,
        cannotPlay: playing,
        cannotPause: !playing,
        cannotNext: index === (songs.length - 1),
        cannotStop: !playing && !paused,
        songTitle: songs[index].title
    }
    return transportState;
}

/**
 * Sends the current state of the transport as a sysex message
 * @param {MIDIOutput} outputToTransport 
 */
function sendTransportState(outputToTransport) {
    const transportState = getTransportState();
    const sysexMessage = makeJSONSysexMessage(transportState);
    outputToTransport.send(sysexMessage);
}

/**
 * If a MIDI message is a loopback call, send the transport state
 * @param {MIDIOutput} outputToTransport
 * @param {Int8Array} data 
 */
function dealWithLoopbackCalls(outputToTransport, data) {
    if (isLoopbackCall(data)) {
        // console.log('Heard a loopback call');
        sendTransportState(outputToTransport);
    }
}

/**
 * If a MIDI message is a command change, use it to update the transport
 * @param {MIDIOutput} outputToTransport
 * @param {Int8Array} data
 */
function dealWithCommandChanges(outputToTransport, outputToSynth, data) {
    if (isCommandCall(data)) {
        // console.log('Heard a command change');
        switch (data[1]) {
            case PREVIOUS_CC:
                index -= 1;
                console.log('Went to the previous song');
                break;
            case PLAY_CC:
                playing = true;
                paused = false;
                console.log('Started playing');
                break;
            case PAUSE_CC:
                playing = false;
                paused = true;
                console.log('Paused');
                break;
            case NEXT_CC:
                index += 1;
                console.log('Went to the next song');
                break;
            case STOP_CC:
                playing = false;
                paused = false;
                console.log('Stopped')
                break;
            default:
                return;
        }

        sendTransportState(outputToTransport);
    }
}

/**
 * Sets up responding to MIDI messages and starts the handshake
 * @param {MIDIInput} inputFromSequencer 
 * @param {MIDIOutput} outputToSequencer 
 * @param {MIDIOutput} outputToSynth
 */
function setUpMIDI(inputFromTransport, outputToTransport, outputToSynth) {
    const handlerFunctions = [
        data => dealWithLoopbackRequests(outputToTransport, data),
        data => dealWithLoopbackCalls(outputToTransport, data),
        data => dealWithCommandChanges(outputToTransport, outputToSynth, data)
    ];

    inputFromTransport.onmidimessage = createCallbackFromHandlerFunctions(handlerFunctions);

    outputToTransport.send(LOOPBACK_CALL);

    // console.log('MIDI has been set up');
}


//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Gets the ports we want, then use them to set up responding to MIDI messages
 */
async function main() {
    const PORTS = [
        { portName: 'TransportToSequencer', direction: 'inputs' },
        { portName: 'SequencerToTransport', direction: 'outputs' },
        { portName: 'SequencerToSynth', direction: 'outputs' }
    ];

    try {
        const [inputFromTransport, outputToTransport, outputToSynth] = await getDesiredPorts(PORTS);
        setUpMIDI(inputFromTransport, outputToTransport, outputToSynth);
    } catch (error) {
        alert(error);
    }
}

window.addEventListener('load', main);