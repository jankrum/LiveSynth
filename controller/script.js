console.log('The controller');

// //------------------------ SELECTORS FOR HTML ELEMENTS ------------------------
// const CASE_SELECTOR = ".case";
// const MODULE_SELECTOR = ".module";
// const LABEL_SELECTOR = "h3";
// const KNOB_SELECTOR = "input";


// //-----------------------------------------------------------------------------------------------------------------------------//
// //  Javascript that modifies the DOM initially
// //-----------------------------------------------------------------------------------------------------------------------------//

// /**
//  * Builds the MIDI controller by duplicating its intial module
//  */
// function buildController() {
//     const MODULE_COUNT = 12;

//     const caseDiv = document.querySelector(CASE_SELECTOR);
//     const originalModule = caseDiv.querySelector(MODULE_SELECTOR);

//     for (let i = 2; i <= MODULE_COUNT; i++) {
//         const cloneModule = originalModule.cloneNode(true);
//         caseDiv.appendChild(cloneModule);
//     }
// }


// //-----------------------------------------------------------------------------------------------------------------------------//
// //  Uses MIDI to populate the selects, potentially disable elements, and store port values with options
// //-----------------------------------------------------------------------------------------------------------------------------//

// /**
//  * Adds every port in midiMap as an option in the given select
//  * @param midiMap 
//  * @param selectToAddOptions 
//  */
// function addPortsAsOptionsToSelect(midiMap, selectToAddOptions) {
//     for (const [key, { name }] of midiMap) {
//         const connectionOption = document.createElement("option");
//         connectionOption.text = name;
//         connectionOption.value = key;
//         selectToAddOptions.appendChild(connectionOption);
//     }
// }

// /**
//  * Given a select, disables it and adds an option displaying "No Ports"
//  * @param selectToDisable 
//  */
// function disableSelect(selectToDisable) {
//     const connectionOption = document.createElement("option");
//     connectionOption.text = "No Ports";
//     selectToDisable.appendChild(connectionOption);

//     selectToDisable.disabled = true;
// }

// /**
//  * Disables the "apply" button
//  */
// function disableApplyButton() {
//     const applyButton = document.querySelector(APPLY_SELECTOR);
//     applyButton.disabled = true;
// }

// /**
//  * Will add the ports of a MIDI Map to a select or disable it if there are not any
//  * @param {*} midiMap 
//  * @param {string} selectID 
//  */
// function populateSelect(midiMap, selectID) {
//     const select = document.querySelector(selectID);

//     if (midiMap.size > 0) {
//         addPortsAsOptionsToSelect(midiMap, select);
//     } else {
//         disableSelect(select);
//         disableApplyButton();
//     }
// }

// /**
//  * Gets the browser's MIDI inputs and outputs, and puts them into their selects
//  */
// async function putPortsInSelects() {
//     const { inputs, outputs } = await navigator.requestMIDIAccess();
//     populateSelect(inputs, MIDI_INPUT_SELECTOR);
//     populateSelect(outputs, MIDI_OUTPUT_SELECTOR);
// }


// //-----------------------------------------------------------------------------------------------------------------------------//
// //  Transforms the page and starts MIDI functionality
// //-----------------------------------------------------------------------------------------------------------------------------//

// /**
//  * Changes visibility for MIDI connector and controller case
//  */
// function hideConnectorAndShowCase() {
//     const connectorDiv = document.querySelector(CONNECTOR_SELECTOR);
//     const caseDiv = document.querySelector(CASE_SELECTOR);

//     connectorDiv.style.display = "none";
//     caseDiv.style.display = "flex";
// }

// /**
//  * Gets the MIDI objects associated with the selected options in the port selects
//  * @returns {Object} object containing input and output objects
//  */
// async function getInputAndOutput() {
//     const { inputs, outputs } = await navigator.requestMIDIAccess({ sysex: true });

//     const inputPort = document.querySelector(MIDI_INPUT_SELECTOR).value;
//     const outputPort = document.querySelector(MIDI_OUTPUT_SELECTOR).value;

//     const input = inputs.get(inputPort);
//     const output = outputs.get(outputPort);

//     return { input, output };
// }

// //--------------Defining callbacks for when a message is received--------------

// /**
//  * Check to see if the message was a loopback call, repeat it if it was
//  * @param {Object} dataAndOutput
//  * @param {Uint8Array} dataAndOutput.data
//  * @param {Object} dataAndOutput.outputObj
//  */
// function handleLoopbackCall({ data, outputObj }) {
//     if (data[0] === LOOPBACK_CALL[0] && data[1] === LOOPBACK_CALL[1]) {
//         console.log("We got a loopback call");
//         outputObj.send(LOOPBACK_CALL);
//     }
// }

// function addModuleFunctionality(module, static, dynamic) {
//     const label = module.querySelector(LABEL_SELECTOR);
//     const knob = module.querySelector(KNOB_SELECTOR);

//     knob.oninput = function () {
//         const knobValue = knob.value;
//         const dynamicValue = dynamic[0];
//         const formattedText = static.replaceAll(STRING_FORMAT_IDENTIFIER, dynamicValue);
//         label.innerText = formattedText;
//     }
// }

// /**
//  * applies SYSEX payload to controller
//  * @param {Uint8Array} payload 
//  */
// function applyPatch(payload) {
//     const message = String.fromCharCode(...payload);
//     const { address, static, dynamic } = JSON.parse(message);
//     const module = document.querySelectorAll(MODULE_SELECTOR)[address];

//     addModuleFunctionality(module, static, dynamic);
// }

// /**
//  * Check to see if the message was a patch info message, use it if it was
//  * @param {Object} dataAndOutput
//  * @param {Uint8Array} dataAndOutput.data
//  * @param {Object} dataAndOutput.outputObj
//  */
// function handlePatchInfo({ data }) {
//     if (data[0] === 0xF0 && data[1] === DEVICE_ID) {
//         console.log("We got a patch definition");
//         applyPatch(data.slice(2, -1));
//     }
// }

// /**
//  * Builds a callback for when a MIDI message is received
//  * @param {Object} outputObj
//  * @returns callback
//  */
// function makeOnMidiCallbackFromOutput(outputObj) {
//     const handlerFunctions = [handleLoopbackCall, handlePatchInfo];

//     return function ({ data }) {
//         handlerFunctions.forEach(handlerFunction =>
//             handlerFunction({ outputObj, data })
//         );
//     };
// }

// /**
//  * Transforms the page and starts MIDI functionality
//  */
// async function startMidi() {
//     hideConnectorAndShowCase();

//     const { input, output } = await getInputAndOutput();
//     input.onmidimessage = makeOnMidiCallbackFromOutput(output);

//     output.send(LOOPBACK_CALL_REQUEST);
//     console.log("Loopback request sent");
// }


// //-----------------------------------------------------------------------------------------------------------------------------//
// //  Sets up event listeners for DOM elements
// //-----------------------------------------------------------------------------------------------------------------------------//

// window.addEventListener("load", buildController);
// window.addEventListener("load", putPortsInSelects);
// document.querySelector(APPLY_SELECTOR).addEventListener("click", startMidi);