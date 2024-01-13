# Bitech UI5 low code library

The library contains a number of the elements that are used to automatically generate user interfaces based on the OData annotations. The library supports OData version 4 only.

## Setup

Extend your ui5.yaml file with

```
---
specVersion: "3.2"
kind: extension
type: project-shim
metadata:
  name: bitech-ui5-lc
shims:
  configurations:
    "@bitech-ag/bitech.ui5.lc":
      specVersion: "3.2"
      type: library
      metadata:
        name: bitech.ui5.lc
```

Install the library as a dependency.

```
npm install @bitech-ag/bitech.ui5.lc --save
```

## ActionForm

extends: sap.ui.core.Control

[src/ActionForm.js](/src/ActionForm.js)

Generates a form for collecting data for an OData action and offers the option of calling the action with the entered parameters.

### Constructor

Parameter | Type    | Description  
----------|---------|--------------
id        | string  | Optional ID for the new control; generated automatically if no non-empty ID is given. Note: this can be omitted, no matter whether <code>settings</code> will be given or not!
settings  | object  | Optional object with initial settings for the new control

### Metadata

Property   | Type    | DefaultValue | Description
-----------|---------|--------------|------------
action     | string  |              | Full qualified name of OData action
autoSubmit | boolean | false        | Submits the form as soon as all mandatory fields have been filled and the Enter key has been pressed.
submitText | string  | "Send"       | Label for the submit button

Aggregation | Type                | Multiple | Description
------------|---------------------|----------|------------
toolbar     | sap.ui.core.Control | true     | Controls for the toolbar of form
content     | sap.ui.core.Control | true     | Not intended for use

Default aggregation: content

Event    | Description
---------|------------
success  | Informs about successful submission of the form
error    | Fired when the form has not been submitted due to an error. The error object is passed to the event. Your own error handling is only necessary for complex properties and parameters.

### Annotations

Annotation | Type     | Description
-----------|----------|------------
fields     | string[] | An array of parameter names. If specified, only these parameters will be displayed and in exactly the order specified.

The form generates the Field elements for each input field. These evaluate further annotations. See [Field Annotations](#annotations-1).

### Example

```
<mvc:View controllerName="bitech.bitlab.example.controller.Login"
  xmlns="sap.m"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns:lc="bitech.ui5.lc" displayBlock="true">
  <Page id="loginPage" showHeader="false">
    <FlexBox id="flexbox" alignItems="Center" justifyContent="Center" direction="Row" height="90%">
      <lc:ActionForm id="loginForm" 
          binding="{/node.odata.login(...)}"
          action="node.odata.login"
          success="handleLoginPress">
        <lc:toolbar>
          <ToolbarSpacer id="toolbarSpacer" />
          <Link id="register" href="#/register" text="{i18n>register}" class="register" />
        </lc:toolbar>
      </lc:ActionForm>
    </FlexBox>
  </Page>
</mvc:View>
```

## Field

extends: sap.ui.core.Control

[src/Field.js](/src/Field.js)

Internally generates a suitable element for entering data. The Field control is currently not intended for direct use. Its interface can change at any time. Only the annotations that are used at the input field level are described here.

### Annotations

Annotation   | Type     | Description
-------------|----------|------------
label        | string   | Label for input field
kindOfString | string   | Type of string as described for property type of sap.m.input
readonly     | boolean  | self-explanatory