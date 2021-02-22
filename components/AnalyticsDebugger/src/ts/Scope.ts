import { AnalyticsDom } from './AnalyticsDom';

export class Scope extends AnalyticsDom {
  constructor (text: string = '') {
    super();

    let scope:HTMLElement = document.createElement('div');
    scope.classList.add('Scope');
    let content:HTMLElement = document.createElement('span');
    content.classList.add('Scope-content');
    content.innerText = text;
    scope.appendChild(content);
    this._domElement = scope;
    this._domElement.style['visibility'] = 'invisible';
  }
}
