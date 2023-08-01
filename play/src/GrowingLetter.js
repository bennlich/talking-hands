import html from '../../lib/nanohtml.es6.js'

class GrowingLetter {

  static preload() {
    this.audio = new Audio('../assets/sounds/Doooo.mp3')
  }

  constructor(app, container, x, y) {
    this.x = x - app.coords.originX
    this.y = y - 20 - app.coords.originY
    this.growRate = 800 // fontSize per second
    this.container = container
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    this.character = chars.charAt(Math.floor(Math.random() * chars.length))
    this.el = html`<div class="growing-letter">${ this.character }</div>`
    this.el.style.position = 'absolute'
    // this.el.style['text-align'] = 'center'
    this.el.style['transform'] = 'translateX(-50%) translateY(-100%)'
    this.el.style.top = `${this.y}px`
    this.el.style.left = `${this.x}px`
    this.fontSize = 12
    container.appendChild(this.el)
  }

  init() {
    GrowingLetter.audio.currentTime = 0
    GrowingLetter.audio.play()
  }

  step(msElapsed) {
    this.fontSize += this.growRate * msElapsed / 1000
  }

  render() {
    this.el.style.fontSize = `${this.fontSize}px`
  }

  pointerUp() {
    this.container.removeChild(this.el)
    GrowingLetter.audio.pause()
  }

}

export default GrowingLetter
