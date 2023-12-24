/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library bitech.ui5.lc.
 */
sap.ui.define([
	"sap/ui/core/library"
], function () {
	"use strict";

	// delegate further initialization of this library to the Core
	// Hint: sap.ui.getCore() must still be used to support preload with sync bootstrap!
	sap.ui.getCore().initLibrary({
		name: "bitech.ui5.lc",
		version: "${version}",
		dependencies: [ // keep in sync with the ui5.yaml and .library files
			"sap.ui.core"
		],
		types: [
			"bitech.ui5.lc.ExampleColor"
		],
		interfaces: [],
		controls: [
			"bitech.ui5.lc.Example"
		],
		elements: [],
		noLibraryCSS: false // if no CSS is provided, you can disable the library.css load here
	});

	/**
	 * Some description about <code>bitech.ui5.lc</code>
	 *
	 * @namespace
	 * @name bitech.ui5.lc
	 * @author Richard Martens
	 * @version ${version}
	 * @public
	 */
	var thisLib = bitech.ui5.lc;

	/**
	 * Semantic Colors of the <code>bitech.ui5.lc.Example</code>.
	 *
	 * @enum {string}
	 * @public
	 */
	thisLib.ExampleColor = {

		/**
		 * Default color (brand color)
		 * @public
		 */
		Default : "Default",

		/**
		 * Highlight color
		 * @public
		 */
		Highlight : "Highlight"

	};

	return thisLib;

});
