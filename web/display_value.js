import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";

const nodeName = "DisplayValue";

// Displays input value on a node
app.registerExtension({
  name: nodeName,
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    if (nodeData.name === nodeName) {
      function getCurrentWidgetValue() {
        return this.widgets?.length 
          ? this.widgets.map(widget => widget.value).join("\n") 
          : "";
      }

      function populate(value) {
        if (!this.widgets) this.widgets = []; // Ensure widgets are initialized

        const staticCount = 0;
        this.widgets.splice(staticCount).forEach((w) => w.onRemove?.());

        const lines = Array.isArray(value) ? [...value] : [];
        if (!lines[0]) lines.shift();

        // Generate the new widget value as a string
        const newValue = lines.join("\n");

        // If the new value is the same as the current value, skip updating
        if (getCurrentWidgetValue.call(this) === newValue) {
          return;
        }

        // Only update if the value has changed
        for (const line of lines) {
          const { widget } = ComfyWidgets["STRING"](
            this,
            "", // no label
            ["STRING", { multiline: true }],
            app
          );
          widget.inputEl.readOnly = true;
          widget.inputEl.style.opacity = "0.6";
          widget.inputEl.setAttribute("aria-readonly", "true");
          widget.value = line;
        }

        // Recalculate and adjust the size of the node
        requestAnimationFrame(() => {
          const newSize = this.computeSize();
          newSize[0] = Math.max(newSize[0], this.size[0]);
          newSize[1] = Math.max(newSize[1], this.size[1]);
          this.onResize?.(newSize);
          app.graph.setDirtyCanvas(true, false);
        });
      }

      const baseExecuted = nodeType.prototype.onExecuted;
      nodeType.prototype.onExecuted = function (message) {
        baseExecuted?.apply(this, arguments);

        // Prevent update if message value is the same as current value
        const newMessageValue = Array.isArray(message.value) ? message.value.join("\n") : message.value;

        // Compare and populate only if the value has changed
        if (getCurrentWidgetValue.call(this) !== newMessageValue) {
          populate.call(this, message.value);
        }
      };

      const baseConfigure = nodeType.prototype.onConfigure;
      nodeType.prototype.onConfigure = function () {
        baseConfigure?.apply(this, arguments);
        if (this.widgets_values?.length > 0) {
          const newMessageValue = this.widgets_values.slice(0).join("\n");

          // Skip population if the current widget value is the same as the configured value
          if (getCurrentWidgetValue.call(this) !== newMessageValue) {
            populate.call(this, this.widgets_values.slice(0));
          }
        }
      };
    }
  },
});
