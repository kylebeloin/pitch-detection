class PitchProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    console.log(inputs);
    return true;
  }
}

registerProcessor("pitch-processor", PitchProcessor);
