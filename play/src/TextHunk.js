import html from '../../lib/nanohtml.es6.js'

export default class TextHunk {
  
  constructor(app, x, y, text) {
    this.app = app
    this.x = x
    this.y = y
    this.width = 1000

    this.text = `Auf den Lippen Schnee. Du kommst zu spät mein Freund.`

    this.el = html`<div class="text-hunk">${this.text}</div>`
    this.el.style.position = 'absolute'
    this.el.style.left = `${this.x}px`
    this.el.style.top = `${this.y}px`
    this.el.style['white-space'] = 'nowrap'
    this.el.style['font-size'] = '36px'
    this.el.style.overflow = 'hidden'
    this.el.style.width = '0px'
    this.el.style.color = 'white'

    app.presentationContainer.appendChild(this.el)

    d3.select(this.el).transition().duration(this.width)
      .ease(d3.easeLinear)
      .style('width', `${this.width}px`)

    app.coords.registerEventListeners(this.el)
  }

  show() {

  }

}
