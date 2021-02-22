import { Tab } from './Tab';
import { Scope } from './Scope';
import { Analytics } from '@yext/components-yext-analytics';
import { TooltipHandler } from './TooltipHandler';

export class ScopeNameTab implements Tab {
  yaInstance: Analytics;

  title: HTMLElement;
  searchInput: HTMLElement;
  dataList: HTMLElement;
  footerToggle: HTMLElement;
  siblings: HTMLElement[];

  constructor(yaInstance: Analytics) {
    this.yaInstance = yaInstance;

    this.title = document.createElement('h2');
    this.title.innerText = 'Scope Names';
    this.title.classList.add('Analytics-tabs--title');

    this.searchInput = document.createElement('input');
    this.searchInput.setAttribute('placeholder', 'Type to search event scopes...');
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
    this.footerToggle.classList.add('no-tooltip');
    this.footerToggle.innerText = '[Beta] Toggle All Tooltips';
    this.footerToggle.addEventListener('click', (evt: Event) => {
      document.querySelectorAll('.Highlight').forEach(
        (element: HTMLElement) => element.classList.remove('Highlight')
      );
      this.removeTooltips();
      this.footerToggle.classList.toggle('active');
      if (this.footerToggle.classList.contains('active')) {
        this.applyOnScopeElements((scopeName: string) => {
          this.addScopeTooltips(scopeName);
        });
      }
    });
    this.dataList = this.makeList();
    this.siblings = [
      this.title,
      this.searchInput,
      this.dataList,
      this.footerToggle
    ];
    this.updateList();
    new MutationObserver(() => this.updateList())
      .observe(document.body, { childList: true, subtree: true });
  }

  applyOnScopeElements(callback: (param: string) => void): void {
    const scopes: NodeListOf<HTMLElement> = document.querySelectorAll('[data-ya-scope]:not([data-ya-scope-debug])');
    scopes.forEach((scope: HTMLElement) => {
      callback(scope.getAttribute('data-ya-scope'));
      scope.setAttribute('data-ya-scope-debug', '');
    });
  }

  makeList(): HTMLElement {
    let dataList = document.createElement('ul');
    dataList.classList.add('Analytics-list');
    return dataList;
  }

  makeItem(scopeName: string = ''): HTMLElement {
    const activeClass = 'EventNameTab-button--active';

    let dataItem = document.createElement('li');
    dataItem.classList.add('Analytics-list--item');
    dataItem.setAttribute('data-scope-name', scopeName);
    let itemButton = document.createElement('button');
    itemButton.classList.add('EventNameTab-button');
    itemButton.classList.add('no-tooltip');
    itemButton.innerText = scopeName;
    itemButton.addEventListener('click', (evt) => {
      this.removeTooltips();
      document.querySelectorAll('.Highlight').forEach(
        element => element.classList.remove('Highlight')
      );
      document.querySelectorAll(`.${activeClass}`).forEach(
        element => element.classList.remove(activeClass)
      );
      itemButton.classList.add(activeClass);
      this.addScopeTooltips(scopeName);
    });
    dataItem.appendChild(itemButton);
    return dataItem;
  }

  clearList(): void {
    this.dataList.innerHTML = '';
  }

  addScope(scopeName: string): void {
    const element: HTMLElement = document.querySelector(`[data-ya-scope="${scopeName}"]`);
    const scope: Scope = new Scope(scopeName);
    scope.appendTo(document.body);
    scope.position(
      (window.pageYOffset + element.getBoundingClientRect().top) + 'px',
      (element.getBoundingClientRect().right - scope.getWidth()) + 'px',
      'auto',
      'auto'
    );
  }

  addScopeTooltips(scopeName: string): void {
    const element: HTMLElement = document.querySelector(`[data-ya-scope="${scopeName}"]`);
    const taggedItems: NodeListOf<HTMLElement> = element.querySelectorAll('a, input, button');
    taggedItems.forEach((taggedItem: HTMLElement) => {
      TooltipHandler.add(
        this.yaInstance.CalcEventNameForElement(taggedItem),
        taggedItem
      );
    });
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
    button.innerText = 'Scopes';
    return button;
  }

  loadData(): void {
    const scopes = Array.from(
      document.querySelectorAll('[data-ya-scope]:not([data-ya-scope-debug])')
    );
    for (const scope of scopes) {
      const scopeName = scope.getAttribute('data-ya-scope');
      const nextChild = Array.from(this.dataList.children)
        .find(el => el.getAttribute('data-scope-name') > scopeName) || null;
      this.dataList.insertBefore(
        this.makeItem(scopeName),
        nextChild
      );
    }
  }

  updateList(): void {
    this.loadData();
    this.applyOnScopeElements((scopeName: string) => {
      this.addScope(scopeName);
    });
  }
}
