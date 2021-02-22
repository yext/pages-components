const updateTypes = {
  checked: [
    "radio",
    "checkbox"
  ],
  selected: [
    "option",
  ],
  value: [
    "select-one",
    "select-multiple",
    "button",
    "color",
    "date",
    "datetime",
    "datetime-local",
    "email",
    "hidden",
    "month",
    "number",
    "password",
    "range",
    "reset",
    "search",
    "submit",
    "tel",
    "text",
    "textarea",
    "time",
    "url",
    "week"
  ]
};

const isSelect = el => {
  return el instanceof HTMLSelectElement;
};

export class InputHelper {
  static getElementType(element) {
    return (element.type || element.nodeName).toLowerCase();
  }

  static reset(element) {
    const resetProp = (input, prop, defaultVal) => {
      let didPropValueChange = false;

      if (typeof element[prop] != 'undefined') {
        didPropValueChange = element[prop] !== defaultVal;
        element[prop] = defaultVal;
      }

      return didPropValueChange;
    }

    let didInputPropsChange = false;

    if (isSelect(element) || element.type === 'text') {
      didInputPropsChange = resetProp(element, 'value', '');
    } else if (element.type === 'checkbox' || element.type === 'radio') {
      didInputPropsChange = resetProp(element, 'checked', false);
    } else {
      didInputPropsChange =
        resetProp(element, 'checked', false) ||
        resetProp(element, 'selected', false) ||
        resetProp(element, 'value', '');
    }

    if (didInputPropsChange) {
      this.triggerChange(element);
    }
  }

  static getPropertyToUpdate(element) {
    const type = this.getElementType(element);

    for (let updateType in updateTypes) {
      if (updateTypes[updateType].includes(type)) {
        return updateType;
      }
    }
  }

  static triggerChange(input) {
    const event = document.createEvent('Event');
    event.initEvent('change', true, true);
    input.dispatchEvent(event);
  }

  static copyValue(sourceInput, destInput) {
    const propertyToUpdate = this.getPropertyToUpdate(sourceInput);
    destInput[propertyToUpdate] = sourceInput[propertyToUpdate];
    this.triggerChange(destInput);
  }

  static valuesMatch(input1, input2) {
    const propertyToUpdate = this.getPropertyToUpdate(input1);
    return input1[propertyToUpdate] == input2[propertyToUpdate];
  }

  static isEmpty(input) {
    const property = this.getPropertyToUpdate(input);
    return input[property] ? false : true;
  }
}
