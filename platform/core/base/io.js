/**
 *
 *
 * the definition of input and output pins. input and output pins are used for
 * transference of actual data between nodes.
 *
 * @module platform/core/base/io
 * @version 0.1.3
 */

const { Pin } = require('./pin');
const { IncompatiblePins, PinConnectionError } = require('./errors');


/**
 *
 *
 * the events specific to io pins.
 *
 * @enum {string}
 * @const
 *
 */
const IOPinEvents = {
  /**
   *
   * denotes the event of an input pin receiving some data.
   *
   */
  receive: 'receive',

  /**
   *
   * denotes the event of an output pin sending some data.
   *
   */
  send: 'send',
}

/**
 *
 *
 * represents input pins, i.e. pins that receive data from another pin.
 * input pins can only be connected to output pins, like obviously.
 * generally, data is given to some node via its input pins.
 *
 * @class
 * @see [the parrent class]{@link module:platform/core/base/pin~Pin}
 *
 */
class InputPin extends Pin {
  constructor() {
    super();
    this._data = undefined;
  }

  /**
   *
   * @param {module:platform/core/base/pin~Pin} pin the pin to check connectibility with.
   * @throws [IncompatiblePins]{@link module:platform/core/base/errors~IncompatiblePins}
   *        if given anything but an output pin.
   * @returns {InputPin} this object.
   * @see [the overrided method]{@link module:platform/core/base/pin~Pin#checkConnection}
   *
   */
  checkConnection(pin) {
    if (!(pin instanceof OutputPin))
      throw new IncompatiblePins(this, pin);

    return this;
  }

  /**
   *
   * receives some data. will activate the pin.
   * <br><br>
   * emits [receive]{@link module:platform/core/base/io~IOPinEvents.receive} event when successful.
   *
   * @param {object} data the data to be received.
   * @returns {InputPin} this pin object.
   *
   */
  receive(data) {
    this._activate(()=> {
      this._data = data;
      this.publish(IOPinEvents.receive, data);
    });

    return this;
  }

  /**
   *
   * @property {object} data the (last) data received by this pin, if any.
   * @readonly
   *
   */
  get data() { return this._data; }

  /**
   *
   * resets this pin. also clears the data received.
   *
   * @see [the overrided method]{@link module:platform/core/base/pin~Pin#reset}
   *
   */
  reset() {
    this._data = undefined;
    super.reset();
    return this;
  }
}

class OutputPin extends Pin {
  constructor() {
    super();
    this._data = undefined;
  }

  checkConnection(pin) {
    if (!(pin instanceof InputPin))
      throw new IncompatiblePins(this, pin);

    return this;
  }

  send(data) {
    this._activate(() => {
      this._data = data;
      this.publish(IOPinEvents.send, data);
      for (let pin of this.connections)
        pin.receive(data);
    })

    return this;
  }

  get data() { return this._data; }

  reset() {
    this._data = undefined;
    super.reset();
    return this;
  }
}

module.exports = {
  InputPin: InputPin,
  OutputPin: OutputPin,
  IOPinEvents: IOPinEvents,
}
