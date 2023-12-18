// const songs = [
//     {
//         title: 'Hot Cross Buns',
//         script: `
//         const tempo = 100;
//         const sections = [0, 0, 1, 0];
//         const parts = [
//             {
//                 id: 0,
//                 length: 4,
//                 notes: [
//                     [0, 'E4', 0.75],
//                     [1, 'D4', 0.75],
//                     [2, 'C4', 1.75]
//                 ]
//             },
//             {
//                 id: 1,
//                 length: 4,
//                 notes: [
//                     [0, 'C4', 0.25],
//                     [0.5, 'C4', 0.25],
//                     [1, 'C4', 0.25],
//                     [1.5, 'C4', 0.25],
//                     [2, 'D4', 0.25],
//                     [2.5, 'D4', 0.25],
//                     [3, 'D4', 0.25],
//                     [3.5, 'D4', 0.25],
//                 ]
//             }
//         ];
//         let response = sections.map((section, index) => {
//             const millisecondsPerBeat = bpmToMillisecondsPerBeat(tempo);

//             const previousSections = sections.slice(0, index);
//             const getMatchingPart = partId => parts.find(({ id }) => id === partId);
//             const previousParts = previousSections.map(getMatchingPart);
//             const getLength = ({ length }) => length;
//             const previousLengths = previousParts.map(getLength);
//             const sum = (runningSum, nextNum) => runningSum + nextNum;
//             const startingIndex = previousLengths.reduce(sum, 0);

//             function isRightPart({ id }) { return id === section; }
//             const { notes } = parts.find(isRightPart);

//             function transformNote([noteStart, noteName, noteDuration]) {
//                 const startTime = millisecondsPerBeat * (startingIndex + noteStart);
//                 const noteNumber = noteNameToMidiValue(noteName);
//                 const endTime = millisecondsPerBeat * (startingIndex + noteStart + noteDuration);

//                 const noteOnMessage = [NOTE_ON, noteNumber, 63];
//                 const noteOnMessageAndTime = [noteOnMessage, startTime];
//                 const noteOffMessage = [NOTE_OFF, noteNumber, 0];
//                 const noteOffMessageAndTime = [noteOffMessage, endTime];

//                 return [noteOnMessageAndTime, noteOffMessageAndTime];
//             }

//             return notes.map(transformNote).flat();
//         }).flat();
//         response;
//         `
//     }
// ];

