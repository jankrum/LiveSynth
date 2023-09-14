# Things to do next
-Add play, pause, stop, functionality
-Integrate the performance controllers with the sequencer
-Determine a file format for the song charts
-Determine a scripting language for the scripts
-Migrate to C/C++ on the Raspberry Pi

# How pause could work
-Get time since last start
-Move the timeouts that were going to play into an array and hold onto the message they were going to send as well as the timestamp
-Subtract new times in for timestamps in array
-Silence MIDI notes but don't remove from currently playing

# What the song charts need to be able to represent
-Every value has a position in the song
-Tempo's have a bpm
-Key signatures have a quality
-Time signature have a lower and upper numeral
-Note literals have output, position, velocity, and duration
-Chords can have roots, qualities, extensions, bass notes
-Arbitrary values

# Script language pseudocode
