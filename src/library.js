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
			"bitech.ui5.lc.FormMode",
			"bitech.ui5.lc.TargetType"
		],
		interfaces: [],
		controls: [
			"bitech.ui5.lc.ActionForm",
			"bitech.ui5.lc.EntityForm",
			"bitech.ui5.lc.Field"
		],
		elements: [],
		noLibraryCSS: true // if no CSS is provided, you can disable the library.css load here
	});

	const thisLib = bitech.ui5.lc;

	thisLib.FormMode = {
		Create: "Create",
		Update: "Update"
	};

	thisLib.TargetType = {
		Action: "Action",
		Entity: "Entity"
	};

	return thisLib;

});
