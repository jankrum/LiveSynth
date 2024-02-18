class MidiConnection {
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
        const userResponse = UTILITIES.selectFromList(label, allPortNames, testPort);

        return userResponse;
    }
}