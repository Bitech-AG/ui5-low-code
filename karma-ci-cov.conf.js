module.exports = function (config) {
	"use strict";

	require("./karma-ci.conf")(config);
	config.set({
		reporters: ["progress", "coverage"],
		preprocessors: {
			"src/**/*.js": ["coverage"],
			"test/**/*.js": ["coverage"]
		},
		proxies: {
			'/resources/bitech/ui5/lc/': '/base/src/',
			'/test-resources/bitech/ui5/lc/': '/base/test/',
		},
		coverageReporter: {
			dir: "coverage",
			reporters: [
				{ type: "html", subdir: "report-html" },
				{ type: "cobertura", subdir: ".", file: "cobertura.txt" },
				{ type: "lcovonly", subdir: ".", file: "report-lcovonly.txt" },
				{ type: "text-summary" }
			]
		}
	});
};
