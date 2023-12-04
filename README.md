# System Diagram
Transporter
&emsp;&emsp;↕
Sequencer → Synthesizer
&emsp;&emsp;↕
Controller

# Overview
## Sequencer
**Purpose**: Tells the synthesizer what notes to play. determines what notes to play by applying script to chart.
**Tech Stack**: Raspberry Pi, Debian, C++, RTP-MIDI, MusicXML, Scheme interpreter, cJSON, (insert C midi library here)
 ## Transporter
**Purpose**: Provides master transport control for sequencer. 
**Tech Stack**: Teensy 4.1, C++, Arduino USB MIDI, Arduino JSON
 ## Controller
**Purpose**: Exposes variables in sequencer for direct access by performer(s)
**Tech Stack**: Teensy 4.1, C++, Arduino Apple MIDI, Arduino JSON
## Synthesizer
**Purpose**: Makes sound, is told what to play by the sequencer.
**Tech Stack**: Teensy 4.1, C++, Arduino Apple MIDI, Arduino JSON

# PROJECT TIMELINE
|            |Phase I      |Phase II     |Phase III    |Phase IV    |
|------------|-------------|-------------|-------------|------------|
|Sequencer   |JS/Browser   |JS/Browser   |Raspberry Pi |Raspberry Pi|
|Transporter |Local Browser|Other Browser|Other Browser|Hardware    |
|Controller  |Local Browser|Other Browser|Other Browser|Hardware    |
|Synthesizer |Software     |Some Hardware|More Hardware|Hardware    |

# SEQUENCER DEEP DIVE
The sequencer should never have to be interacted with directly during performance.
When the Raspberry Pi boots, it immediately launches sequencer program.
Sequencer reads config file and searches for all MIDI connections.
The most important MIDI connection is to the transporter, the sequencer will complain if it cannot establish this.
Sequencer reads filesystem and sends filenames as song titles to transport's display.
When played, MusicXML file and corresponding scripts will be loaded.
Script will be interpreted to resolve ambiguity in chart, output will be stored in buffer of timeouts.
If controller information is received, script will recompute part and store in buffer.

# TRANSPORTER DEEP DIVE
This is a simple hardware device, with 5 buttons (prev, play, pause, stop, next), and LCD display, and a USB-B port.
It is mounted behind a panel near the sequencer, and connects to it over USB.
Every button press is added to a queue, which can only be dequeued from being sent over MIDI.
Essentially stateless just displays what is sent (using JSON) from sequencer.

# CONTROLLER DEEP DIVE
An array of modules consisting of LCD displays and potentiometers.

# SYNTHESIZER DEEP DIVE

Only interacted with as a MIDI to CV converter.

SYSEX messages are sent to control temperament.

CC messages are sent to control:
- Priority
	- Last
	- Highest
	- Lowest
- Portamento
	- Rate
	- Defined in time or distance
- Vibrato
	- Frequency
	- Amount ADSR
	- Waveform
	- Pulse width
	- S&H sample rate
	- Delay  
	- Retrigger
- Pitch bend range
	- Up range
	- Down range
- Retrigger enable
- Modulation 
	- Frequency  
	- Amount ADSR  
	- Waveform  
	- Pulse width  
	- S&H sample rate  
	- Delay
	- Retrigger
- Velocity Bezier Curve
	- X
	- Y

**Outputs:**
- 2x v/oct
- 2x gates
- 2x triggers
- 2x velocity outs
- 2x modulation outs
