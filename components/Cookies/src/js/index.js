export class Cookies {

  // Adapted from http://www.w3schools.com/js/js_cookies.asp
  static getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0, end = ca.length, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return decodeURIComponent(c.substring(name.length, c.length));
      }
    }
    return false;
  }

  // Adapted from http://www.w3schools.com/js/js_cookies.asp
  static setCookie(cname, cvalue, exdays, path, domain) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = `expires=${d.toUTCString()}`;
    let cookie = cname + "=" + encodeURIComponent(cvalue) + "; " + expires;
    if (path) {
      cookie += `; path=${path}`;
    }
    if (domain) {
      cookie += `; domain=${domain}`;
    }
    return document.cookie = cookie;
  }
}
