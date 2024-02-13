const MidiConstants = (() => {
    const NOTE_ON = 0x90
    const NOTE_OFF = 0x80;
    const CC_HEADER = 0xB0;
    const SYSEX_HEADER = 0xF0;
    const SYSEX_TERMINATOR = 0xF7;
    const SONG_SELECT_HEADER = 0xF3;
    const FULL = 0x7F;


    const LOOPBACK_REQUEST = [SONG_SELECT_HEADER, 0];
    const LOOPBACK_CALL = [SONG_SELECT_HEADER, FULL];
    const DEVICE_ID = 1;
    const PREVIOUS_CC = 115;
    const PLAY_CC = 116;
    const PAUSE_CC = 117;
    const NEXT_CC = 118;
    const STOP_CC = 119;

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
        STOP_CC
    }
})();