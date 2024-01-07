sap.ui.define([
  "sap/ui/core/Control",
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Button",
  "sap/m/Toolbar",
  "sap/ui/core/library",
  "sap/ui/core/Core",
  "bitech/ui5/lc/lowCode",
  "bitech/ui5/lc/library",
  "bitech/ui5/lc/Field",
  "sap/m/MessageBox"
],
  function (Control, SimpleForm, Button, Toolbar, core, Core, lowCode, lc, Field, MessageBox) {

    const Form = Control.extend("bitech.ui5.lc.ActionForm", {
      metadata: {
        properties: {
          action: { type: "string", group: "Misc" },
          autoSubmit: { type: "boolean", group: "Misc", defaultValue: false }
        },
        defaultAggregation: "content",
        aggregations: {
          form: { type: "sap.ui.layout.form.SimpleForm", multiple: false, visibility: "hidden" },
          toolbar: {
            type: "sap.ui.core.Control", multiple: true,
            forwarding: {
              idSuffix: "--form--toolbar--inner",
              aggregation: "content"
            }
          }
        },
        events: {
          error: {
            parameters: {
              error : {
                allowPreventDefault : true,
                type: "object"
              }
            }
          },
          success: {}
        }
      },
      init: function () {
        const i18n = Core.getLibraryResourceBundle("bitech.ui5.lc");

        Control.prototype.init.call(this);

        const form = new SimpleForm(`${this.getId()}--form`, {
          layout: "ColumnLayout"
        });

        const toolbar = new Toolbar(`${form.getId()}--toolbar`);
        const toolbarInner = new Toolbar(`${toolbar.getId()}--inner`, {
          width: "100%",
          style: "Clear"
        });

        this.sendButton = new Button(
          `${toolbar.getId()}--send`, {
          text: i18n.getText("Send"),
          type: "Emphasized",
          press: this.submitForm.bind(this)
        });
        toolbar.addContent(this.sendButton);
        toolbar.addContent(toolbarInner);

        form.setToolbar(toolbar);

        this.setAggregation("form", form);

        this.attachModelContextChange(this.onModelContextChange.bind(this));

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

          const executeDefault = this.fireError({error});

          if (executeDefault && !error.error?.target) {
            MessageBox.error(error.message);
          }
        }
      },
      resetState: function () {
        const form = this.getAggregation("form");

        form.getContent()
          .filter(item => item.setValueState)
          .forEach(item => {
            item.setValueState(core.ValueState.None);
          });
      },
      resetForm: function () {
        const form = this.getAggregation("form");

        form.getContent()
          .filter(item => item.setValueState)
          .forEach(item => {
            item.setValue();
          });
      },
      getItems: function (pathIn, parameters, metadata, actionName) {
        const result = [];
        const annotations = metadata.$Annotations[`${actionName}`];
        const fields = annotations && annotations["@fields"];

        const params = fields ? fields.map(field => {
          const param = parameters.find(item => item.$Name === field);

          if (!param) {
            throw new Error(`Action '${actionName}' doesn't have parameter named '${field}'`);
          }

          return param;
        }) : parameters;

        params.forEach(param => {
          if (param.$isCollection) {
            return;
          }

          let subResult;
          if (param.$Type.indexOf("node.odata") >= 0) {
            const path = pathIn ? `${pathIn}/${param.$Name}` : `$Parameter/${param.$Name}`;
            subResult = lowCode.getItems(path, metadata[param.$Type], metadata, param.$Type, "@fields");

            subResult.forEach(item => result.push(item));
          } else {
            subResult = lowCode.resolveProperty(
              pathIn ? `$Parameter/${pathIn}/${param.$Name}` : `$Parameter/${param.$Name}`,
              param.$Name,
              { [param.$Name]: param },
              metadata,
              actionName);

            result.push(subResult);
          }

        });

        return result;


      },
      addControl: function (field, action, path) {
        const form = this.getAggregation("form");

        const id = `${form.getId()}--${field.path.replace("$Parameter/", "").replace("/", "-")}`;

        form.addContent(lowCode.getFieldLabel(id, false, field));
        form.addContent(new Field(id, {
          target: action,
          targetType: lc.TargetType.Action,
          path,
          change: this.onItemChanged.bind(this)
        }));
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
      isReady: async function () {
        return await this.initContext();
      },
      initContext: async function () {
        if (!this._isReady) {
          this._isReady = new Promise(async function (resolve, reject) {
            try {
              const metadata = await lowCode.modelContextChange(this);
              const actionName = this.getAction();
              const notFound = `Action mit dem Namen '${actionName}' ist nicht definiert`;
              const form = this.getAggregation("form");

              if (!metadata[actionName]) {
                throw new Error(notFound);
              }

              const action = metadata[actionName].find(item => item.$kind === "Action");

              if (!action) {
                throw new Error(notFound);
              }

              if (form.getContent().length) {
                resolve();
                return;
              }

              const fields = this.getItems("", action.$Parameter, metadata, `${actionName}()`);

              fields.forEach(field => {
                this.addControl(field, actionName, field.path);
              });

              resolve();

            } catch (error) {
              reject(error);
            }

          }.bind(this));
        }

        return await this._isReady;

      },
      onModelContextChange: async function () {
        await this.initContext();
      }
    });
    return Form;
  }, /* bExport= */true);