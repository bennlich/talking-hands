import html from '../../lib/nanohtml.es6.js'

class LetterRoulette {

  static preload() {
    this.audio = new Audio('../assets/sounds/Bzzzzz.mp3')
  }
  
  constructor(app, container, x, y) {
    this.x = x - app.coords.originX
    this.y = y - 60 - app.coords.originY
    this.container = container
    this.el = html`<div class="letter-roulette"></div>`
    this.el.style.position = 'absolute'
    this.el.style.transform = 'translateX(-50%) translateY(-100%)'
    this.el.style['font-size'] = '80px'
    this.el.style.top = `${this.y}px`
    this.el.style.left = `${this.x}px`
    this.changeRate = 30 // chars per second
    this.elapsedCounter = 0
    this.character = 'A'
    container.appendChild(this.el)
  }

  init() {
    LetterRoulette.audio.currentTime = 0
    LetterRoulette.audio.play()
  }

  step(msElapsed) {
    this.elapsedCounter += msElapsed
    if (this.elapsedCounter > (1 / this.changeRate) * 1000) {
      this.elapsedCounter = 0
      let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
      this.character = chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }

  render() {
    this.el.innerHTML = this.character
  }

  pointerUp() {
    this.container.removeChild(this.el)
    LetterRoulette.audio.pause()
  }

}

export default LetterRoulette
