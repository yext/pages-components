import { assertInstance } from '@yext/components-util';
import { RenderTarget } from './RenderTarget.js';

class RendererOptions {
  constructor() {
    this.renderTargets = new Set();
  }

  /**
   * renderTargets: Set[RenderTarget]
   * All render targets are rendered when the Renderer receives data through render()
   */
  withRenderTarget(renderTarget) {
    assertInstance(renderTarget, RenderTarget);

    this.renderTargets.add(renderTarget);
    return this;
  }

  build() {
    return new Renderer(this);
  }
}

class Renderer {
  constructor(options) {
    assertInstance(options, RendererOptions);

    this._renderTargets = options.renderTargets;
  }

  /**
   * deregister(renderTarget) => bool
   * Removes renderTarget (an instance of RenderTarget) from renderTargets to
   * no longer be updated when new data is received
   * Returns true if renderTarget was successfully removed, false otherwise
   */
  deregister(renderTarget) {
    return this._renderTargets.delete(renderTarget);
  }

  /**
   * register(renderTarget)
   * Adds renderTarget (an instance of RenderTarget) to renderTargets to be
   * updated when new data is received
   */
  register(renderTarget) {
    assertInstance(renderTarget, RenderTarget);

    this._renderTargets.add(renderTarget);
  }

  /**
   * render(data)
   * Renders each renderTarget in renderTargets with data (response object from the Oracle)
   * If render returns a non-null value, calls onLoad() on it (assuming the value is a DOMNode)
   */
  render(data) {
    this._renderTargets.forEach(renderTarget => {
      renderTarget.render(data)
        .catch(err => {
          console.error(`Failed to render ${renderTarget.constructor.name}: ${err}`);
        });
    });
  }
}

export {
  Renderer,
  RendererOptions
};
