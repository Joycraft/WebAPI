/** Evaluation phase of the event flow */
export enum Phase {
	/** No event is being processed at this time. */
	NONE,
	/** The event is being propagated through the target's ancestor objects. */
	CAPTURING_PHASE,
	/** The event has arrived at the event's target. Event listeners registered for this phase are called at this time. If Event.bubbles is false, processing the event is finished after this phase is complete. */
	AT_TARGET,
	/** The event is propagating back up through the target's ancestors in reverse order, starting with the parent, and eventually reaching the containing Window. This is known as bubbling, and occurs only if Event.bubbles is true. Event listeners registered for this phase are triggered during this process. */
	BUBBLING_PHASE,
}

export interface EventInit {
	bubbles?: boolean;
	cancelable?: boolean;
	composed?: boolean;
}

/**
 * The Event interface represents an event which takes place in the DOM.
 *
 * An event can be triggered by the user action e.g. clicking the mouse button or tapping keyboard, or generated by APIs to represent the progress of an asynchronous task. It can also be triggered programmatically, such as by calling the HTMLElement.click() method of an element, or by defining the event, then sending it to a specified target using EventTarget.dispatchEvent().
 *
 * There are many types of events, some of which use other interfaces based on the main Event interface. Event itself contains the properties and methods which are common to all events.
 *
 * Many DOM elements can be set up to accept (or "listen" for) these events, and execute code in response to process (or "handle") them. Event-handlers are usually connected (or "attached") to various HTML elements (such as <button>, <div>, <span>, etc.) using EventTarget.addEventListener(), and this generally replaces using the old HTML event handler attributes. Further, when properly added, such handlers can also be disconnected if needed using removeEventListener().
 */
export class Event {

	constructor(type: string, eventInitDict?: EventInit) {
		this._type = type;
		if (eventInitDict) {
			this._bubbles = eventInitDict.bubbles;
			this._cancelable = eventInitDict.cancelable;
			this._composed = eventInitDict.composed;
		}
	}

	/**
	 * Returns true or false depending on how event was initialized. True if event goes through its target's ancestors in reverse tree order, and false otherwise.
	 */
	get bubbles(): boolean { return this._bubbles; }
	protected _bubbles: boolean;
	cancelBubble: boolean;

	/**
	 * Returns true or false depending on how event was initialized. Its return value does not always carry meaning, but true can indicate that part of the operation during which event was dispatched, can be canceled by invoking the preventDefault() method.
	 */
	get cancelable(): boolean { return this._cancelable; }
	protected _cancelable: boolean;

	/**
	 * Returns true or false depending on how event was initialized. True if event invokes listeners past a ShadowRoot node that is the root of its target, and false otherwise.
	 */
	get composed(): boolean { return this._composed; }
	protected _composed: boolean;

	/**
	 * Returns the object whose event listener's callback is currently being invoked.
	 */
	get currentTarget(): EventTarget { return this._currentTarget; }
	protected _currentTarget: EventTarget;

	/**
	 * Returns true if preventDefault() was invoked successfully to indicate cancelation, and false otherwise.
	 */
	get defaultPrevented(): boolean { return this._defaultPrevented; }
	protected _defaultPrevented;

	/**
	 * Returns the event's phase, which is one of NONE, CAPTURING_PHASE, AT_TARGET, and BUBBLING_PHASE.
	 */
	get eventPhase(): Phase { return this._eventPhase; }
	protected _eventPhase: Phase;

	/**
	 * Returns true if event was dispatched by the user agent, and false otherwise.
	 */
	get isTrusted(): boolean { return this._isTrusted; }
	protected _isTrusted: boolean;

	returnValue: boolean;

	/**
	 * Returns the object to which event is dispatched (its target).
	 */
	get target(): EventTarget { return this._target; }
	protected _target: EventTarget;

	/**
	 * Returns the event's timestamp as the number of milliseconds measured relative to the time origin.
	 */
	get timeStamp(): number { return this._timeStamp; }
	protected _timeStamp: number;

	/**
	 * Returns the type of event, e.g. "click", "hashchange", or "submit".
	 */
	get type(): string { return this._type; }
	protected _type: string;

	/**
	 * Returns the invocation target objects of event's path (objects on which listeners will be invoked), except for any nodes in shadow trees of which the shadow root's mode is "closed" that are not reachable from event's currentTarget.
	 */
	composedPath(): EventTarget[] {
		return [];
	}

	initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
		this._type = type;
		this._bubbles = bubbles;
		this._cancelable = cancelable;
	}

	/**
	 * If invoked when the cancelable attribute value is true, and while executing a listener for the event with passive set to false, signals to the operation that caused event to be dispatched that it needs to be canceled.
	 */
	preventDefault(): void {
		if (this.cancelable) {
			this._defaultPrevented = true;
		}
	}

	/**
	 * Invoking this method prevents event from reaching any registered event listeners after the current one finishes running and, when dispatched in a tree, also prevents event from reaching any other objects.
	 */
	stopImmediatePropagation(): void {
		this._defaultPrevented = true;
		this.cancelBubble = false;
	}

	/**
	 * When dispatched in a tree, invoking this method prevents event from reaching any objects other than the current object.
	 */
	stopPropagation(): void {
		if (this._bubbles) {
			this.cancelBubble = true;
		}
	}
}

interface ProgressEventInit extends EventInit {
	lengthComputable?: boolean;
	loaded?: number;
	total?: number;
}

/** Events measuring progress of an underlying process, like an HTTP request (for an XMLHttpRequest, or the loading of the underlying resource of an <img>, <audio>, <video>, <style> or <link>). */
export class ProgressEvent<T extends EventTarget = EventTarget> extends Event {
	get lengthComputable(): boolean { return this._lengthComputable; }
	protected _lengthComputable: boolean;

	get loaded(): number { return this._loaded; }
	protected _loaded: number;

	get target(): T { return this._target; }
	protected _target: T;
	get total(): number { return this._total; }
	protected _total: number;

	constructor(type: string, eventInitDict?: ProgressEventInit) {
		super(type, eventInitDict);
		if (eventInitDict) {
			this._lengthComputable = eventInitDict.lengthComputable;
			this._loaded = eventInitDict.loaded;
			this._total = eventInitDict.total;
		}
	}
}

export interface EventListener {
	(evt: Event): void;
}

export interface EventListenerObject {
	handleEvent(evt: Event): void;
}

export interface EventListenerOptions {
	capture?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
	once?: boolean;
	passive?: boolean;
}

export type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

interface EventListenerRecord extends AddEventListenerOptions {
	listener: EventListenerOrEventListenerObject;
}


export class EventTarget {

	protected _listeners: {[key: string]: EventListenerRecord[]} = {};

	/**
	 * Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.
	 *
	 * The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.
	 *
	 * When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.
	 *
	 * When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.
	 *
	 * When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.
	 *
	 * The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.
	 */
	public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
		if (!listener) return;
		if (!(type in this._listeners)) {
			this._listeners[type] = [];
		}
		let recorder: EventListenerRecord = { listener };
		if (typeof options === "boolean") {
			recorder.capture = options;
		} else if (typeof options === 'object') {
			recorder = { ...options, listener };
		}

		this._listeners[type].push(recorder);
	}

	/**
	 * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute value is false or its preventDefault() method was not invoked, and false otherwise.
	 */
	public dispatchEvent(event: Event): boolean {

		if (!event || typeof event.type != 'string') return true;
		const origin_recorders = this._listeners[event.type];
		if (!origin_recorders) return true;

		const recorders = origin_recorders.slice();
		if (!recorders.length) return !event.defaultPrevented;

		let once_listeners: EventListenerRecord[] = [];
		for (const recorder of recorders) {
			let listener: EventListener = null;
			if ((recorder.listener as EventListenerObject).handleEvent) {
				listener = (recorder.listener as EventListenerObject).handleEvent;
			} else {
				listener = recorder.listener as EventListener;
			}

			if (typeof listener === 'function') {
				listener.call(this, event);
				if (recorder.once) {
					once_listeners.push(recorder);
				}
			}
			if (event.defaultPrevented) break;
		}

		for (let i = 0; i < once_listeners.length; i++) {
			origin_recorders.splice(origin_recorders.indexOf(once_listeners[i]), 1);
		}
		return !event.defaultPrevented;
	}

	/**
	 * Removes the event listener in target's event listener list with the same type, callback, and options.
	 */
	public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean): void {
		if (!listener || !(type in this._listeners)) return;
		const recorders = this._listeners[type];
		for (let i = 0; i < recorders.length; i++) {
			const recorder = recorders[i];
			if (recorder.listener === listener) {
				let sameOptions = true;
				if (typeof options === "boolean") {
					sameOptions = recorder.capture == options;
				} else if (typeof options === 'object') {
					sameOptions = recorder.capture == options.capture;
				}
				if (sameOptions) {
					recorders.splice(i, 1);
					break;
				}
			}
		}
	}
}

export default {
	exports: {
		Phase,
		Event,
		ProgressEvent,
		EventTarget
	}
};
