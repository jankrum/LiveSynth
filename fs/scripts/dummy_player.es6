({
    controllerState: [
        {
            prefix: 'Style: ',
            options: [
                'Rock',
                'Jazz',
                'Disco',
                'Metal'
            ]
        },
        {
            prefix: 'Tempo: ',
            min: 60,
            max: 300,
            suffix: ' BPM'
        }
    ],
    composeScript() {
        console.log('I am writing stuff')
    }
})