// import { RESET, isLoopbackCall, isCommandCall, PREVIOUS_CC, PLAY_CC, PAUSE_CC, NEXT_CC, STOP_CC } from '/namespaces/constants.js';

import Player from './player.js'
import Transporter from './transporter.js';
import filesystem from './filesystem.js';

const player = new Player(filesystem.charts);

// The connection to the transporter
const transporter = new Transporter(filesystem.charts, player);

// Establishes the MIDI connection
await transporter.createConnection();