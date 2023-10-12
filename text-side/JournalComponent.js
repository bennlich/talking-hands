import Nanocomponent from '../lib/Nanocomponent.es6.js'
import html from '../lib/nanohtml.es6.js'

export default class JournalComponent extends Nanocomponent {

  constructor() {
    super()
    this.tab = 'müller'
  }

  createElement() {
    return html`
      <div class="journal-component ${ app.page === 'journal' ? 'visible' : '' }">
        <div class="journal-header">
          <div class="journal-menu">
            <a class="journal-menu-item ${ this.tab === 'müller' ? 'selected' : '' }"
                 onclick=${() => this.setTab('müller')}>Müller</a>
            <a class="journal-menu-item ${ this.tab === 'kemmann' ? 'selected' : '' }"
                 onclick=${() => this.setTab('kemmann')}>Kemmann</a>
            <a class="journal-menu-item ${ this.tab === 'kafka' ? 'selected' : '' }"
                 onclick=${() => this.setTab('kafka')}>Kafka</a>
          </div>
          <div class="journal-dots">
            
          </div>
          <div class="close-button"
               onclick=${() => app.closeJournal()}>×</div>
        </div>
        <div class="journal-body">
          
        </div>
      </div>
    `
  }

  setTab(tabName) {
    this.tab = tabName
    this.rerender()
  }

  update() {
    return true
  }

}