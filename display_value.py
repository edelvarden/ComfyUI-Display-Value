class DisplayValue():
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "value": ("STRING,FLOAT,INT,BOOLEAN", {"forceInput": True}),
            },
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
            },
        }

    INPUT_IS_LIST = True
    RETURN_TYPES = ("STRING",)
    FUNCTION = "notify"
    OUTPUT_NODE = True
    OUTPUT_IS_LIST = (True,)
    CATEGORY = "utils"

    @staticmethod
    def get_value(value):
        if isinstance(value, list):
            value = value[0]
        return str(value) if isinstance(value, (int, float, bool)) else value

    def notify(self, value="", unique_id=None, extra_pnginfo=None):
        value = self.get_value(value)

        if unique_id and isinstance(unique_id, list) and extra_pnginfo and isinstance(extra_pnginfo, list):
            self.process_workflow(unique_id[0], extra_pnginfo[0], value)

        return {"ui": {"value": [value]}, "result": ([value],)}

    def process_workflow(self, unique_id, extra_pnginfo, value):
        """Handles the workflow and updates the node with the value."""
        workflow = extra_pnginfo.get("workflow")
        if workflow and "nodes" in workflow:
            node_id = str(unique_id)
            node = next((n for n in workflow["nodes"] if str(n.get("id")) == node_id), None)
            if node:
                node["widgets_values"] = [value]
