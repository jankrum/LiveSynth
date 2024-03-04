// Things defined in the MIDI specification
export const NOTE_ON = 0x90
export const NOTE_OFF = 0x80;
export const CC_HEADER = 0xB0;
export const SYSEX_HEADER = 0xF0;
export const SYSEX_TERMINATOR = 0xF7;
export const SONG_SELECT_HEADER = 0xF3;
export const FULL = 0x7F;
export const RESET = 0xFF;

// Things just I made up because I'm evil as FUCK
export const LOOPBACK_REQUEST = [SONG_SELECT_HEADER, 0];
export const LOOPBACK_CALL = [SONG_SELECT_HEADER, FULL];
export const DEVICE_ID = 1;
export const PREVIOUS_CC = 115;
export const PLAY_CC = 116;
export const PAUSE_CC = 117;
export const NEXT_CC = 118;
export const STOP_CC = 119;

// Static methods that are better off written here
export const isLoopbackRequest = data => data[0] === LOOPBACK_REQUEST[0] && data[1] === LOOPBACK_REQUEST[1];
export const isLoopbackCall = data => data[0] === LOOPBACK_CALL[0] && data[1] === LOOPBACK_CALL[1];
export const isSysexMessage = data => data[0] === SYSEX_HEADER && data[1] === DEVICE_ID;
export const isCommandCall = data => data[0] === CC_HEADER;
export const isButtonPress = data => data[0] === CC_HEADER && data[2] === FULL;
export const isReset = data => data[0] === RESET;
export const sendLoopbackRequest = _ => LOOPBACK_REQUEST;
export const sendLoopbackCall = _ => LOOPBACK_CALL;