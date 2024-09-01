import { config } from "../../shared";
import { ScramjetClient } from "../client";

export const enabled = () => config.flags.captureErrors;
export function argdbg(arg, recurse = []) {
	switch (typeof arg) {
		case "string":
			if (arg.includes("localhost:1337/scramjet/") && arg.includes("m3u8"))
				debugger;
			break;
		case "object":
			// if (arg instanceof Location) debugger;
			if (
				arg &&
				arg[Symbol.iterator] &&
				typeof arg[Symbol.iterator] === "function"
			)
				for (let prop in arg) {
					// make sure it's not a getter
					let desc = Object.getOwnPropertyDescriptor(arg, prop);
					if (desc && desc.get) continue;

					const ar = arg[prop];
					if (recurse.includes(ar)) continue;
					recurse.push(ar);
					argdbg(ar, recurse);
				}
			break;
	}
}

export default function (client: ScramjetClient, self: typeof globalThis) {
	self.$scramerr = function scramerr(e) {
		console.warn("CAUGHT ERROR", e);
	};

	self.$scramdbg = function scramdbg(args, t) {
		if (args && typeof args === "object" && args.length > 0) argdbg(args);
		argdbg(t);
		return t;
	};

	client.Proxy("Promise.prototype.catch", {
		apply(ctx) {
			ctx.args[0] = new Proxy(ctx.args[0], {
				apply(target, thisArg, argArray) {
					// console.warn("CAUGHT PROMISE REJECTION", argArray);
					Reflect.apply(target, thisArg, argArray);
				},
			});
		},
	});
}
