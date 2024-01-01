sap.ui.define(["bitech/ui5/lc/ActionForm"], function (ActionForm) {
	// create a new instance of the ActionForm control and
	// place it into the DOM element with the id "content"
	new ActionForm({
		action: "node.odata.test",
		autoSubmit: true,
		sent: function (event) {
			alert("Action test submitted");
		}
	}).placeAt("content");
});
