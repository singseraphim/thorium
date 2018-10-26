import uuid from "uuid";
import taskDefinitions from "../tasks";

export default class TaskTemplate {
  constructor(params = {}) {
    this.id = params.id || uuid.v4();
    this.values = params.values || {};
    this.definition = params.definition || "Generic";
  }
  possibleValues({ simulator }) {
    const definition = taskDefinitions.find(t => t.name === this.definition);
    if (!definition || !definition.values) return {};
    return Object.entries(definition.values).reduce((prev, [key, value]) => {
      if (value.input) {
        prev[key] = value.input({ simulator });
      }
      return prev;
    }, {});
  }
  setValue(key, value) {
    this.values[key] = value;
  }
}