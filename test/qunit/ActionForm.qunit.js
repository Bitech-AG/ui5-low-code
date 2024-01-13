/*global QUnit */
sap.ui.define([
  "sap/ui/core/Lib",
	"bitech/ui5/lc/ActionForm"
], function (Lib, ActionForm) {

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

	let actionForm, formMock;
	let fieldMocks = [];
	// module for basic checks
	QUnit.module("Basic Control Checks", {
		afterEach: () => {
			fieldMocks.forEach(item => item.restore());
			fieldMocks = [];
			formMock?.restore();
			actionForm?.destroy();
		}
	});

	// some basic control checks
	QUnit.test("Test get properties", function (assert) {

		const i18n = Lib.getResourceBundleFor("bitech.ui5.lc");

		assert.expect(3);
		actionForm = new ActionForm({
			action: "node.odata.test"
		});
		assert.equal(actionForm.getAction(), "node.odata.test", "Check action equals 'node.odata.test'");
		assert.equal(actionForm.getAutoSubmit(), false, "Check autoSubmit equals 'false'");
		assert.equal(actionForm.getSubmitText(), i18n.getText("Send"), "Check submitText defaultValue without i18n");
	});

	const createInstance = (assert, properties) => {
		actionForm = new ActionForm(properties).placeAt("uiArea1");
		formMock = sinon.mock(actionForm);
	};
	const mockSend = (assert, message) => {
		formMock.expects("getObjectBinding").once().returns({
			execute: () => {
				assert.ok(true, "Operations is executed");
				
				if (message) {
					const error = new Error(message);

					error.error = {
						message,
						target: "any"
					}
					throw error;
				}
			}
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
	const enterText = (input, text) => new Promise(resolve => {
		setTimeout(() => {
			input.setValue(text);
			input.fireChange();
			resolve();
		}, 100);
	});
	const mockField = (input, metadata) => {
		const mock = sinon.mock(input);

		fieldMocks.push(mock);
		mockMetadata(mock, metadata);
	};

	// some basic eventing check
	QUnit.test("Test success event", async assert => {
		assert.expect(2);

		createInstance(assert, {
			action: "node.odata.test",
			success: function () {
				assert.ok(true, "Event has been fired!");
			}
		});
		mockSend(assert);

		await firePress();

	});

	QUnit.test("Test error event", async assert => {
		assert.expect(3);

		createInstance(assert, {
			action: "node.odata.test",
			error: function (event) {
				assert.ok(true, "Event has been fired!");

				const error = event.getParameter("error");

				assert.ok(error, "Error object exists");
			}
		});
		mockSend(assert, "Shit happens");

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
		const input = form.getContent().find(item => item.getInner);

		assert.ok(input, "Input field found");

		mockField(input, metadata);
		input.fireModelContextChange();

		await input.isReady();

		assert.equal(input.getInner().getType(), "Email", "Input field has wrong type");

	});

	QUnit.test("Test complex parameter", async assert => {
		const metadata = {
			"node.odata.fullName": {
				$kind: "ComplexType",
				first: {
					$kind: "property",
					$Type: "Edm.String"
				},
				last: {
					$kind: "property",
					$Type: "Edm.String"
				}
			},
			"node.odata.test": [{
				$kind: "Action",
				$Parameter: [{
					$Name: "name",
					$Type: "node.odata.fullName"
				}]
			}],
			$Annotations: {
			}
		};

		assert.expect(3);

		createInstance(assert, {
			action: "node.odata.test"
		});

		mockMetadata(formMock, metadata);

		await fireModelContextChange(actionForm);

		const form = actionForm.getAggregation("form");
		const fields = form.getContent().filter(item => item.getInner);

		assert.equal(fields?.length, 2, "Input fields found"); // 1. assert

		fields.forEach( field => {
			mockField(field, metadata);
			field.fireModelContextChange();
		});

		await Promise.all(fields.map(field => field.isReady()));

		assert.equal(fields[0].getInner().getName(), "name/first", "Input field has name"); // 2. assert
		assert.equal(fields[1].getInner().getName(), "name/last", "Input field has name"); // 3. assert

	});

	QUnit.test("Test auto submit if all fields are filled", async assert => {
		const metadata = {
			"node.odata.test": [{
				$kind: "Action",
				$Parameter: [{
					$Name: "anything",
					$Type: "Edm.String"
				}]
			}],
			"$Annotations": {}
		};

		assert.expect(2);

		createInstance(assert, {
			action: "node.odata.test",
			autoSubmit: true
		});

		mockMetadata(formMock, metadata);
		mockSend(assert);//2. assert

		await fireModelContextChange(actionForm);

		const form = actionForm.getAggregation("form");
		const field = form.getContent().find(item => item.getInner);

		assert.ok(field, "Input field found"); // 1. assert

		mockField(field, metadata);
		field.fireModelContextChange();

		await field.isReady();

		const inner = field.getInner();

		await enterText(inner, `Shoot!`);

	});

	QUnit.test("Test auto submit should not work if all fields are not filled", async assert => {
		const metadata = {
			"node.odata.test": [{
				$kind: "Action",
				$Parameter: [{
					$Name: "anything",
					$Type: "Edm.String"
				}, {
					$Name: "anyotherthing",
					$Type: "Edm.String"
				}]
			}],
			"$Annotations": {}
		};

		assert.expect(1);

		createInstance(assert, {
			action: "node.odata.test",
			autoSubmit: true
		});

		mockMetadata(formMock, metadata);
		mockSend(assert);//2. assert should not reach

		await fireModelContextChange(actionForm);

		const form = actionForm.getAggregation("form");
		const fields = form.getContent().filter(item => item.getInner);

		assert.equal(fields.length, 2,  "Input fields found"); // 1. assert

		fields.forEach(item => {
			mockField(item, metadata);
			item.fireModelContextChange();
		});

		await Promise.all(fields.map(item => item.isReady()));

		const inner = fields[0].getInner();

		await enterText(inner, `Shoot!`);

	});
});
