/*global QUnit */
sap.ui.define(["bitech/ui5/lc/ActionForm"], function (ActionForm) {

	// prepare DOM
	const oDiv = document.createElement("div");
	oDiv.id = "uiArea1";
	document.body.appendChild(oDiv);

	// module for basic checks
	QUnit.module("ActionForm Tests");

	// ActionForm sync test
	QUnit.test("Sync", function (assert) {
		assert.expect(1);
		assert.ok(true, "ok");
	});

	// ActionForm async test
	QUnit.test("Async", function (assert) {
		assert.expect(1);
		return new Promise(function (resolve) {
			assert.ok(true, "ok");
			resolve();
		});
	});

	// module for basic checks
	QUnit.module("Basic Control Checks");

	// some basic control checks
	QUnit.test("Test get properties", function (assert) {
		assert.expect(2);
		const actionForm = new ActionForm({
			action: "node.odata.test"
		});
		assert.equal(actionForm.getAction(), "node.odata.test", "Check action equals 'node.odata.test'");
		assert.equal(actionForm.getAutoSubmit(), false, "Check autoSubmit equals 'false'");
	});

	// some basic eventing check
	QUnit.test("Test sent event", function (assert) {
		assert.expect(2);

		const actionForm = new ActionForm("ActionForm", {
			action: "node.odata.test",
			sent: function () {
				assert.ok(true, "Event has been fired!");
			}
		}).placeAt("uiArea1");
		const formMock = sinon.mock(actionForm);

		formMock.expects("getObjectBinding").once().returns({
			execute: () => assert.ok(true, "Operations is executed")
		});
		

		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				try {
					// eslint-disable-next-line new-cap
					actionForm.sendButton.firePress();
					resolve();
				} catch (error) {
					reject(error);
				}
			}, 100);
		});
	});
});
