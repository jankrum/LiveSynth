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
    if (userInput === null || userInput === undefined) {
        console.debug('%cUSER CANCELLED', 'background-color: orange; color: black;');
        throw new Error('cancelled');
    }

    // Gets the original label
    const baseLabel = label.split('\n').slice(-1)[0];

    // The 0-indexed choice the user made
    const index = parseInt(userInput, 10) - 1;

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

export default class Connection {
    constructor(name) {
        this.name = name;  // The name for a relationship between MIDI devices
        this.storageKey = `midiConnection_${name}`;  // The storage key we will use for localStorage
    }

    // Given a MIDI input or output map, try to get our connection out of it
    getConnectionFrom(midiMap) {
        const midiArray = Array.from(midiMap);

        function getPortByName(portName) {
            // Find the object with the matching name
            const foundPort = midiArray.find(([_, { name }]) => name === portName);

            if (foundPort) {
                const key = foundPort[0];

                try {
                    const port = midiMap.get(key);
                    return port;
                } catch {
                    // Well we looked and we couldn't find it. Pack it up boys.
                    return null;
                }
            }

            return null;
        }

        const storedPortName = localStorage.getItem(this.storageKey);

        // Check if we have already found the ports name for out relationship
        if (storedPortName) {  // If there is a value
            console.debug(`%cFound a value (${storedPortName}) for the '${this.name}'!`, 'color: lightgreen');

            const port = getPortByName(storedPortName);

            if (port) {  // If we did find a port, and it was good
                console.debug('%cAnd it was good!', 'background-color: green;');
                return port;
            } else {  // If we find a port, but it was bad
                console.debug('%cBut it was bad', 'color: orange;');
                localStorage.removeItem(this.storageKey);  // Let go of it
            }
        }

        // We reach here if we didn't find a port name stored for this relationship, or the one we found was bad
        console.debug('%cAsking the user to choose a port', 'color: white; background-color: #333;');

        const label = `Choose a port for ${this.name}`;

        // Extract all the names from all the ports in our MIDI map
        const allPortNames = midiArray.map(([_, { name }]) => name);

        // Used to create closure for testPort, since testPort cannot use this.storageKey
        const storageKey = this.storageKey;

        // Checks if we actually get a port under a name
        function testPort(chosenPortName) {
            try {
                console.debug(`Trying ${chosenPortName}`);
                const port = getPortByName(chosenPortName);
                console.debug(port);
                if (port) {
                    console.debug('Its real, TRYING TO STORE IT');
                    localStorage.setItem(storageKey, chosenPortName);
                    console.debug('IT IS STORED');
                    return port;
                }
            } catch (err) {
                console.debug('%cBut it was NO GOOD', 'background-color: fuchsia;');
                console.error(err.message);
                return;
            }
        }

        // Ask the user to choose a port they want for this relationship
        const userResponse = selectFromList(label, allPortNames, testPort);

        return userResponse;
    }
}