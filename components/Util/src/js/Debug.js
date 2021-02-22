let param = 'xYextDebug';

export class Debug {
  static hasQueryParam() {
    if ('URL' in window && typeof URL === "function") {
      let params = new URL(window.location.href).searchParams;
      return params && params.get(param) == 'true';
    }
    return false;
  }

  static enable() {
    document.documentElement.classList.add(param);
  }

  static disable() {
    document.documentElement.classList.remove(param);
  }

  static isEnabled() {
    let enabled = this.hasQueryParam();
    if (enabled) {
      this.enable();
    }
    return enabled;
  }
}
