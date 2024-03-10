import { SYSEX_HEADER, DEVICE_ID, SYSEX_TERMINATOR } from '/namespaces/constants.js';

export function makeJsonSysexMessage(objectToSend) {
    const text = JSON.stringify(objectToSend);
    const charArray = text.split('');
    const byteArray = charArray.map(char => char.charCodeAt(0));
    const sysexMessage = [SYSEX_HEADER, DEVICE_ID, ...byteArray, SYSEX_TERMINATOR];
    return sysexMessage;
}

export function getObjectFromJsonSysex(sysexMessage) {
    const byteArray = sysexMessage.slice(2, -1);
    const text = String.fromCharCode(...byteArray);
    const objectFromMessage = JSON.parse(text);
    return objectFromMessage;
}