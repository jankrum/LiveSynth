const MIDI_CONSTANTS = (() => {
    // Things defined in the MIDI spec
    const NOTE_ON = 0x90
    const NOTE_OFF = 0x80;
    const CC_HEADER = 0xB0;
    const SYSEX_HEADER = 0xF0;
    const SYSEX_TERMINATOR = 0xF7;
    const SONG_SELECT_HEADER = 0xF3;
    const FULL = 0x7F;

    // THINGS I MADE UP BECAUSE IM EVIL AS HELL
    const LOOPBACK_REQUEST = [SONG_SELECT_HEADER, 0];
    const LOOPBACK_CALL = [SONG_SELECT_HEADER, FULL];
    const DEVICE_ID = 1;
    const PREVIOUS_CC = 115;
    const PLAY_CC = 116;
    const PAUSE_CC = 117;
    const NEXT_CC = 118;
    const STOP_CC = 119;

    // Static methods that are better off written here
    const isLoopbackRequest = data => data[0] === LOOPBACK_REQUEST[0] && data[1] === LOOPBACK_REQUEST[1];
    const isLoopbackCall = data => data[0] === LOOPBACK_CALL[0] && data[1] === LOOPBACK_CALL[1];
    const isSysexMessage = data => data[0] === SYSEX_HEADER && data[1] === DEVICE_ID;
    const isCommandCall = data => data[0] === CC_HEADER;
    const isButtonPress = data => data[0] === CC_HEADER && data[2] === FULL;
    const sendLoopbackRequest = _ => LOOPBACK_REQUEST;
    const sendLoopbackCall = _ => LOOPBACK_CALL;

    return {
        NOTE_ON,
        NOTE_OFF,
        CC_HEADER,
        SYSEX_HEADER,
        SYSEX_TERMINATOR,
        SONG_SELECT_HEADER,
        FULL,
        LOOPBACK_REQUEST,
        LOOPBACK_CALL,
        DEVICE_ID,
        PREVIOUS_CC,
        PLAY_CC,
        PAUSE_CC,
        NEXT_CC,
        STOP_CC,
        isLoopbackRequest,
        isLoopbackCall,
        isSysexMessage,
        isCommandCall,
        isButtonPress,
        sendLoopbackRequest,
        sendLoopbackCall
    };
})();