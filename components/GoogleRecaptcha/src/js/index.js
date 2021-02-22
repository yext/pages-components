import { LoadScript } from '@yext/components-performance';

class Captcha {
  // Initializes values of the Captcha instance
  constructor(endpoint, siteKey) {
    this.endpoint = endpoint;
    this.siteKey = siteKey;
  }

  async getNewToken() {
    // If the {components.GoogleRecaptcha.Script} template has not been called in
    // the <head> OR the loadScriptDynamically function has not been called yet
    // then grecaptcha will be undefined, so no Recapthca token can be retrieved
    if (typeof grecaptcha == 'undefined') {
      throw new Error('No grecaptcha');
    }

    return await new Promise((resolve, reject) => {
      grecaptcha.ready(() => grecaptcha.execute(this.siteKey, { action: 'homepage' })
        .then(resolve)
        .catch(reject)
      );
    });
  }

  async validateUser(token, threshold = 0.5) {
    if (!token) {
      console.error('No grecaptcha token provided');
      return;
    }

    const data = {
      token,
      scoreThresh: threshold
    };
    try {
      const resp = await fetch(this.endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await resp.json();
    } catch (e) {
      console.error(e);
      return {
        Verified: false
      };
    }
  }

  // This is an optional function if you don't wish to call the {components.GoogleRecaptcha.Script}
  // template in the <head> for any PageSpeed concerns.
  loadScriptDynamically(cb = () => {}) {
    LoadScript(`https://www.google.com/recaptcha/api.js?render=${this.siteKey}`, cb);
  }
}

export {
  Captcha
};
