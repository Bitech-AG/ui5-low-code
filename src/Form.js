sap.ui.define([
  "sap/ui/core/Control",
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
  function (Control, SimpleForm, Button, Toolbar, core, Lib, lowCode, lc, Field, MessageBox) {

    const Form = Control.extend("bitech.ui5.lc.Form", {
      metadata: {
        properties: {
        },
        defaultAggregation: "content",
        aggregations: {
          form: { type: "sap.ui.layout.form.SimpleForm", multiple: false, visibility: "hidden" },
          toolbar: {
            type: "sap.ui.core.Control", multiple: true,
            forwarding: {
              idSuffix: "--form--toolbar--public",
              aggregation: "content"
            }
          }
        },
        events: {
          error: {
            parameters: {
              error: {
                allowPreventDefault: true,
                type: "object"
              }
            }
          }
        }
      },
      init: function () {
        Control.prototype.init.call(this);

        const form = new SimpleForm(`${this.getId()}--form`, {
          layout: "ColumnLayout"
        });

        const toolbar = new Toolbar(`${form.getId()}--toolbar`);
        const toolbarPublic = new Toolbar(`${toolbar.getId()}--public`, {
          width: "100%",
          style: "Clear"
        });
        const toolbarProtected = new Toolbar(`${toolbar.getId()}--protected`, {
          width: "100%",
          style: "Clear"
        });

        toolbar.addContent(toolbarProtected);
        toolbar.addContent(toolbarPublic);

        form.setToolbar(toolbar);

        this.setAggregation("form", form);

        this.attachModelContextChange(this.onModelContextChange.bind(this));

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
      getItems: function (pathIn, fieldsIn, metadata, target, propPrefix) {
        const result = [];
        const annotations = metadata.$Annotations[`${target}`];
        const fields = annotations && annotations["@fields"];

        const params = fields ? fields.map(field => {
          const param = fieldsIn.find(item => item.$Name === field);

          if (!param) {
            throw new Error(`Target '${target}' doesn't have parameter named '${field}'`);
          }

          return param;
        }) : fieldsIn;

        params.forEach(param => {
          if (param.$isCollection) {
            return;
          }

          let subResult;
          if (param.$Type.indexOf("node.odata") >= 0) {
            const path = pathIn ? `${pathIn}/${param.$Name}` : `${propPrefix}${param.$Name}`;
            subResult = lowCode.getItems(path, metadata[param.$Type], metadata, param.$Type, "@fields");

            subResult.forEach(item => result.push(item));
          } else {
            subResult = lowCode.resolveProperty(
              pathIn ? `${propPrefix}${pathIn}/${param.$Name}` : `${propPrefix}${param.$Name}`,
              param.$Name,
              { [param.$Name]: param },
              metadata,
              target);

            result.push(subResult);
          }

        });

        return result;


      },
      addControl: function (field, target, targetType, path) {
        const form = this.getAggregation("form");
        const id = `${form.getId()}--${field.path.replace("$Parameter/", "").replace("/", "-")}`;
        const properties = {
          target: target,
          targetType: targetType,
          path
        };

        if (this.onItemChanged) {
          properties.change = this.onItemChanged?.bind(this);
        }

        form.addContent(lowCode.getFieldLabel(id, false, field));
        form.addContent(new Field(id, properties));
      },
      onError: function (error) {
        const executeDefault = this.fireError({ error });

        if (executeDefault && !error.error?.target) {
          MessageBox.error(error.message);
        }
      },
      isReady: async function () {
        return await this.initContext();
      },
      initContext: async function () {
        if (!this._isReady) {
          this._isReady = new Promise(async function (resolve, reject) {
            try {
              const metadata = await lowCode.modelContextChange(this);
              const { target, targetType, annoPath, fieldsIn, propPrefix } = this.getTarget(metadata);
              const form = this.getAggregation("form");

              if (form.getContent().length) {
                resolve();
                return;
              }

              const fields = this.getItems("", fieldsIn, metadata, annoPath, propPrefix);

              fields.forEach(field => {
                this.addControl(field, target, targetType, field.path);
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