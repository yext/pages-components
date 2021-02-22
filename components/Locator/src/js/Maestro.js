import { Type, assertType, assertInstance } from '@yext/components-util';
import { Historian, HistorianOptions } from '@yext/components-historian';
import { Renderer, RendererOptions } from '@yext/components-renderer';
import { Oracle, OracleOptions } from './Oracle.js';


class MaestroOptions extends OracleOptions {
  constructor(searchForm) {
    super(searchForm);

    this.dataPreprocessor = async data => data;
    this.renderer = new RendererOptions().build();
    this.templateData = {};

    this.historian = new HistorianOptions()
      .withStateHandler(data => this.renderer.render(data))
      .withURLPathQueryForState(data => `${window.location.pathname}?${data.query}`)
      .build();
  }

  /**
   * dataPreprocessor: async function(data) => data
   * Function called first after receiving search response data
   * Can be used to modify results, such as custom sorting and filtering.
   */
  withDataPreprocessor(cb) {
    assertType(cb, Type.FUNCTION);

    this.dataPreprocessor = cb;
    return this;
  }

  /**
   * historian: Historian
   */
  withHistorian(historian) {
    assertInstance(historian, Historian);

    this.historian = historian;
    return this;
  }

  /**
   * renderer: Renderer
   */
  withRenderer(renderer) {
    assertInstance(renderer, Renderer);

    this.renderer = renderer;
    return this;
  }

  /**
   * templateData: Object
   * Additional data that will be added to the search response data and passed
   * to the renderer
   * This could be data that was put on the page by the soy template, for example:
   * {“baseUrl”:”../”,”ctaText”:”Visit Store Website”}, etc.
   */
  withTemplateData(templateData) {
    this.templateData = templateData;
    return this;
  }

  build() {
    return new Maestro(this);
  }
}

class Maestro extends Oracle {
  constructor(options) {
    assertInstance(options, MaestroOptions);

    super(options);

    this._historian = options.historian;
    this._renderer = options.renderer;
    this._templateData = options.templateData;

    this._submitCallback = async data => {
      Object.assign(data, this._templateData);
      data = await options.dataPreprocessor(data);
      this._historian.saveState(data, !window.history.state);
      this.render(data);
      options.submitCallback(data);
    };

    if ((window.history.state || {}).query) {
      // If navigating back from a different page, the state will still be there.
      this._historian.restoreState();
    } else {
      this.submit();
    }
  }

  /**
   * addRenderTarget(renderTarget)
   * Calls renderer.register(renderTarget)
   */
  addRenderTarget(renderTarget) {
    this._renderer.register(renderTarget);
  }

  /**
   * removeRenderTarget(renderTarget) => bool
   * Calls renderer.deregister(renderTarget) and returns result
   */
  removeRenderTarget(renderTarget) {
    return this._renderer.deregister(renderTarget);
  }

  /**
   * render(data)
   * Calls renderer.render(data)
   */
  render(data) {
    this._renderer.render(data);
  }

  /**
   * searchAndRender(searchURL)
   * Calls Oracle.search(searchURL) and passes response data to submitCallback
   * Can be used to render special queries, such as all locations from a data URL
   */
  searchAndRender(searchURL) {
    this.constructor.search(searchURL).then(this._submitCallback.bind(this));
  }
}

export {
  Maestro,
  MaestroOptions
};
