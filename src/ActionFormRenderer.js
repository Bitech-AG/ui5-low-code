
sap.ui.define([
],
function() {
  

  const FormRenderer = {
    apiVersion: 2,
    render: function (rm, control) {
      rm.openStart("div", control)
        .openEnd();

      const form = control.getAggregation("form");
      rm.renderControl(form); 

      rm.close("div"); // end of the complete Control
    }
  };

  return FormRenderer;

}, /* bExport= */ true);