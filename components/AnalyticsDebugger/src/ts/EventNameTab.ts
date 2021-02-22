import { TooltipHandler } from './TooltipHandler';
import { Tab } from './Tab';
import { Analytics, CalcEventNameMap } from '@yext/components-yext-analytics';

function ingester(success, failure) {
  return (evt) => {
    let element = evt.target
    const tracked = ['a', 'button', 'input'];
    while (element.parentNode) {
      const isValid: boolean = tracked.indexOf(element.tagName.toLowerCase()) > -1 &&
        !element.classList.contains('no-tooltip');
      if (isValid) {
        success(element);
        return;
      }
      element = element.parentNode;
    }
    failure();
  }
};

function hoverListener(eventNameTab: EventNameTab) {
  eventNameTab.removeTooltips();
  const getName = (trackedElement) => {
    return eventNameTab.yaInstance.CalcEventNameForElement(trackedElement);
  };
  let cleanTooltips = () => {
    document.querySelectorAll(`.Highlight`).forEach(
      element => element.classList.remove('Highlight')
    );
    TooltipHandler.removeAll();
  };
  return ingester((trackedElement) => {
    cleanTooltips();
    TooltipHandler.add(getName(trackedElement), trackedElement);
  }, cleanTooltips);
};

class EventNameTab implements Tab {
  yaInstance: Analytics

  title: HTMLElement
  searchInput: HTMLInputElement
  dataList: HTMLElement
  footerToggle: HTMLElement
  siblings: HTMLElement[]

  eventNameMap: Map<string, HTMLElement[]>
  tooltipListener: EventListener

  constructor(yaInstance: Analytics) {
    this.yaInstance = yaInstance;

    this.title = document.createElement('h2');
    this.title.innerText = 'Event Names';
    this.title.classList.add('Analytics-tabs--title');

    this.searchInput = <HTMLInputElement> document.createElement('input');
    this.searchInput.setAttribute('placeholder', 'Type to search events...');
    this.searchInput.classList.add('Analytics-tabs--search');
    this.searchInput.classList.add('no-tooltip');

    this.searchInput.addEventListener('keyup', (evt: Event) => {
      const target: HTMLInputElement = <HTMLInputElement> evt.target;
      const value: string = target.value;
      const items: NodeListOf<HTMLElement> = document.querySelectorAll('.Analytics-tabs--item.active .Analytics-list--item');
      const hiddenFilter = Array.from(items).filter(
        (item: HTMLElement) => item.innerText.indexOf(value) == -1
      );
      hiddenFilter.forEach(
        (element: HTMLElement) => element.style['display'] = 'none'
      );
      const visibleFilter = Array.from(items).filter(
        (item: HTMLElement) => item.innerText.indexOf(value) > -1
      );
      visibleFilter.forEach(
        (element: HTMLElement) => element.style['display'] = 'block'
      );
    });
    this.footerToggle = document.createElement('button');
    this.footerToggle.classList.add('Analytics-tabs--footerToggle');
    this.footerToggle.classList.add('active');
    this.footerToggle.classList.add('no-tooltip');
    this.footerToggle.innerText = 'Toggle Tooltip Hovers';
    this.footerToggle.addEventListener('click', evt => {
      this.footerToggle.classList.toggle('active');
      if (this.footerToggle.classList.contains('active')) {
        this.enableHoverTooltip();
      } else {
        this.disableHoverTooltip();
      }
    });
    this.tooltipListener = hoverListener(this);
    this.enableHoverTooltip();
    this.dataList = this.makeList();
    this.eventNameMap = new Map();
    this.siblings = [
      this.title,
      this.searchInput,
      this.dataList,
      this.footerToggle
    ];
    this.loadData();
    new MutationObserver(() => this.loadData())
      .observe(document.body, { childList: true, subtree: true });
  }

  enableHoverTooltip(): void {
    document.body.addEventListener('mouseover', this.tooltipListener);
  }

  disableHoverTooltip(): void {
    document.body.removeEventListener('mouseover', this.tooltipListener);
  }

  makeList(): HTMLElement {
    let dataList = document.createElement('ul');
    dataList.classList.add('Analytics-list');
    return dataList;
  }

  clearList(): void {
    this.dataList.innerHTML = '';
  }

  makeItem(text: string = '', elements: HTMLElement[]): HTMLElement {
    let dataItem = document.createElement('li');
    dataItem.classList.add('Analytics-list--item');
    dataItem.setAttribute('data-event-name', text);
    let itemButton = document.createElement('button');
    itemButton.classList.add('EventNameTab-button');
    itemButton.classList.add('no-tooltip');
    itemButton.innerText = text;
    itemButton.addEventListener('click', evt => {
      const activeClass = 'EventNameTab-button--active';
      const highlightClass = 'Highlight';
      this.removeTooltips();
      document.querySelectorAll(`.${activeClass}`).forEach(
        element => element.classList.remove(activeClass)
      );
      document.querySelectorAll(`.${highlightClass}`).forEach(
        element => element.classList.remove(highlightClass)
      );

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (i == 0) {
          TooltipHandler.add(text, element);
        }
        element.classList.add('Highlight');
      }

      itemButton.classList.add(activeClass);
    });
    dataItem.appendChild(itemButton);
    return dataItem;
  }

  removeTooltips(): void {
    TooltipHandler.removeAll();
  }

  getTemplate(): HTMLElement {
    let tab = document.createElement('div');
    tab.classList.add('Analytics-tabs--item');
    this.siblings.forEach(sibling => tab.appendChild(sibling));
    return tab;
  }

  getButton(): HTMLElement {
    let button = document.createElement('button');
    button.classList.add('Analytics-toggles--item');
    button.classList.add('no-tooltip');
    button.innerText = 'Events';
    return button;
  }

  loadData(): void {
    const newEventNameMap = CalcEventNameMap(this.yaInstance);
    for (const str of Array.from(newEventNameMap.keys())) {
      const trackedElements = newEventNameMap.get(str).filter(el => document.body.contains(el) && !el.closest('.Analytics'));
      if (trackedElements.length) {
        newEventNameMap.set(str, trackedElements);
      } else {
        newEventNameMap.delete(str);
        continue;
      }
      const elements = newEventNameMap.get(str);
      const needsUpdate = !this.eventNameMap.has(str) ||
        this.eventNameMap.get(str).find(el => !elements.includes(el)) ||
        elements.find(el => !this.eventNameMap.get(str).includes(el));
      if (needsUpdate && elements.length) {
        if (this.eventNameMap.has(str)) {
          this.dataList.removeChild(
            this.dataList.querySelector(`[data-event-name="${str}"]`)
          );
        }
        const nextChild = Array.from(this.dataList.children)
          .find(el => el.getAttribute('data-event-name') > str) || null;
        this.dataList.insertBefore(
          this.makeItem(str, elements),
          nextChild
        );
      }
    }
    this.eventNameMap = newEventNameMap;
  }
}

export {
  EventNameTab
};
