/**
 *
 *
 * abstract description of a pin object. pins are for transference
 * of data or information between nodes, for example when a node wants to
 * notify another node of something that happened, pass some data, etc.
 *
 * all data and information getting in and out of nodes are transferred using
 * pins, including all inputs, outputs, etc.
 *
 * @module platform/core/base/pin
 * @version 1.0.3
 *
 */

const { Subscribable } = require('./subscribable')


/**
 *
 *
 * the events that can happen to all pins. specific pin types have their own
 * specific types.
 *
 * @const
 * @enum {string}
 *
 */
const PinEvents = {
  /**
   *
   * denotes the event of a pin being connected to another pin.
   *
   */
  connect: 'connect',

  /**
   *
   * denotes the event of a pin being disconnected from another pin.
   *
   */
  disconnect: 'disconnect',

  /**
   *
   * denotes the event of a pin being activated, i.e. is being used for communication
   * between two nodes.
   *
   */
  activate: 'activate',

  /**
   *
   * denotes the event of a node being reset to its base state.
   * connections of a pin will remain in-tact and only its activation state will be
   * reset. specific pin types might also do further clean up in the event of a reset.
   *
   */
  reset: 'reset',
}


/**
 *
 *
 * represents a pin object, and defines all the shared behaviours between more specific
 * pin types. pins are the main means of transfering information between nodes, so all
 * inputs or outputs of a node are pins. if pins of a node are connected to pins of another
 * node, then those two nodes are connected to each other. for example, you might want to
 * connect the output pins of node A to input pins of node B, meaning that node B would
 * receive the output of node A as an input.
 *
 * @class
 * @abstract
 *
 */
class Pin extends Subscribable {
  constructor() {
    super();
    this._connections = [];
    this._activated = false;
  }

  /**
   *
   * returns whether this pin is connected to the other pin.
   *
   * @param {Pin} pin the other pin to check whether this pin is connected to.
   * @returns {boolean} true if this pin is connected to the given pin, false otherwise.
   *
   */
  connected(pin) {
    return this._connections.indexOf(pin) != -1;
  }

  /**
   *
   * should check connectibility to the given pin. specific pin types might
   * require some compatibility checks before connecting to each other,
   * and in case of an incompatible pin, an instance of
   * [IncompatiblePins]{@link module:platform/core/base/errors~IncompatiblePins}
   * should be thrown.
   *
   * an example of pin compatibility is input and output pins. you should be able
   * to connect an input and an output pin, but you should not be able to connect
   * two input pins to each other.
   *
   * @abstract
   * @param {Pin} pin the other pin to check connectibility to.
   * @returns {Pin} this pin object if the given pin is compatible.
   * @throws [IncompatiblePins]{@link module:platform/core/base/errors~IncompatiblePins}
   *        in case of incompatibility.
   *
   */
  checkConnection(pin) { return this; }

  /**
   *
   * connects the pins to each other. will result in an error thrown if called on
   * incompatible pins. for connecting pins A and B, A.connect(B) and B.connect(A)
   * have the same effect and will fully connect the pins to each other.
   * <br><br>
   * emits [connect]{@link module:platform/core/base/pin~PinEvents.connect} event when successful.
   *
   * @param {Pin} pin the pin to connect to.
   * @returns {Pin} this pin object if the connection is successful.
   * @throws [IncompatiblePins]{@link module:platform/core/base/errors~IncompatiblePins}
   *        in case of incompatibility.
   *
   */
  connect(pin) {
    if (!this.connected(pin)) {
      this.checkConnection(pin);
      this._connections.push(pin);
      pin.connect(this);

      this.publish(PinEvents.connect, pin);
    }

    return this;
  }

  /**
   *
   * disconnects two pins if they are connected. has no effect
   * if pins are already disconnected.
   * <br><br>
   * emits [disconnect]{@link module:platform/core/base/pin~PinEvents.disconnect} event when successful.
   *
   * @param {Pin} pin the pin to disconnect from.
   * @returns {Pin} this pin object.
   *
   */
  disconnect(pin) {
    if (this.connected(pin)) {
      this._connections = this._connections.filter(p => p != pin);
      pin.disconnect(this);

      this.publish(PinEvents.disconnect, pin);
    }

    return this;
  }

  /**
   *
   * @property {array} connections the array of all pins connected to this pin.
   * @readonly
   *
   */
  get connections() {
    return this._connections;
  }

  /**
   *
   * @property {boolean} activated true if this pin has been activated, false otherwise.
   * @readonly
   *
   */
  get activated() {
    return this._activated;
  }

  /**
   *
   * will activate the node, which means transference of its data.
   * this method only does the shared basics of activation of a pin and
   * subtypes should use it for accessing these shared functionalities.
   * <br><br>
   * emits [activate]{@link module:platform/core/base/pin~PinEvents.activate} event when successful.
   *
   * @private
   * @param callback a callback to be invoked after activation is done.
   *        will be invoked before the event is fired.
   * @returns {Pin} this pin object.
   *
   */
  _activate(callback) {
    /*
     *
     * this is no longer required since nodes are allowed to be activated
     * more than once, basically for looping and iteration.
     *
     */
    //if (this.activated)
    //  return;

    this._activated = true;
    if (callback)
      callback();

    this.publish(PinEvents.activate);
    return this;
  }

  /**
   *
   * will reset this pin. this will not affect the connections of the pin
   * and only resets its activation state.
   * <br><br>
   * emits [reset]{@link module:platform/core/base/pin~PinEvents.reset} event when successful.
   *
   * @returns {Pin} this pin object.
   *
   */
  reset() {
    this._activated = false;

    this.publish(PinEvents.reset);
    return this;
  }
}

module.exports = {
    Pin: Pin,
    PinEvents: PinEvents,
}
