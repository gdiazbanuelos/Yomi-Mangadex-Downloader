export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.3eadae11.js","app":"_app/immutable/entry/app.5b4e7a0c.js","imports":["_app/immutable/entry/start.3eadae11.js","_app/immutable/chunks/index.03e363b9.js","_app/immutable/chunks/singletons.879d4299.js","_app/immutable/entry/app.5b4e7a0c.js","_app/immutable/chunks/index.03e363b9.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js')
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
