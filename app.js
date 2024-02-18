async function main() {
    await MidiDevice.initialize();

    // Example usage
    const midiDevice = new MidiDevice("o2b", "b2o", () => [MIDI_CONSTANTS.NOTE_OFF, 60, 0]);

    // Example handler functions
    const noteOnPredicate = data => data[0] === 144; // MIDI note on message
    const noteOnResponse = data => [MIDI_CONSTANTS.NOTE_ON, data[1], MIDI_CONSTANTS.FULL]; // Increase velocity

    const noteOffPredicate = data => data[0] === 128; // MIDI note off message
    const noteOffResponse = data => [MIDI_CONSTANTS.NOTE_OFF, data[1], 0]; // Set velocity to 0

    // Add handlers
    midiDevice.addHandler(noteOnPredicate, noteOnResponse);
    midiDevice.addHandler(noteOffPredicate, noteOffResponse);

    // At this point, you can call createConnection() to establish the MIDI connection
    midiDevice.createConnection();

    console.log('Done!');
}

window.addEventListener('load', main);