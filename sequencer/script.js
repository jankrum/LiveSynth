// import { RESET, isLoopbackCall, isCommandCall, PREVIOUS_CC, PLAY_CC, PAUSE_CC, NEXT_CC, STOP_CC } from '/namespaces/constants.js';

import filesystem from './filesystem.js';
import Leader from './leader.js'
import Transporter from './transporter.js';

const leader = new Leader(filesystem.scripts);
const transporter = new Transporter(filesystem.charts, leader);

// Load the first chart
await leader.load(filesystem.charts[0]);

// Establishes the MIDI connection
await transporter.createConnection();