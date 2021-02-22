import { Type, assertType, assertInstance } from '@yext/components-util';
import { RenderTarget, RenderTargetOptions } from './RenderTarget.js';

class ElementRenderTargetOptions extends RenderTargetOptions {
  constructor() {
    super();

    this.element = null;
    this.templateFunction = data => '';
  }

  /**
   * element: DOMNode
   * Wrapper element for rendered content
   */
  withElement(element) {
    this.element = element;
    return this;
  }

  /**
   * templateFunction: function(data)
   * soy2js function or any function that takes data (response object from the
   * Oracle) as an argument and returns an HTML string
   */
  withTemplateFunction(templateFunction) {
    assertType(templateFunction, Type.FUNCTION);

    this.templateFunction = templateFunction;
    return this;
  }

  build() {
    return new ElementRenderTarget(this);
  }
}

class ElementRenderTarget extends RenderTarget {
  constructor(options) {
    assertInstance(options, ElementRenderTargetOptions);

    super(options);

    this._element = options.element;
    this._templateFunction = options.templateFunction;
  }

  /**
   * async render(data) => DOMNode
   * Calls templateFunction(data) and sets value to element.innerHTML, then returns element
   */
  async render(data) {
    if (this._element) {
      this._element.innerHTML = this._templateFunction(data);
    }

    return this._element;
  }
}

export {
  ElementRenderTarget,
  ElementRenderTargetOptions
};
