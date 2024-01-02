sap.ui.define([
  "sap/ui/core/Control",
  "bitech/ui5/lc/lowCode",
  "bitech/ui5/lc/library",
  "sap/m/DateTimePicker",
  "sap/m/Switch",
  "sap/m/Input",
  "sap/m/Text"
],
function (Control, lowCode, lc, DateTimePicker, Switch, Input, Text) {
  
  const Form = Control.extend("bitech.ui5.lc.Field", {
    metadata: {
      interfaces: [
        "sap.ui.core.IFormContent"
      ],
      properties: {
        target: { type: "string", group: "Misc" },
        targetType: { type: "bitech.ui5.lc.TargetType", group: "Misc", defaultValue: lc.TargetType.Entity },
        path: { type: "string", group: "Misc" }
      },
      defaultAggregation: "content",
      aggregations: {
        inner: { type: "sap.ui.core.Control", multiple: false }
      },
      events: {
        change: {
          parameters: {
          }
        }
      }
    },
    init: function () {
      Control.prototype.init.call(this);

      this.attachModelContextChange(this.onModelContextChange.bind(this));

    },
    getType: function (propType, kindOfString) {
      if (propType === "Edm.Double") {
        return "Number";
      }

      switch (kindOfString) {
      case "email": return "Email";
      case "number": return "Number";
      case "password": return "Password";
      case "tel": return "Tel";
      case "text": return "Text";
      case "url": return "Url";
      default: throw new Error(`'${kindOfString}' is unknown kind of string`);
      }
    },
    resolvePath: function (pathIn, parameter, metadata, actionName) {
      const param = parameter.find(item => `$Parameter/${item.$Name}` === pathIn);

      if (param.$Type.indexOf("node.odata") >= 0) {
        const path = pathIn ? `${pathIn}/${param.$Name}` : param.$Name;
        return this.resolvePath(path, metadata[param.$Type], metadata, param.$Type);

      } else {
        const result = lowCode.resolveProperty(
          pathIn,
          param.$Name,
          { [param.$Name]: param },
          metadata,
          actionName);

        return {
          ...result,
          ...param
        };

      }

    },

    addControl: function (metadata) {
      const id = `${this.getId()}--${metadata.path.replace("$Parameter/", "").replace("/", "-")}`;
      let inner;

      if (metadata.readonly) {
        // add readonly key text or ignore
        inner = new Text({
          id,
          text: `{${metadata.path}}`,
          visible: `{= \${path: '${metadata.path}', targetType: 'any'} === null ? false : true }`
        });

      } else {
        switch (metadata.$Type) {
        case "Edm.DateTimeOffset":
          inner = new DateTimePicker(id, {
            name: metadata.name,
            showCurrentDateButton: true,
            showCurrentTimeButton: true,
            value: `{
                    path: '${metadata.path}',
                    type: 'sap.ui.model.odata.type.DateTimeOffset',
                    formatOptions: {
                      source: {
                        pattern: "yyyy-MM-dd-HH-mm-ss"
                      }
                    }
                  }`
          });
          break;

        case "Edm.Boolean":
          inner = new Switch({
            id,
            name: metadata.name,
            state: `{${metadata.path}}`
          });
          break;

        case "Edm.String":
        case "Edm.Double":
          inner = new Input({
            id,
            name: metadata.name,
            value: `{${metadata.path}}`,
            type: this.getType(metadata.$Type, metadata.kindOfString),
            maxLength: metadata.$Maxlength || 0
          });
          break;

        default:
          throw new Error(`Type '${metadata.$Type}' is not supported`);
        }

      }

      this.setAggregation("inner", inner);

    },
    isReady: async function() {
      return await this.initContext();
    },
    initContext: async function() {
      if (!this._isReady) {
        this._isReady = new Promise(async function(resolve, reject) {
          const metadata = await lowCode.modelContextChange(this);
          const targetName = this.getTarget();
          const targetType = this.getTargetType();
          const notFoundTarget = targetType === lc.TargetType.Entity ? `Entity mit dem Namen '${targetName}' nicht definiert` : `Action mit dem Namen '${targetName}' ist nicht definiert`;
          const inner = this.getAggregation("inner");
    
          if (!metadata[targetName]) {
            reject(new Error(notFoundTarget));
            return;
          }
    
          const target = targetType === lc.TargetType.Entity ? metadata[targetName] : metadata[targetName].find(item => item.$kind === "Action");
    
          if (!target) {
            reject(new Error(notFoundTarget));
            return;
          }
    
          if (inner) {
            resolve();
            return;
          }
    
          const path = this.getPath();
          const propMetadata = this.resolvePath(path, target.$Parameter, metadata, `${targetName}()`);
    
          this.addControl(propMetadata);

          resolve();

        }.bind(this));
      }

      return await this._isReady;
    },
    onModelContextChange: async function () {
      return await this.initContext();
    }
  });
  return Form;
}, /* bExport= */true);