sap.ui.define([
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Text",
  "bitech/ui5/lc/library",
  "sap/m/ToolbarSpacer",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "bitech/ui5/lc/lowCode"
],
function (SimpleForm, Text, lib, ToolbarSpacer, Button, Toolbar, MessageBox, Dialog, lowCode) {
  
  const Form = SimpleForm.extend("bitech.ui5.lc.EntityForm", {
    metadata: {
      properties: {
        mode: { type: "bitech.ui5.lc.FormMode", group: "Misc", defaultValue: lib.FormMode.Update },
        entityType: { type: "string", group: "Misc" },
        deletable: { type: "boolean", group: "Misc" }
      },
      events: {
        deleted: {
          parameters: {
          }
        }
      }
    },
    init: function () {
      const toolbar = new Toolbar();
      const deletable = this.getDeletable();

      SimpleForm.prototype.init.call(this);

      this.attachModelContextChange(this.onModelContextChange.bind(this));

      if (deletable) {
        const i18n = Lib.getResourceBundleFor("bitech.ui5.lc");

        toolbar.addContent(new ToolbarSpacer());
        toolbar.addContent(new Button({
          text: i18n.getText("Delete"),
          type: "Critical",
          press: this.handleDeleteProfile.bind(this)
        }));
      }
      this.setToolbar(toolbar);

    },
    handleDeleteProfile: async function () {
      try {
        if (!this.oApproveDialog) {
          const i18n = Lib.getResourceBundleFor("bitech.ui5.lc");

          this.oApproveDialog = new Dialog({
            type: sap.m.DialogType.Message,
            title: i18n.getText("approveDeleting"),
            content: new Text({ text: i18n.getText("DoYouWantDeleteEntity") }),
            beginButton: new Button({
              type: sap.m.ButtonType.Critical,
              text: i18n.getText("Delete"),
              press: async function () {
                await this.deleteEntity();
                this.oApproveDialog.close();
              }.bind(this)
            }),
            endButton: new Button({
              text: i18n.getText("Cancel"),
              press: function () {
                this.oApproveDialog.close();
              }.bind(this)
            })
          });

          this.addDependent(this.oApproveDialog);
        }

        this.oApproveDialog.open();

      } catch (error) {
        MessageBox.error(error.message);
      }
    },
    deleteEntity: async function () {
      try {
        const context = this.getBindingContext();

        await context.delete();

        this.fireDeleted();

      } catch (error) {
        // error handling central
      }
    },
    addControl: function (property) {
      const id = `${this.getId()}--${property.path.replace("/", "-")}`;
      const keyInUpdateMode = property.$Key?.indexOf(property.path) >= 0 && this.getMode() === FormMode.Update;
      const controls = lowCode.getFieldControls(id, keyInUpdateMode, property);

      controls.forEach(this.addContent.bind(this));

    },
    onModelContextChange: async function () {
      const metadata = await lowCode.modelContextChange(this);
      const entityType = `node.odata.${this.getEntityType()}`;
      const entity = metadata[entityType];

      if (this.getContent().length) {
        return;
      }
        
      const properties = lowCode.getItems("", entity, metadata, entityType, "@fields");

      properties.forEach(this.addControl.bind(this));

    }
  });
  return Form;
}, /* bExport= */true);