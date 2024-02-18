// The mutable state for the sequencer
const state = {
    playing: false,
    paused: false,
    charts: fs.charts,
    chartIndex: 0
};

// Calculates and returns a MIDI sysex message containing
// a JSON obj representing the state for the transport
function sendTransportState() {
    const stateToSend = {
        cannotPrevious: state.chartIndex <= 0,
        cannotPlay: state.playing,
        cannotPause: !state.playing,
        cannotNext: state.chartIndex >= (state.charts.length - 1),
        cannotStop: !state.playing && !state.paused,
        songTitle: state.charts[state.chartIndex].title
    };

    return UTILITIES.makeJsonSysexMessage(stateToSend);
}

// Deals with button presses
function dealWithTransporterButtonPresses(data) {
    switch (data[1]) {
        case MIDI_CONSTANTS.PREVIOUS_CC:
            // Checks to make sure we aren't on the first chart
            if (state.chartIndex > 0) {
                state.playing = false;
                state.paused = false;
                state.chartIndex -= 1;
            }
            break;
        case MIDI_CONSTANTS.PLAY_CC:
            state.playing = true;
            state.paused = false;
            break;
        case MIDI_CONSTANTS.PAUSE_CC:
            state.playing = false;
            state.paused = true;
            break;
        case MIDI_CONSTANTS.NEXT_CC:
            // Checks to make sure we aren't on the last chart
            if (state.chartIndex < state.charts.length - 1) {
                state.playing = false;
                state.paused = false;
                state.chartIndex += 1;
            }
            break;
        case MIDI_CONSTANTS.STOP_CC:
            state.playing = false;
            state.paused = false;
            break;
    }

    // Send new state
    return sendTransportState();
}

// Calculates state for controller
function sendControllerState() {
    const controllerState = Array(12).fill().map((_, ind1) => {
        const result = {
            index: ind1,
            labelArray: Array(128).fill().map((__, ind2) => `Module #${ind1 + 1}\nValue: ${ind2}!`)
        }

        return result;
    })

    return UTILITIES.makeJsonSysexMessage({ controllerState });
}

// Handles command calls from the controller
function dealWithControllerCommandCalls(data) {
    console.debug('The data from the controller:');
    console.debug(data);
}


// For when the page is loaded
async function main() {
    await MidiDevice.initialize();

    // The connection to the transporter
    const transporter = new MidiDevice(
        "Transporter to Sequencer",
        "Sequencer to Transporter",
        MIDI_CONSTANTS.LOOPBACK_CALL
    );

    // The connection to the controller
    const controller = new MidiDevice(
        "Controller to Sequencer",
        "Sequencer to Controller",
        MIDI_CONSTANTS.LOOPBACK_CALL
    );

    // Handler functions
    transporter.addHandler(MIDI_CONSTANTS.isLoopbackRequest, MIDI_CONSTANTS.sendLoopbackCall);
    transporter.addHandler(MIDI_CONSTANTS.isLoopbackCall, sendTransportState);
    transporter.addHandler(MIDI_CONSTANTS.isButtonPress, dealWithTransporterButtonPresses);

    controller.addHandler(MIDI_CONSTANTS.isLoopbackRequest, MIDI_CONSTANTS.sendLoopbackCall);
    controller.addHandler(MIDI_CONSTANTS.isLoopbackCall, sendControllerState);
    controller.addHandler(MIDI_CONSTANTS.isCommandCall, dealWithControllerCommandCalls);

    // Establishes the MIDI connection
    transporter.createConnection();
    controller.createConnection();
}

window.addEventListener('load', main);