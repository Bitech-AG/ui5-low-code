sap.ui.define([
  "bitech/ui5/lc/Form",
  "sap/m/Text",
  "bitech/ui5/lc/library",
  "sap/m/ToolbarSpacer",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "bitech/ui5/lc/lowCode"
],
function (Form, Text, lib, ToolbarSpacer, Button, Toolbar, MessageBox, Dialog, lowCode) {
  
  const EntityForm = Form.extend("bitech.ui5.lc.EntityForm", {
    metadata: {
      properties: {
        mode: { type: "bitech.ui5.lc.FormMode", group: "Misc", defaultValue: lib.FormMode.Update },
        entityType: { type: "string", group: "Misc" },
        deletable: { type: "boolean", group: "Misc" }
      },
      defaultAggregation: "content",
      aggregations: {
        protectedToolbar: {
          type: "sap.ui.core.Control", multiple: true, hidden: true,
          forwarding: {
            idSuffix: "--form--toolbar--protected",
            aggregation: "content"
          }
        }
      },
      events: {
        deleted: {
          parameters: {
          }
        }
      }
    },
    init: function () {
      const deletable = this.getDeletable();

      Form.prototype.init.call(this);

      if (deletable) {
        const i18n = Lib.getResourceBundleFor("bitech.ui5.lc");

        this.addProtectedToolbar(new Button({
          text: i18n.getText("Delete"),
          type: "Critical",
          press: this.handleDeleteProfile.bind(this)
        }));
      }

    },
    handleDeleteProfile: async function () {
      try {
        if (!this.approveDialog) {
          const i18n = Lib.getResourceBundleFor("bitech.ui5.lc");

          this.approveDialog = new Dialog({
            type: sap.m.DialogType.Message,
            title: i18n.getText("approveDeleting"),
            content: new Text({ text: i18n.getText("DoYouWantDeleteEntity") }),
            beginButton: new Button({
              type: sap.m.ButtonType.Critical,
              text: i18n.getText("Delete"),
              press: async function () {
                await this.deleteEntity();
                this.approveDialog.close();
              }.bind(this)
            }),
            endButton: new Button({
              text: i18n.getText("Cancel"),
              press: function () {
                this.approveDialog.close();
              }.bind(this)
            })
          });

          this.addDependent(this.approveDialog);
        }

        this.approveDialog.open();

      } catch (error) {
        MessageBox.error(error.message);
      }
    },
    deleteEntity: async function () {
      const form = this.getAggregation("form");

      try {
        const context = this.getBindingContext();

        form.setBusy(true);

        await context.delete();

        form.setBusy(false);
        this.fireDeleted();

      } catch (error) {
        form.setBusy(false);
        this.onError(error);
      }
    },
    getTarget: function(metadata) {
      const entityType = `node.odata.${this.getEntityType()}`;
      const notFound = `Entität mit dem Namen '${entityType}' ist nicht definiert`;

      if (!metadata[entityType]) {
        throw new Error(notFound);
      }

      const entity = metadata[entityType];

      if (!entity) {
        throw new Error(notFound);
      }

      const fields = Object.keys(entity)
        .map(item => ({
          $Name: item,
          ...entity[item]
        }));

      return {
        target: entityType, 
        targetType: lib.TargetType.Entity, 
        annoPath: entityType, 
        fieldsIn: fields,
        propPrefix: ""
      };
    }/*,
    addControl: function (property) {
      const id = `${this.getId()}--${property.path.replace("/", "-")}`;
      //const keyInUpdateMode = property.$Key?.indexOf(property.path) >= 0 && this.getMode() === FormMode.Update;
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

    }*/
  });
  return EntityForm;
}, /* bExport= */true);