import animation_frame from './animation_frame';
import event from './event';
import timer from './timer';
import performance from './performance';

import { initialize, finalize } from "./index";
initialize([
	event,
	timer,
	performance
]);

//@ts-ignore
export default class GodotWebAPISingleton extends godot.Node {
	_exit_tree() {
		finalize();
	}

}