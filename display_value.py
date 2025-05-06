import json
from comfy.comfy_types.node_typing import IO

class DisplayValue:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "value": (IO.ANY, {"forceInput": True}),
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
    def format_value(value):
        if isinstance(value, list):
            value = value[0]
        if isinstance(value, (str, int, float, bool)):
            return str(value)
        if value is not None:
            try:
                return json.dumps(value)
            except Exception:
                try:
                    return str(value)
                except Exception:
                    return "source exists, but could not be serialized."
        return "None"

    def notify(self, value=None, unique_id=None, extra_pnginfo=None):
        value_str = self.format_value(value)

        if unique_id and isinstance(unique_id, list) and extra_pnginfo and isinstance(extra_pnginfo, list):
            self.process_workflow(unique_id[0], extra_pnginfo[0], value_str)

        return {"ui": {"value": [value_str]}, "result": ([value_str],)}

    def process_workflow(self, unique_id, extra_pnginfo, value):
        workflow = extra_pnginfo.get("workflow")
        if workflow and "nodes" in workflow:
            node_id = str(unique_id)
            node = next((n for n in workflow["nodes"] if str(n.get("id")) == node_id), None)
            if node:
                node["widgets_values"] = [value]
