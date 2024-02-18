const state = {
    playing: false,
    paused: false,
    charts: fs.charts,
    chartIndex: 0
};

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

function dealWithCommandCalls(data) {
    switch (data[1]) {
        case MIDI_CONSTANTS.PREVIOUS_CC:
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

    return sendTransportState()
}

async function main() {
    await MidiDevice.initialize();

    // Example usage
    const transporter = new MidiDevice(
        "Transporter to Sequencer",
        "Sequencer to Transporter",
        MIDI_CONSTANTS.LOOPBACK_CALL
    );

    // Add handlers
    transporter.addHandler(MIDI_CONSTANTS.isLoopbackRequest, MIDI_CONSTANTS.sendLoopbackCall);
    transporter.addHandler(MIDI_CONSTANTS.isLoopbackCall, sendTransportState);
    transporter.addHandler(MIDI_CONSTANTS.isCommandCall, dealWithCommandCalls);

    // At this point, you can call createConnection() to establish the MIDI connection
    transporter.createConnection();

    console.log('Done!');
}

window.addEventListener('load', main);