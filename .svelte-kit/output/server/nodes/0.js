import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
export const component = async () => (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.734b1487.js","_app/immutable/chunks/index.03e363b9.js"];
export const stylesheets = ["_app/immutable/assets/0.53fa7e6a.css"];
export const fonts = [];
