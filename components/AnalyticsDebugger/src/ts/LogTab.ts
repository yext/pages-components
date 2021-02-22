import { Tab } from './Tab.ts';

export class LogTab implements Tab {
  title: HTMLElement
  searchInput: HTMLElement
  dataList: HTMLElement
  siblings: HTMLElement[]

  constructor () {
    this.title = document.createElement('h2');
    this.title.innerText = 'Log of Fired Events';
    this.title.classList.add('Analytics-tabs--title');

    this.searchInput = document.createElement('input');
    this.searchInput.setAttribute('placeholder', 'Type to search log...');
    this.searchInput.classList.add('Analytics-tabs--search');
    this.searchInput.classList.add('no-tooltip');

    this.dataList = this.makeList();

    this.siblings = [
      this.title,
      this.searchInput,
      this.dataList
    ];
  }

  makeList(): HTMLElement {
    let dataList = document.createElement('ul');
    dataList.classList.add('Analytics-list');
    return dataList;
  }

  clearList(): void {
    this.dataList.innerHTML = '';
  }

  makeItem(text: string = ''): HTMLElement {
    let dataItem = document.createElement('li');
    dataItem.classList.add('Analytics-list--item');
    let itemButton = document.createElement('button');
    itemButton.classList.add('EventNameTab-button');
    itemButton.classList.add('no-tooltip');
    itemButton.innerText = text;
    dataItem.appendChild(itemButton);
    return dataItem;
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
    button.innerText = '3';
    return button;
  }
}
