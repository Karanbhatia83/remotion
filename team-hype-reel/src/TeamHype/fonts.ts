import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts so rendering works without network access.
loadFont({family: 'Anton', url: staticFile('fonts/Anton-Regular.woff2'), weight: '400'});
loadFont({family: 'Poppins', url: staticFile('fonts/Poppins-ExtraBold.woff2'), weight: '800'});
loadFont({family: 'Poppins', url: staticFile('fonts/Poppins-Black.woff2'), weight: '900'});

const emoji = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"';

export const display = `Anton, ${emoji}`;
export const body = `Poppins, ${emoji}`;
