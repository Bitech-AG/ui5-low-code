sap.ui.define([
	"sap/ui/core/library"
], function () {
	

	// delegate further initialization of this library to the Core
	// Hint: sap.ui.getCore() must still be used to support preload with sync bootstrap!
	sap.ui.getCore().initLibrary({
		name: "bitech.ui5.lc",
		version: "${version}",
		dependencies: [ // keep in sync with the ui5.yaml and .library files
			"sap.ui.core",
			"sap.m"
		],
		types: [
			"bitech.ui5.lc.TargetType"
		],
		interfaces: [],
		controls: [
			"bitech.ui5.lc.Field",
			"bitech.ui5.lc.ActionForm"
		],
		elements: [],
		noLibraryCSS: true // if no CSS is provided, you can disable the library.css load here
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
	const thisLib = bitech.ui5.lc;

		/**
	 * Semantic Colors of the <code>bitech.ui5.lc.TargetType</code>.
	 *
	 * @enum {string}
	 * @public
	 */
		thisLib.TargetType = {

			/**
			 * OData operation of type action
			 * @public
			 */
			Action : "Action",
	
			/**
			 * Odata entity
			 * @public
			 */
			Entity : "Entity"
	
		};

	return thisLib;

});
