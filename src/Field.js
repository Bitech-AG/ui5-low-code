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
          inner: { type: "sap.ui.core.Control", multiple: false, hidden: true }
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
      getInner: function () {
        return this.getAggregation("inner");
      },
      _getType: function (propType, kindOfString) {
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
      compareParameter: function (path, param, entity, metadata) {
        // path = 'name/first
        // param = { $Name: 'name', $Type: 'node.odata.fullName' }
        /* entity = {
        $kind: "ComplexType",
        first: {
          $kind: "property",
          $Type: "Edm.String"
        },
        last: {
          $kind: "property",
          $Type: "Edm.String"
        }
      } */
        if (`$Parameter/${param.$Name}` === path) {
          return true;

        }

        if (!entity) {
          return false;
        }

        const [,, next, rest] = path.split("/");

        if (entity[next]) {
          const complex = metadata[entity[next].$Type];

          return !complex ? true : this.compareParameter(
            rest ? `${next}/${rest}` : next,
            entity[next],
            complex,
            metadata);
        }

        return false;

      },
      getEntityProperty: function (pathIn, param, metadata) {
        if (param.$Type.indexOf("node.odata") === -1) {
          return param;
        }

        const [, next, rest] = pathIn.split("/");
        const complex = metadata[param.$Type];

        return this.getEntityProperty(rest, complex[next], metadata);
      },
      resolvePath: function (pathIn, parameter, metadata, actionName) {
        let param = parameter.find(item => this.compareParameter(pathIn, item, metadata[item.$Type], metadata));
        let name = param.$Name;

        if (param.$Type.indexOf("node.odata") >= 0) {
          name = pathIn.replace("$Parameter/", "");
          param = this.getEntityProperty(name, param, metadata);

        }

        const result = lowCode.resolveProperty(
          pathIn,
          name.replace("/", "."),
          { [name]: param },
          metadata,
          actionName);

        return {
          ...result,
          ...param
        };

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
                  }`,
                change: this.onChange.bind(this)
              });
              break;

            case "Edm.Boolean":
              inner = new Switch({
                id,
                name: metadata.name,
                state: `{${metadata.path}}`,
                change: this.onChange.bind(this)
              });
              break;

            case "Edm.String":
            case "Edm.Double":
              inner = new Input({
                id,
                name: metadata.name,
                value: `{${metadata.path}}`,
                type: this._getType(metadata.$Type, metadata.kindOfString),
                maxLength: metadata.$Maxlength || 0,
                change: this.onChange.bind(this)
              });
              break;

            default:
              throw new Error(`Type '${metadata.$Type}' is not supported`);
          }

        }

        this.setAggregation("inner", inner);

      },
      isInitial: function () {
        const inner = this.getAggregation("inner");

        if (inner.getMetadata().getName() === "sap.m.Switch") {
          return false;
        }

        return inner.getValue() ? false : true;

      },
      onChange: function (event) {
        this.fireChange(event);
      },
      isReady: async function () {
        return await this.initContext();
      },
      initContext: async function () {
        if (!this._isReady) {
          this._isReady = new Promise(async function (resolve, reject) {
            try {
              const metadata = await lowCode.modelContextChange(this);
              const targetName = this.getTarget();
              const targetType = this.getTargetType();
              const notFoundTarget = targetType === lc.TargetType.Entity ? `Entity mit dem Namen '${targetName}' nicht definiert` : `Action mit dem Namen '${targetName}' ist nicht definiert`;
              const inner = this.getAggregation("inner");

              if (!metadata[targetName]) {
                throw new Error(notFoundTarget);
              }

              const target = targetType === lc.TargetType.Entity ? metadata[targetName] : metadata[targetName].find(item => item.$kind === "Action");

              if (!target) {
                throw new Error(notFoundTarget);
              }

              if (inner) {
                resolve();
                return;
              }

              const path = this.getPath();
              const propMetadata = this.resolvePath(path, target.$Parameter, metadata, `${targetName}()`);

              this.addControl(propMetadata);

              resolve();

            } catch (error) {
              reject(error);
            }
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