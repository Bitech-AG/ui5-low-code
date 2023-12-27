/*!
 * ${copyright}
 */

// Provides control bitech.ui5.lc.Example.
sap.ui.define(["./library", "sap/ui/core/Control", "./ExampleRenderer"], function (library, Control, ExampleRenderer) {
	

	// refer to library types
	var ExampleColor = library.ExampleColor;

	/**
	 * Constructor for a new <code>bitech.ui5.lc.Example</code> control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Some class description goes here.
	 * @extends sap.ui.core.Control
	 *
	 * @author Richard Martens
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias bitech.ui5.lc.Example
	 */
	var Example = Control.extend(
		"bitech.ui5.lc.Example",
		/** @lends bitech.ui5.lc.Example.prototype */ {
			metadata: {
				library: "bitech.ui5.lc",
				properties: {
					/**
					 * The text to display.
					 */
					text: {
						type: "string",
						group: "Data",
						defaultValue: null
					},
					/**
					 * The color to use (default to "Default" color).
					 */
					color: {
						type: "bitech.ui5.lc.ExampleColor",
						group: "Appearance",
						defaultValue: ExampleColor.Default
					}
				},
				events: {
					/**
					 * Event is fired when the user clicks the control.
					 */
					press: {}
				}
			},
			renderer: ExampleRenderer,
			onclick: function () {
				this.firePress();
			}
		}
	);
	return Example;
});
