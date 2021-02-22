import { Tab } from './Tab.ts';

export class SettingsTab implements Tab {
  title: HTMLElement
  list: HTMLElement
  siblings: HTMLElement[]

  constructor () {
    this.title = document.createElement('h2');
    this.title.classList.add('Analytics-tabs--title');
    this.title.innerText = 'Settings';

    this.list = this.makeList();

    const theme = [{
      text: 'Settings Accent Color',
      colorClass: 'accent',
      scssBind: 'settings-accent'
    }, {
      text: 'Settings Text Color',
      colorClass: 'text',
      scssBind: 'settings-text'
    }, {
      text: 'Tooltip Background Color',
      colorClass: 'tbc',
      scssBind: 'tooltip-background'
    }, {
      text: 'Tooltip Text Color',
      colorClass: 'ttc',
      scssBind: 'tooltip-text'
    }, {
      text: 'Scopes Background Color',
      colorClass: 'sbc',
      scssBind: 'scope-background'
    }, {
      text: 'Scopes Text Color',
      colorClass: 'stc',
      scssBind: 'scope-text'
    }];

    for (const item of theme) {
      this.list.appendChild(this.makeThemeItem(item.text, item.colorClass, item.scssBind));
    }

    this.siblings = [
      this.title,
      this.list
    ];
  }

  getTemplate(): HTMLElement {
    let tab = document.createElement('div');
    tab.classList.add('Analytics-tabs--item');
    this.siblings.forEach(sibling => tab.appendChild(sibling));
    return tab;
  }

  makeList(): HTMLElement {
    let dataList = document.createElement('ul');
    dataList.classList.add('Analytics-list');
    return dataList;
  }

  makeThemeItem(text: string = '', colorClass: string = '', scssBind: string = ''): HTMLElement {
    let listItem: HTMLElement = document.createElement('li');
    listItem.classList.add('Analytics-list--item');
    listItem.addEventListener('click', (evt: Event) => {
      const target: HTMLElement = <HTMLElement> evt.target;
      if (target.classList.contains('Settings-toggle')) {
        listItem.classList.toggle('edit');
      }
    });

    let itemButton = document.createElement('button');
    itemButton.classList.add('Settings-toggle');
    itemButton.classList.add('no-tooltip');
    itemButton.innerText = text;

    let itemColor = document.createElement('span');
    itemColor.classList.add(`Settings-${colorClass}`);

    let itemInput = document.createElement('input');
    itemInput.classList.add('Settings-input');
    itemInput.classList.add('no-tooltip');
    itemInput.setAttribute('placeholder', 'Please input Hex');
    itemInput.setAttribute('data-variable', scssBind);
    itemInput.addEventListener('keyup', (evt: Event) => {
      const target: HTMLInputElement = <HTMLInputElement> evt.target;
      const value = target.value;
      const attributeValue = target.getAttribute('data-variable');
      const themeElement: HTMLElement = document.querySelector('.xYextDebug');
      themeElement.style.setProperty(
        '--' + attributeValue,
        value
      );
    });

    itemButton.innerText = text;
    itemButton.appendChild(itemColor);

    listItem.appendChild(itemButton);
    listItem.appendChild(itemInput);

    return listItem;
  }

  getButton(): HTMLElement {
    let button = document.createElement('button');
    button.classList.add('Analytics-toggles--item');
    button.classList.add('no-tooltip');
    button.innerText = 'Settings';
    return button;
  }
}
