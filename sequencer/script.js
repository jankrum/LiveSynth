//------------------------ MUTABLE STATE FOR SEQUENCER ------------------------
let playing = false;
let paused = false;
let index = 0;

const timeouts = [];
const currentNotes = [];

const songs = [
    { title: 'Twinkle Twinkle Little Star' },
    { title: 'Trouble' },
    { title: 'Poses' }
]

// //------------------- DEALING WITH MIDI MESSAGES WE RECEIVE -------------------
/**
 * If a MIDI message is a loopback request, send a loopback call back
 * @param {MIDIOutput} outputToTransport
 * @param {Int8Array} data
 */
function dealWithLoopbackRequests(outputToTransport, data) {
    if (isLoopbackRequest(data)) {
        console.debug('Heard a loopback request');
        outputToTransport.send(LOOPBACK_CALL);
        return true;
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
        console.debug('Heard a loopback call');
        sendTransportState(outputToTransport);
        return true;
    }
}

/**
 * If a MIDI message is a command change, use it to update the transport
 * @param {MIDIOutput} outputToTransport
 * @param {Int8Array} data
 */
function dealWithCommandChanges(outputToTransport, outputToSynth, data) {
    if (isCommandCall(data)) {
        console.debug('Heard a command change');
        switch (data[1]) {
            case PREVIOUS_CC:
                playing = false;
                paused = false;
                index -= 1;
                console.debug('Went to the previous song');
                break;
            case PLAY_CC:
                playing = true;
                paused = false;
                console.debug('Started playing');
                break;
            case PAUSE_CC:
                playing = false;
                paused = true;
                console.debug('Paused');
                break;
            case NEXT_CC:
                playing = false;
                paused = false;
                index += 1;
                console.debug('Went to the next song');
                break;
            case STOP_CC:
                playing = false;
                paused = false;
                console.debug('Stopped')
                break;
            default:
                return;
        }

        sendTransportState(outputToTransport);
        return true;
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

    console.debug('MIDI has been set up');
}

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Gets the ports we want, then use them to set up responding to MIDI messages
 */
async function main() {
    const PORTS = [
        { relationship: 'TransportToSequencer', direction: 'inputs' },
        { relationship: 'SequencerToTransport', direction: 'outputs' },
        { relationship: 'SequencerToSynth', direction: 'outputs' }
    ];

    try {
        const [inputFromTransport, outputToTransport, outputToSynth] =
            await getDesiredPorts(PORTS);
        setUpMIDI(inputFromTransport, outputToTransport, outputToSynth);
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

//-------------------------------- START IT UP --------------------------------
window.addEventListener('load', main);