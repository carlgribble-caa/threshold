import EventEmitter from 'eventemitter3';

// Global event bus for Threshold
// Events follow the spec: typing.started, typing.paused, object.emerged, etc.
const bus = new EventEmitter();

export default bus;
