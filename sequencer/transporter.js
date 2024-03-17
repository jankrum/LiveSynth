import Peripheral from '/sequencer/peripheral.js';
import { PREVIOUS_CC, PLAY_CC, PAUSE_CC, NEXT_CC, STOP_CC, isLoopbackCall, isButtonPress } from '/namespaces/constants.js';
import { makeJsonSysexMessage } from '/namespaces/utilities.js';

export default class Transporter extends Peripheral {
    constructor(charts, leader) {
        // Relationship name will always be between Sequencer and Transporter
        super('Transporter');

        // The current state for the transporter
        this.state = 'stopped';  // playing || paused || stopped

        this.charts = charts;
        this.chartIndex = 0;  // The index of the current chart
        this.chartsLength = charts.length;

        // A reference to the leader so we can do stuff to it ;)
        this.leader = leader;

        // Legal transitions from one state to another
        this.transitions = {
            'playing': {
                pause: async () => {
                    await leader.pause();
                    this.setState('paused');
                },
                stop: async () => {
                    await leader.stop();
                    this.setState('stopped');
                }
            },
            'paused': {
                play: async () => {
                    await leader.resume();
                    this.setState('playing');
                },
                stop: async () => {
                    await leader.stop();
                    this.setState('stopped');
                }
            },
            'stopped': {
                play: async () => {
                    await leader.play();
                    this.setState('playing');
                }
            }
        }

        // Sets up responding to transporter device
        this.addHandler(isLoopbackCall, () => this.getState());
        this.addHandler(isButtonPress, data => this.handleButtonPress(data));

        // So the leader can use it later for pausing
        leader.transporter = this;
    }

    // Sets state of FSM
    setState(targetState) {
        this.state = targetState;
    }

    // Returns a SYSEX JSON message containing the transporter state
    getState() {
        // What goes in the message
        const state = this.state;
        const canPrevious = this.chartIndex > 0;
        const canNext = this.chartIndex < (this.chartsLength - 1);
        const title = this.charts[this.chartIndex].title;

        // Making and delivering the message
        const stateToSend = { state, canPrevious, canNext, title };
        const message = makeJsonSysexMessage(stateToSend);
        return message;
    }

    // Given an action we want to take, take it if you can find it
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
            const newChart = this.charts[this.chartIndex];
            await this.leader.load(newChart);
        }
    }
    async next() {
        if (this.chartIndex < this.chartsLength - 1) {  // If we can even go next
            await this.dispatch('stop');  // Set state to stop if we aren't already
            this.chartIndex += 1;
            const newChart = this.charts[this.chartIndex];
            await this.leader.load(newChart);
        }
    }

    // Handles button press MIDI messages by responding with the new state
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

    // For use from the leader, to go to a stop state when a song ends
    // THIS MAY BE CALLED FROM ANOTHER OBJECT! BE FUCKING CAREFUL!!!
    async stop() {
        await this.dispatch('stop');
    }
}