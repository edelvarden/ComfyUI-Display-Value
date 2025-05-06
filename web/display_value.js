import { app } from "../../../scripts/app.js"
import { ComfyWidgets } from "../../../scripts/widgets.js"

const nodeName = "DisplayValue"

app.registerExtension({
  name: nodeName,

  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name === nodeName) {
      const onNodeCreated = nodeType.prototype.onNodeCreated

      nodeType.prototype.onNodeCreated = function () {
        onNodeCreated?.apply(this)

        if (!this.properties) {
          this.properties = { preview: "" }
        }

        const previewWidget = ComfyWidgets["STRING"](this, "preview", ["STRING", { multiline: true, default: this.properties.preview }], app).widget

        previewWidget.element.style.opacity = "0.6";
        previewWidget.element.setAttribute("aria-readonly", "true");
        previewWidget.element.readOnly = true
        previewWidget.serialize_widgets = true
        previewWidget.serialize = false
      }

      const onExecuted = nodeType.prototype.onExecuted

      nodeType.prototype.onExecuted = function (message) {
        onExecuted?.apply(this, [message])

        const previewWidget = this.widgets?.find((w) => w.name === "preview")

        if (previewWidget) {
          const newValue = Array.isArray(message.value) ? message.value.join("\n") : message.value
          previewWidget.value = newValue
        }
      }
    }
  },
})
