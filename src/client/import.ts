import { encodeUrl } from "../shared/rewriters/url";

window.$sImport = function (base) {
	return function (url) {
		let resolved = new URL(url, base).href;
		return function () {}.constructor(
			`return import("${encodeUrl(resolved)}")`
		)();
	};
};
