require('../sass/index.scss');

import { Debug } from '@yext/components-util';
import { Analytics } from '@yext/components-yext-analytics';
import { Scope } from './Scope.ts';
import { EventNameTab } from './EventNameTab.ts';
import { ScopeNameTab } from './ScopeNameTab.ts';
import { SettingsTab } from './SettingsTab.ts';
import { LogTab } from './LogTab.ts';
import { Tab } from './Tab.ts';

class AnalyticsDebugger {
  yaInstance: Analytics;
  tabs: Tab[];

  constructor(yaInstance: Analytics) {
    this.yaInstance = yaInstance;
    this.tabs = [];
    this.enable();
  }

  addSideMenu() {
    const sidemenu = document.createElement('div');
    sidemenu.classList.add('Analytics');

    const sidemenuToggles = document.createElement('div');
    sidemenuToggles.classList.add('Analytics-toggles');
    this.tabs.forEach(tab => sidemenuToggles.appendChild(tab.getButton()));

    const sidemenuTabs = document.createElement('div');
    sidemenuTabs.classList.add('Analytics-tabs');

    this.tabs.forEach(tab => sidemenuTabs.appendChild(tab.getTemplate()));

    sidemenu.appendChild(sidemenuToggles);
    sidemenu.appendChild(sidemenuTabs);

    document.body.appendChild(sidemenu);
  }

  addSideMenuToggling(): void {
    const AnalyticsList = document.querySelector('.Analytics');
    const buttons = document.querySelectorAll('.Analytics-toggles--item');
    const htmlTabs = document.querySelectorAll('.Analytics-tabs--item');

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      button.addEventListener('click', (evt: Event) => {
        const target: HTMLElement = <HTMLElement> evt.target;
        if (AnalyticsList.classList.contains('show')) {
          if (target.classList.contains('active')) {
            buttons.forEach(
              (button: HTMLElement) => button.classList.remove('active')
            );
            AnalyticsList.classList.toggle('show');
            htmlTabs.forEach(
              (tab: HTMLElement) => tab.classList.remove('active')
            );
          } else {
            buttons.forEach(
              (button: HTMLElement) => button.classList.remove('active')
            );
            htmlTabs.forEach(
              (tab: HTMLElement) => tab.classList.remove('active')
            );
            target.classList.toggle('active');
            htmlTabs[i].classList.add('active');
          }
        } else {
          AnalyticsList.classList.toggle('show');
          target.classList.toggle('active');
          htmlTabs[i].classList.add('active');
        }
      });
    }
  }

  enable() {
    this.tabs = [
      new EventNameTab(this.yaInstance),
      new ScopeNameTab(this.yaInstance),
      new SettingsTab()
    ];
    this.addSideMenu();
    this.addSideMenuToggling();
  }

  disable() {
    this.tabs = [];
    Debug.disable();
  }
}

export {
  AnalyticsDebugger
};
