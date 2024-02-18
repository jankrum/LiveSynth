const UTILITIES = (() => {
    // Asks the user to choose from a list
    function selectFromList(label, choices, transformer) {
        // If no choices
        if (choices.length === 0) {
            throw new Error('No choices');
        }

        // Creates the text to be displayed in the prompt
        const promptText = [label, ...choices.map((choice, index) => `[${index + 1}] ${choice}`)].join('\n');

        // Store users response
        const userInput = prompt(promptText);

        console.debug(`User said ${userInput}`);

        // If the user clicked cancel
        if (userInput === null) {
            console.debug('%cUSER CANCELLED', 'background-color: orange; color: black;');
            throw new Error('cancelled');
        }

        // Gets the original label
        const baseLabel = label.split('\n').slice(-1)[0];

        // The 0-indexed choice the user made
        const index = userResponse = parseInt(userInput, 10) - 1;

        // If the user did not enter a number
        if (isNaN(index)) {
            console.debug('%cWhich was not a number', 'background-color: orange;');
            const newLabel = `Please enter a number\n${baseLabel}`;
            // Ask again with error message
            return selectFromList(newLabel, choices, transformer);
        }

        // If the user entered a number outside the legal range
        if (index < 0 || index > choices.length - 1) {
            console.debug('%cWhich was not in range', 'background-color: orange;');
            const newLabel = `Please enter a number in the range\n${baseLabel}`;
            // Ask again with error message
            return selectFromList(newLabel, choices, transformer);
        }

        // The obj the user chose
        const selectedItem = choices[index];

        // The transformed version of the obj
        const result = transformer(selectedItem);

        // If the user choose something that we couldn't use
        if (result === undefined) {
            console.debug('%cWhich was not valid', 'background-color: firebrick;');
            const newLabel = `Invalid choice\n${baseLabel}`;
            // Remove it from the next set of choices
            const newChoices = choices.filter((_, iterIndex) => iterIndex !== index);
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