sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit TestSuite for bitech.ui5.lc",
		defaults: {
			bootCore: true,
			ui5: {
				libs: "sap.ui.core,bitech.ui5.lc",
				theme: "sap_horizon",
				noConflict: true,
				preload: "auto"
			},
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./{name}.qunit",
			coverage: {
				only: ["bitech/ui5/lc/"],
				never: ["test-resources/"]
			}
		},
		tests: {
			// test file for the Example control
			Example: {
				title: "QUnit Test for Example",
				_alternativeTitle: "QUnit tests: bitech.ui5.lc.Example"
			}
		}
	};
});
