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

	let actionForm, formMock, field1Mock;
	// module for basic checks
	QUnit.module("Basic Control Checks", {
		afterEach: () => {
			field1Mock?.restore();
			formMock?.restore();
			actionForm?.destroy();
		}
	});

	// some basic control checks
	QUnit.test("Test get properties", function (assert) {
		assert.expect(2);
		actionForm = new ActionForm({
			action: "node.odata.test"
		});
		assert.equal(actionForm.getAction(), "node.odata.test", "Check action equals 'node.odata.test'");
		assert.equal(actionForm.getAutoSubmit(), false, "Check autoSubmit equals 'false'");
	});

	const createInstance = (assert, properties) => {
		actionForm = new ActionForm(properties).placeAt("uiArea1");
		formMock = sinon.mock(actionForm);
	};
	const mockSend = assert => {
		formMock.expects("getObjectBinding").once().returns({
			execute: () => assert.ok(true, "Operations is executed")
		});
	};
	const firePress = () => new Promise(resolve => {
		setTimeout(function () {
			actionForm.sendButton.firePress();
			resolve();
		}, 100);
	});
	const mockMetadata = (mock, metadata) => {
		mock.expects("getModel").once().returns({
			getMetaModel: () => ({
				getData: () => {
					return metadata;
				}
			})
		});
	};
	const fireModelContextChange = sender => new Promise((resolve, reject) => {
		setTimeout(() => {
			sender.fireModelContextChange();
			sender.isReady().then(resolve).catch(reject);
		}, 100);
	});

	// some basic eventing check
	QUnit.test("Test sent event", async assert => {
		assert.expect(2);

		createInstance(assert, {
			action: "node.odata.test",
			sent: function () {
				assert.ok(true, "Event has been fired!");
			}
		});
		mockSend(assert);

		await firePress();

	});

	QUnit.test("Test email field", async assert => {
		const metadata = {
			"node.odata.test": [{
				$kind: "Action",
				$Parameter: [{
					$Name: "email",
					$Type: "Edm.String"
				}]
			}],
			$Annotations: {
				"node.odata.test()/email": {
					"@kindOfString": "email"
				}
			}
		};

		assert.expect(2);

		createInstance(assert, {
			action: "node.odata.test"
		});

		mockMetadata(formMock, metadata);

		await fireModelContextChange(actionForm);

		const form = actionForm.getAggregation("form");
		const input = form.getContent().find(item => item.isReady);

		assert.ok(input, "Input field found");

		field1Mock = sinon.mock(input);
		mockMetadata(field1Mock, metadata);
		input.fireModelContextChange();

		await input.isReady();

		assert.equal(input.getAggregation("inner").getType(), "Email", "Input field has wrong type");

	});
});
