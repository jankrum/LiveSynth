import Peripheral from '/sequencer/peripheral.js';
import { PREVIOUS_CC, PLAY_CC, PAUSE_CC, NEXT_CC, STOP_CC, isLoopbackCall, isButtonPress } from '/namespaces/constants.js';
import { makeJsonSysexMessage } from '/namespaces/utilities.js';

// An interface for the controller, from the perspective of the sequencer
export default class Transporter extends Peripheral {
    constructor(charts, player) {
        super('Transporter');

        this.state = 'stopped';  // playing || paused || stopped
        this.charts = charts;
        this.chartIndex = 0;  // The index of the current chart
        this.chartsLength = charts.length;

        this.player = player;

        this.transitions = {
            'playing': {
                pause: async () => {
                    await player.pause();
                    this.setState('paused');
                },
                stop: async () => {
                    await player.stop();
                    this.setState('stopped');
                }
            },
            'paused': {
                play: async () => {
                    await player.resume();
                    this.setState('playing');
                },
                stop: async () => {
                    await player.stop();
                    this.setState('stopped');
                }
            },
            'stopped': {
                play: async () => {
                    await player.play();
                    this.setState('playing');
                }
            }
        }

        this.addHandler(isLoopbackCall, () => this.getState());
        this.addHandler(isButtonPress, (data) => this.handleButtonPress(data));

        player.transporter = this;

        player.load(charts[0]);
    }

    // Sets state of FSM
    setState(targetState) {
        this.state = targetState;
    }

    // Returns a SYSEX JSON message containing the transporter state
    getState() {
        const state = this.state;
        const canPrevious = this.chartIndex > 0;
        const canNext = this.chartIndex < (this.chartsLength - 1);
        const title = this.charts[this.chartIndex].title;

        const stateToSend = { state, canPrevious, canNext, title };
        const message = makeJsonSysexMessage(stateToSend);
        return message;
    }

    // Given a state we want to reach, try to reach it
    async dispatch(actionName) {
        const possibleTransitions = this.transitions[this.state];
        if (Object.hasOwn(possibleTransitions, actionName)) {
            return await possibleTransitions[actionName]();
        }
    }

    // Legal in any state, so it exists outside transitions
    async previous() {
        if (this.chartIndex > 0) {  // If we can even go previous
            await this.dispatch('stop');  // Set state to stop if we aren't already
            this.chartIndex -= 1;
            await this.player.load(this.charts[this.chartIndex]);
        }
    }
    async next() {
        if (this.chartIndex < this.chartsLength - 1) {  // If we can even go next
            await this.dispatch('stop');  // Set state to stop if we aren't already
            this.chartIndex += 1;
            await this.player.load(this.charts[this.chartIndex]);
        }
    }

    async handleButtonPress(data) {
        // Switches on the 1st data byte of the button press
        switch (data[1]) {
            case PREVIOUS_CC:
                await this.previous();
                break;
            case PLAY_CC:
                await this.dispatch('play');
                break;
            case PAUSE_CC:
                await this.dispatch('pause');
                break;
            case NEXT_CC:
                await this.next();
                break;
            case STOP_CC:
                await this.dispatch('stop');
                break;
        }

        return this.getState();
    }

    // For use from the player, to go to a stop state when a song ends
    // THIS MAY BE CALLED BY ANOTHER OBJECT! BE FUCKING CAREFUL!!!
    async stop() {
        await this.dispatch('stop');
    }
}