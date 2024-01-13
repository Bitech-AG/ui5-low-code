sap.ui.define([
  "bitech/ui5/lc/Form",
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/ui/core/library",
  "sap/ui/core/Lib",
  "bitech/ui5/lc/lowCode",
  "bitech/ui5/lc/library",
  "bitech/ui5/lc/Field",
  "sap/m/MessageBox"
],
  function (Form, SimpleForm, Button, Toolbar, core, Lib, lowCode, lc, Field, MessageBox) {

    const ActionForm = Form.extend("bitech.ui5.lc.ActionForm", {
      metadata: {
        properties: {
          action: { type: "string", group: "Misc" },
          autoSubmit: { type: "boolean", group: "Misc", defaultValue: false },
          submitText: { type: "string", group: "Misc", defaultValue: "Send" }
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
          success: {}
        }
      },
      init: function () {
        Form.prototype.init.call(this);

        const i18n = Lib.getResourceBundleFor("bitech.ui5.lc");
        this.sendButton = new Button(
          `${this.getId()}--send`, {
          text: i18n.getText("Send"),
          type: "Emphasized",
          press: this.submitForm.bind(this)
        });
        this.addProtectedToolbar(this.sendButton);

      },
      getSubmitText: function() {
        return this.sendButton.getText();
      },
      setSubmitText: function(value) {
        this.sendButton.setText(value);
      },
      submitForm: async function () {
        const form = this.getAggregation("form");

        form.setBusy(true);

        const operation = this.getObjectBinding();

        try {
          this.resetState();
          await operation.execute("$direct");

          form.setBusy(false);
          this.resetForm();
          this.fireSuccess();

        } catch (error) {
          form.setBusy(false);

          this.onError(error);
        }
      },
      onItemChanged: function () {
        if (this.getAutoSubmit() && this.checkLevel()) {
          this.submitForm();
        }
      },
      checkLevel: function () {
        const form = this.getAggregation("form");
        const initialValues = form.getContent()
          .filter(item => item.isInitial && item.isInitial());

        return initialValues?.length ? false : true;

      },
      getTarget: function(metadata) {
        const actionName = this.getAction();
        const notFound = `Action mit dem Namen '${actionName}' ist nicht definiert`;

        if (!metadata[actionName]) {
          throw new Error(notFound);
        }

        const action = metadata[actionName].find(item => item.$kind === "Action");

        if (!action) {
          throw new Error(notFound);
        }

        return {
          target: actionName, 
          targetType: lc.TargetType.Action, 
          annoPath: `${actionName}()`, 
          fieldsIn: action.$Parameter,
          propPrefix: `$Parameter/`
        };
      }
    });
    return ActionForm;
  }, /* bExport= */true);