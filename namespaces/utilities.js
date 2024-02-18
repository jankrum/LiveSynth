const UTILITIES = (() => {
    function selectFromList(label, choices, transformer) {
        if (choices.length === 0) {
            throw new Error('No choices');
        }

        const promptText = [label, ...choices.map((choice, index) => `[${index + 1}] ${choice}`)].join('\n');
        const userInput = prompt(promptText);

        console.debug(`User said ${userInput}`);

        if (userInput === null) {
            // User clicked cancel
            console.debug('%cUSER CANCELLED', 'background-color: orange; color: black;');
            throw new Error('cancelled');
        }

        // Gets the original label
        const baseLabel = label.split('\n').slice(-1)[0];

        const index = userResponse = parseInt(userInput, 10);

        if (isNaN(index)) {
            // If the user did not enter a number
            console.debug('%cWhich was not a number', 'background-color: orange;');
            const newLabel = `Please enter a number\n${baseLabel}`;
            return selectFromList(newLabel, choices, transformer);
        }

        if (index < 1 || index > choices.length) {
            // If the user entered a number outside the legal range
            console.debug('%cWhich was not in range', 'background-color: orange;');
            const newLabel = `Please enter a number in the range\n${baseLabel}`;
            return selectFromList(newLabel, choices, transformer);
        }

        const selectedItem = choices[index - 1];
        const result = transformer(selectedItem);

        if (result === undefined) {
            // If the user choose something that we couldn't use
            console.debug('%cWhich was not valid', 'background-color: firebrick;');
            const newLabel = `Invalid choice\n${baseLabel}`;
            const newChoices = choices.filter((_, iterIndex) => iterIndex !== index - 1);
            return selectFromList(newLabel, newChoices, transformer);
        }

        return result;
    }

    /**
    * Given an object to send, transforms it into a JSON string,
    * converts it to an array of ascii bytes wraps it with a
    * sysex header, device ID, and sysex terminator
    * @param {Object} objectToSend - The object to be transformed into a sysex msg
    * @returns {Int8Array} sysexMessage - A array of bytes to transmit over MIDI
    */
    function makeJsonSysexMessage(objectToSend) {
        const text = JSON.stringify(objectToSend);
        const charArray = text.split('');
        const byteArray = charArray.map(char => char.charCodeAt(0));
        const sysexMessage = [
            MIDI_CONSTANTS.SYSEX_HEADER,
            MIDI_CONSTANTS.DEVICE_ID,
            ...byteArray,
            MIDI_CONSTANTS.SYSEX_TERMINATOR
        ];
        return sysexMessage;
    }

    /**
     * Given an array representing a MIDI sysex message containing the
     * text of a JSON object, decodes it and returns the object sent
     * @param {Int8Array} sysexMessage - An array of bytes to decode into an object
     * @returns {Object} objectFromMessage - An object to get from the JSON in the message
     */
    function getObjectFromJsonSysex(sysexMessage) {
        const byteArray = sysexMessage.slice(2, -1);
        const text = String.fromCharCode(...byteArray);
        const objectFromMessage = JSON.parse(text);
        return objectFromMessage;
    }

    return {
        selectFromList,
        makeJsonSysexMessage,
        getObjectFromJsonSysex
    };
})();