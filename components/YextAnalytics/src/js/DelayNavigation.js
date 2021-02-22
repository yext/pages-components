function DelayNavigation(action, event) {
  if (!event) {
    action();
    return;
  }
  let el = event.srcElement || event.target;

  /* Loop up the DOM tree through parent elements if clicked element is not a link (eg: an image inside a link) */
  while (el &&
  (typeof el.tagName == 'undefined' || el.tagName.toLowerCase() != 'a' ||
    !el.href)) {
    el = el.parentNode;
  }

  let willFire = false;
  const rightClick = event.which === 3;

  /* if a link with valid href has been clicked */
  if (el && el.href && el.dataset.yaNoWait !== 'true' && !rightClick  && !event.defaultPrevented) {
    const link = el.href;

    /* Only if it is an external link */
    if (
      link.indexOf(location.host) == -1 &&
      !(el.protocol == 'mailto:' || el.protocol == 'tel:' ||
        el.protocol == 'javascript:')
    ) {
      /* Is actual target set and not _(self|parent|top)? */
      let target = el.target && !el.target.match(/^_(self|parent|top)$/i)
        ? el.target
        : false;

      /* Assume a target if Ctrl|shift|meta-click */
      if (
        event.ctrlKey || event.shiftKey || event.metaKey || event.which == 2
      ) {
        target = '_blank';
      }

      if (!target) {
        willFire = true;

        let hbrun = false;
        // tracker has not yet run
        /* HitCallback to open link in same window after tracker */
        const hitBack = function() {
          /* run once only */
          if (hbrun)
            return;
          hbrun = true;
          window.location.href = link;
        };
        /* Prevent standard click, track then open */
        event.preventDefault
          ? event.preventDefault()
          : event.returnValue = false;
        /* send event with callback */
        action(hitBack);
      }
    }
  }

  if (!willFire)
    action();
}

export {
  DelayNavigation
};
