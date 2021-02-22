import { Type, assertType, assertInstance } from '@yext/components-util';

class RenderTargetOptions {
  constructor() {
    this.onBeforeRender = data => {};
    this.onPostRender = (data, updated) => {};
  }

  /**
   * onBeforeRender: function(data)
   * Function called before rendering with data to be rendered
   */
  withOnBeforeRender(onBeforeRender) {
    assertType(onBeforeRender, Type.FUNCTION);

    this.onBeforeRender = onBeforeRender;
    return this;
  }

  /**
   * onPostRender: function(data, updated)
   * Function called after rendering with data rendered and element/object updated.
   * updated may be null.
   */
  withOnPostRender(onPostRender) {
    assertType(onPostRender, Type.FUNCTION);

    this.onPostRender = onPostRender;
    return this;
  }

  build() {
    return new RenderTarget(this);
  }
}

class RenderTarget {
  constructor(options) {
    assertInstance(options, RenderTargetOptions);

    this._onBeforeRender = options.onBeforeRender;
    this._onPostRender = options.onPostRender;

    // Wrap pre- and post-render functions with this.render
    // For subclasses, `this.render` will refer to the subclass's implementation
    const renderFunction = this.render.bind(this);
    this.render = async data => {
      this._onBeforeRender(data);
      const updated = await renderFunction(data);
      this._onPostRender(data, updated);
    }
  }

  /**
   * async render(data) => DOMNode
   * Renders data (response object from the Oracle) for the target. Must be
   * implemented by a subclass. Return value may be null.
   */
  async render(data) {
    throw new Error('RenderTarget.render must be implemented by subclass');
  }
}

export {
  RenderTarget,
  RenderTargetOptions
};
