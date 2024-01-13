
sap.ui.define([
  "sap/ui/core/Renderer",
  "sap/ui/layout/form/SimpleFormRenderer"
],
function(Renderer, SimpleFormRenderer) {
  

  const FormRenderer = Renderer.extend(SimpleFormRenderer);
  
  return FormRenderer;

}, /* bExport= */ true);