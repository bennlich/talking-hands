import html from '../../lib/nanohtml.es6.js'

class JennyHolzer {

  static preload() {
    this.audio = new Audio('../assets/sounds/Mamama.mp3')
  }

  constructor(app, container, x, y) {
    this.container = container
    this.phrase = 'This kind of pleasure can only be defined as "aesthetic."'
    this.el = html`
      <div class="jenny-holzer" style="opacity: 0; position: absolute; left: ${-app.coords.originX}px; top: -50px">
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30">${ this.phrase } ${ this.phrase }</marquee>
        <marquee scrollamount="30" direction="right">${ this.phrase } ${ this.phrase }</marquee>
      </div>
    `
    container.appendChild(this.el)
  }

  init() {
    d3.select(this.el).transition().duration(500).style('opacity', 1.0)

    JennyHolzer.audio.currentTime = 0
    JennyHolzer.audio.play()
  }

  step(msElapsed) {

  }

  render() {

  }

  pointerUp() {
    d3.select(this.el).transition().duration(250).style('opacity', 0.0)
      .on('end', () => this.container.removeChild(this.el))

    JennyHolzer.audio.pause()
  }

}

export default JennyHolzer