// // const songs = [
// //     {
// //         title: 'Twinkle Twinkle Little Star',
// //         tempo: 200,
// //         notes: [
// //             [0, 'C4', 0.75],
// //             [1, 'C4', 0.75],
// //             [2, 'G4', 0.75],
// //             [3, 'G4', 0.75],
// //             [4, 'A4', 0.75],
// //             [5, 'A4', 0.75],
// //             [6, 'G4', 1.75],
// //             [8, 'F4', 0.75],
// //             [9, 'F4', 0.75],
// //             [10, 'E4', 0.75],
// //             [11, 'E4', 0.75],
// //             [12, 'D4', 0.75],
// //             [13, 'D4', 0.75],
// //             [14, 'C4', 1.75],
// //             [16, 'G4', 0.75],
// //             [17, 'G4', 0.75],
// //             [18, 'F4', 0.75],
// //             [19, 'F4', 0.75],
// //             [20, 'E4', 0.75],
// //             [21, 'E4', 0.75],
// //             [22, 'D4', 1.75],
// //             [24, 'G4', 0.75],
// //             [25, 'G4', 0.75],
// //             [26, 'F4', 0.75],
// //             [27, 'F4', 0.75],
// //             [28, 'E4', 0.75],
// //             [29, 'E4', 0.75],
// //             [30, 'D4', 1.75],
// //             [32, 'C4', 0.75],
// //             [33, 'C4', 0.75],
// //             [34, 'G4', 0.75],
// //             [35, 'G4', 0.75],
// //             [36, 'A4', 0.75],
// //             [37, 'A4', 0.75],
// //             [38, 'G4', 1.75],
// //             [40, 'F4', 0.75],
// //             [41, 'F4', 0.75],
// //             [42, 'E4', 0.75],
// //             [43, 'E4', 0.75],
// //             [44, 'D4', 0.75],
// //             [45, 'G4', 0.75],
// //             [46, 'C4', 1.75],
// //         ]
// //     },
// //     {
// //         title: 'Hot Cross Buns',
// //         tempo: 100,
// //         notes: [
// //             [0, 'E4', 0.75],
// //             [1, 'D4', 0.75],
// //             [2, 'C4', 0.75],
// //             [4, 'E4', 0.75],
// //             [5, 'D4', 0.75],
// //             [6, 'C4', 0.75],
// //             [8, 'C4', 0.25],
// //             [8.5, 'C4', 0.25],
// //             [9, 'C4', 0.25],
// //             [9.5, 'C4', 0.25],
// //             [10, 'D4', 0.25],
// //             [10.5, 'D4', 0.25],
// //             [11, 'D4', 0.25],
// //             [11.5, 'D4', 0.25],
// //             [12, 'E4', 0.75],
// //             [13, 'D4', 0.75],
// //             [14, 'C4', 1.75]
// //         ]
// //     },
// //     {
// //         title: '12 Bar Blues',
// //         tempo: 160,
// //         notes: [
// //             [0, 'G2', 0.75],
// //             [0.5, 'G4', 7.75],
// //             [0.5, 'B4', 7.75],
// //             [0.5, 'D5', 7.75],
// //             [1, 'B2', 0.75],
// //             [2, 'D3', 0.75],
// //             [3, 'E3', 0.75],
// //             [4, 'F3', 0.75],
// //             [5, 'E3', 0.75],
// //             [6, 'D3', 0.75],
// //             [7, 'B2', 0.75],
// //             [8, 'G2', 0.75],
// //             [8.5, 'G4', 7.75],
// //             [8.5, 'B4', 7.75],
// //             [8.5, 'D5', 7.75],
// //             [8.5, 'F5', 7.75],
// //             [9, 'B2', 0.75],
// //             [10, 'D3', 0.75],
// //             [11, 'E3', 0.75],
// //             [12, 'G3', 0.75],
// //             [13, 'F3', 0.75],
// //             [14, 'E3', 0.75],
// //             [15, 'D3', 0.75],
// //             [16, 'C3', 0.75],
// //             [16.5, 'G4', 7.75],
// //             [16.5, 'C5', 7.75],
// //             [16.5, 'E5', 7.75],
// //             [17, 'E3', 0.75],
// //             [18, 'G3', 0.75],
// //             [19, 'A3', 0.75],
// //             [20, 'Bb3', 0.75],
// //             [21, 'A3', 0.75],
// //             [22, 'G3', 0.75],
// //             [23, 'E3', 0.75],
// //             [24, 'G2', 0.75],
// //             [24.5, 'G4', 7.75],
// //             [24.5, 'B4', 7.75],
// //             [24.5, 'D5', 7.75],
// //             [25, 'B2', 0.75],
// //             [26, 'D3', 0.75],
// //             [27, 'E3', 0.75],
// //             [28, 'F3', 0.75],
// //             [29, 'E3', 0.75],
// //             [30, 'D3', 0.75],
// //             [31, 'B2', 0.75],
// //             [32, 'C4', 0.75],
// //             [32.5, 'A4', 3.75],
// //             [32.5, 'C5', 3.75],
// //             [32.5, 'D5', 3.75],
// //             [32.5, 'Gb5', 3.75],
// //             [33, 'B3', 0.75],
// //             [34, 'A3', 0.75],
// //             [35, 'Gb3', 0.75],
// //             [36, 'Bb3', 0.75],
// //             [36.5, 'G4', 3.25],
// //             [36.5, 'Bb4', 3.25],
// //             [36.5, 'C5', 3.25],
// //             [36.5, 'E5', 3.25],
// //             [37, 'A3', 0.75],
// //             [38, 'G3', 0.75],
// //             [39, 'E3', 0.75],
// //             [40, 'G2', 0.75],
// //             [40.5, 'G4', 7.75],
// //             [40.5, 'B4', 7.75],
// //             [40.5, 'D5', 7.75],
// //             [40.5, 'F5', 7.75],
// //             [41, 'B2', 0.75],
// //             [42, 'C3', 0.75],
// //             [43, 'Db3', 0.75],
// //             [44, 'D3', 0.75],
// //             [44.75, 'E3', 0.75],
// //             [45, 'Gb3', 0.75],
// //             [46.25, 'G3', 9.75],
// //             [47.5, 'G4', 8],
// //             [47.6, 'B4', 8],
// //             [47.7, 'D5', 8],
// //             [47.8, 'F5', 8],
// //             [47.9, 'A5', 8],
// //             [48, 'Db6', 8],
// //             [48.1, 'E6', 8],
// //         ]
// //     }
// // ];

// function bpmToMillisecondsPerBeat(bpm) {
//     const millisecondsPerBeat = 1000 * 60 / bpm;
//     return millisecondsPerBeat
// }

// function noteNameToMidiValue(noteName) {
//     const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
//     const validOctaves = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

//     const match = noteName.match(/^([A-Ga-g])(#|b)?(\d+)$/);

//     if (!match) {
//         return -1;
//     }

//     const [, note, accidental, octave] = match;
//     const noteIndex = noteNames.indexOf(note.toUpperCase());

//     if (noteIndex === -1) {
//         return -1;
//     }

//     const octaveValue = parseInt(octave, 10);

//     if (!validOctaves.includes(octaveValue)) {
//         return -1;
//     }

//     let midiValue = noteIndex + (octaveValue * 12);

//     if (accidental === "#") {
//         midiValue++;
//     } else if (accidental === "b") {
//         midiValue--;
//     }

//     return midiValue;
// }

