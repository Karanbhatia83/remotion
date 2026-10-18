import {Config} from '@remotion/cli/config';

// The chroma key is a WebGL2 shader, so Chromium needs a real GL backend --
// without one the effect throws "Failed to acquire WebGL2 context".
// "angle" is right on a machine with a GPU; "swangle" is ANGLE over SwiftShader
// and is what works on headless/CI boxes with no GPU. swangle is the safe
// default because it works in both places, just slower.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
