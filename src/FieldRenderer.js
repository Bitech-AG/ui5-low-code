
sap.ui.define([
],
function() {
  

  const FormRenderer = {
    apiVersion: 2,
    render: function (rm, control) {
      const inner = control.getAggregation("inner");
				
      rm.renderControl(inner); 
    }
  };

  return FormRenderer;

}, /* bExport= */ true);