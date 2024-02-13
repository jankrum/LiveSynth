//------------------------ MUTABLE STATE FOR SEQUENCER ------------------------
// let playing = false;
// let paused = false;
// let index = 0;

// const timeouts = [];
// const currentNotes = [];

// /**
//  * Gets the current state of transport and make a JSON sysex message from it
//  * @returns {Object} transportState
//  */
// function getTransporterState() {
//     const transporterState = {
//         cannotPrevious: index === 0,
//         cannotPlay: playing,
//         cannotPause: !playing,
//         cannotNext: index === (songs.length - 1),
//         cannotStop: !playing && !paused,
//         songTitle: songs[index].title
//     }
//     return transporterState;
// }

// /**
//  * Sends the current state of the transport as a sysex message
//  * @param {MIDIOutput} outputToTransporter
//  */
// function sendTransporterState(outputToTransporter) {
//     const transporterState = getTransporterState();
//     const sysexMessage = makeJSONSysexMessage(transporterState);
//     outputToTransporter.send(sysexMessage);
// }

// /**
//  * If a MIDI message is a command change, use it to update the transport
//  * @param {MIDIOutput} outputToTransporter
//  * @param {MIDIOutput} outputToTransporter
//  * @param {Int8Array} data
//  */
// function dealWithTransporterCommandChanges(outputToTransporter, outputToSynthesizer, data) {
//     if (isCommandCall(data)) {
//         console.debug('Heard a command change');
//         switch (data[1]) {
//             case PREVIOUS_CC:
//                 playing = false;
//                 paused = false;
//                 index -= 1;
//                 console.debug('Went to the previous song');
//                 break;
//             case PLAY_CC:
//                 playing = true;
//                 paused = false;
//                 console.debug('Started playing');
//                 break;
//             case PAUSE_CC:
//                 playing = false;
//                 paused = true;
//                 console.debug('Paused');
//                 break;
//             case NEXT_CC:
//                 playing = false;
//                 paused = false;
//                 index += 1;
//                 console.debug('Went to the next song');
//                 break;
//             case STOP_CC:
//                 playing = false;
//                 paused = false;
//                 console.debug('Stopped');
//                 break;
//             default:
//                 return;
//         }

//         sendTransporterState(outputToTransporter);
//         return true;
//     }
// }

// /**
//  * Sets up responding to MIDI messages and starts the handshake
//  * @param {MIDIInput} inputFromTransporter
//  * @param {MIDIOutput} outputToTransporter
//  */
// function setUpTransporter(inputFromTransporter, outputToTransporter) {
//     function dealWithLoopbackRequests(data) {
//         if (isLoopbackRequest(data)) {
//             console.debug('Heard a loopback request from the transporter');
//             output.send(LOOPBACK_CALL);
//             return true;
//         }
//     }

//     function dealWithLoopbackCalls(data) {
//         if (isLoopbackCall(data)) {
//             console.debug('Heard a loopback call from the transporter');
//             // This is where I would dump transporter state
//             return true;
//         }
//     }

//     function dealWithCommandChanges(data) {
//         if (isCommandCall(data)) {
//             console.debug('Command Change Data (transporter):');
//             console.debug(data);
//             // This is where I would implement transport controls
//             return true;
//         }
//     }

//     inputFromTransporter.onmidimessage = createCallbackFromHandlerFunctions([
//         dealWithLoopbackRequests,
//         dealWithLoopbackCalls,
//         dealWithCommandChanges
//     ]);

//     outputToTransporter.send(LOOPBACK_CALL);

//     console.debug('Dealing with the transporter has been set up');
// }

// function makeControllerState() {
//     const controllerStates = Array(12).fill().map((_, index) => ({ index, labelArray: Array(128).fill().map((__, value) => `Controller: ${index}\nValue: ${value}`) }));
//     return controllerStates;
// }

/**
 * Sets up responding to MIDI messages and starts the handshake
 * @param {MIDIInput} inputFromController
 * @param {MIDIOutput} outputToController
 */
function setUpMIDI(inputFromController, outputToController) {
    function dealWithLoopbackRequests(data) {
        if (isLoopbackRequest(data)) {
            console.debug('Heard a loopback request from the controller');
            outputToController.send(LOOPBACK_CALL);
            return true;
        }
    }

    function dealWithLoopbackCalls(data) {
        if (isLoopbackCall(data)) {
            console.debug('Heard a loopback call from the controller');
            const controllerState = makeControllerState();
            const controllerStateSysex = makeJSONSysexMessage({ controllerState });
            outputToController.send(controllerStateSysex);
            return true;
        }
    }

    function dealWithCommandChanges(data) {
        if (isCommandCall(data)) {
            console.debug('Command Change Data (controller):');
            console.debug(data);
            return true;
        }
    }

    inputFromController.onmidimessage = createCallbackFromHandlerFunctions([
        dealWithLoopbackRequests,
        dealWithLoopbackCalls,
        dealWithCommandChanges
    ]);

    outputToController.send(LOOPBACK_CALL);

    console.debug('Dealing with the controller has been set up');
}

//------------------------ FOR WHEN THE PAGE IS LOADED ------------------------
/**
 * Gets the ports we want, then use them to set up responding to MIDI messages
 */
async function main() {
    const PORTS = [
        { relationship: 'TransporterToSequencer', direction: 'inputs' },
        { relationship: 'SequencerToTransporter', direction: 'outputs' }
    ];

    try {
        const [
            inputFromTransporter,
            outputToTransporter
        ] = await getDesiredPorts(PORTS);
        setUpMIDI(inputFromTransporter, outputToTransporter);
        console.log('%cAll set up!', 'background-color: green;');
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

//-------------------------------- START IT UP --------------------------------
window.addEventListener('load', main);