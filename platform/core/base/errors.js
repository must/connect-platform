/**
 *
 *
 * the errors for {@link module:platform/core/base} module.
 *
 * @module platform/core/base/errors
 * @version 0.1.3
 *
 */

/**
 *
 *
 * represents the errors that occur in the process of connecting two pins.
 * this is a base class for all such errors and not a concrete error event itself.
 *
 * @abstract
 *
 */
class PinConnectionError extends Error {
  /**
   *
   * @constructor
   *
   * @param {string} reason the reason the two pins couldn't connect.
   * @param {module:platform/core/base/pin~Pin} pin1 the first pin.
   * @param {module:platform/core/base/pin~Pin} pin2 the second pin.
   *
   */
  constructor(reason, pin1, pin2) {
    super(`cannot connect ${pin1} to ${pin2}: ${reason}`);

    this.reason = reason;
    this.pin1 = pin1;
    this.pin2 = pin2;
  }
}

/**
 *
 *
 * occurs in case of an attempt for connecting pins of
 * incompatible types.
 *
 * @see [PinConnectionError]{@link module:platform/core/base/errors~PinConnectionError}
 *
 */
class IncompatiblePins extends PinConnectionError {
  /**
   *
   * @constructor
   *
   * @param {module:platform/core/base/pin~Pin} pin1 the first pin.
   * @param {module:platform/core/base/pin~Pin} pin2 the second pin.
   *
   */
  constructor(pin1, pin2) {
    super(`${typeof(pin1)} and ${typeof(pin2)} aren't compatible.`, pin1, pin2);
  }
}

/**
 *
 *
 * occurs in case of wrong node output, i.e. an output doesn't matching
 * the node's signature.
 *
 */
class WrongNodeOutput extends Error {
  /**
   *
   * @constructor
   *
   * @param {module:platform/core/base/node~Node} node the node with wrong output
   * @param output the output that did not match
   *
   */
  constructor(node, output) {
    super(`${output} is not acceptable for node with signature ${JSON.stringify(node.signature)}.'`);
  }
}

module.exports = {
  PinConnectionError: PinConnectionError,
  IncompatiblePins: IncompatiblePins,

  WrongNodeOutput: WrongNodeOutput,
}
