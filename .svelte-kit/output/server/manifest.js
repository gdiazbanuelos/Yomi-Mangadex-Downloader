export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","yomi-dl-2.png","yomi-dl.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.f164250f.js","app":"_app/immutable/entry/app.5b9e015e.js","imports":["_app/immutable/entry/start.f164250f.js","_app/immutable/chunks/index.03e363b9.js","_app/immutable/chunks/singletons.3e167c39.js","_app/immutable/entry/app.5b9e015e.js","_app/immutable/chunks/index.03e363b9.js"],"stylesheets":[],"fonts":[]},
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
