sap.ui.define([
  "sap/m/Label"
],
function (Label) {
  

  return {
    modelContextChange: function (source) {
      return new Promise((resolve, reject) => {
        let id;
        let pastTime = 0;

        id = setInterval(() => {
          try {
            const model = source.getModel();
            const metaModel = model.getMetaModel();
            const metadata = metaModel.getData();
  
            pastTime += 100;
  
            if (metadata || pastTime > 2000) {
              clearInterval(id);
              resolve(metadata);
            }
            
          } catch (error) {
            clearInterval(id);
            reject(error);
          }
        }, 100);
      });
    },
    resolveProperty: function (path, name, entity, metadata, entityType) {
      const annotations = metadata.$Annotations[`${entityType}/${name}`];
      const result = {
        name, path,
        readonly: annotations && annotations["@readonly"],
        label: annotations && annotations["@label"] || name,
        kindOfString: annotations && annotations["@kindOfString"] || "text",
        $Key: entity.$Key,
        ...entity[name]
      };

      return result;
    },
    getProperty(name, entity, metadata) {
      if (name.indexOf("/") >= 0) {
        const [current, next, ] = name.split("/");

        if (!entity[current]) {
          throw new Error(`Property '${current}' is not defined in '${entity.$Type}'`);
        }
        return this.getProperty(next, metadata[entity[current].$Type]);
      }

      if (!entity[name]) {
        throw new Error(`Property '${name}' is not defined in '${entity.$Type}'`);
      }

      return entity[name];
    },
    hasProperty(name, entity, metadata) {
      if (name.indexOf("/") >= 0) {
        const [current, next, ] = name.split("/");

        if (!entity[current]) {
          return false;
        }
        return this.hasProperty(next, metadata[entity[current].$Type]);
      }

      return entity[name] ? true : false;

    },
    getItems: function (pathIn, entity, metadata, entityType, listAnno) {
      const result = [];
      const annotations = metadata.$Annotations[`${entityType}`];
      let properties = annotations && annotations[listAnno];

      if (!properties) {
        // no annotations -> map to list of names
        properties = Object.keys(entity).filter(name => name != "$Key" && name != "$kind" && name[0] != "@");

      } else {
        // validation of annotations
        properties.forEach(field => {
          if (!this.hasProperty(field, entity, metadata)) {
            throw new Error(`Property '${field}' is not defined in '${entityType}'`);
          }
        });

      }

      properties.forEach(name => {
        // entity or deep parameter
        const item = this.getProperty(name, entity, metadata);
        let subResult;

        if (item.$isCollection) {
          return;
        }

        if (item.$Type.indexOf("node.odata") >= 0) {
          const path = pathIn ? `${pathIn}/${name}` : name;
            
          subResult = this.getItems(path, metadata[item.$Type], metadata, item.$Type, listAnno);

        } else if (name.indexOf("/") >= 0) {
          const [current, next, rest] = name.split("/");
          subResult = this.resolveProperty(pathIn ? `${pathIn}/${current}/${next}` : `${current}/${next}`, `${next}${rest || ""}`, metadata[entity[current].$Type], metadata, entity[current].$Type);

        } else {
          subResult = this.resolveProperty(pathIn ? `${pathIn}/${name}` : name, name, entity, metadata, entityType);

        }
        subResult.forEach(item => result.push(item));

      });

      return result;
    },
    getFieldLabel: function(id, keyInUpdateMode, property) {
      return new Label({
        text: property.label,
        labelFor: id,
        required: !property.$Nullable && property.$Type != "Edm.Boolean"
            && !keyInUpdateMode && !property.readonly,
        visible: keyInUpdateMode || property.readonly ? `{= \${path: '${property.path}', targetType: 'any'} === null ? false : true }` : true
      });
    },
    getFieldControls: function(id, keyInUpdateMode, property) {
      const result = [];

      result.push(this.getFieldLabel(id, keyInUpdateMode, property));

      return result;
    }
  };
});