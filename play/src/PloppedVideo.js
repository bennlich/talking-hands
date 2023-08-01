import html from '../../lib/nanohtml.es6.js'

export default class PloppedVideo {
  constructor(app, videoEl, x, y) {
    this.el = html`
      <div class="plopped-video"></div>
    `
    this.el.appendChild(videoEl)
    this.el.style.opacity = 0
    this.el.style.position = 'absolute'
    this.el.style.top = `${y}px`
    this.el.style.left = `${x}px`
    // this.el.style.width = `${videoEl.offsetWidth}px`
    // this.el.style.height = `${videoEl.offsetHeight}px`
    this.el.style.transform = `translateX(-50%)`
    this.videoEl = videoEl
    // videoEl.style.transform = `translateX(-50%)`

    // this.el.addEventListener('pointerdown', (e) => {
    //   e.stopPropagation()
    //   app.draggingElement = this
    //   app.currentPointer = e.pointerId
    // })

    this.app = app

    this.app.presentationContainer.appendChild(this.el)

    this.x = x
    this.y = y - 200

    d3.select(this.el).transition()
      .style('opacity', 1)
      .style('top', `${this.y}px`)

    this.app.soundEffects['plop'].sound.play()

    // this.el.play()
  }

  update(deltaX, deltaY) {
    this.x += deltaX
    this.y += deltaY
    
    this.el.style.top = `${this.y}px`
    this.el.style.left = `${this.x}px`
  }

  pointerUp() {
    // this.el.play()
  }

  play() {
    this.videoEl.play()
  }

  grow() {
    d3.select(this.videoEl).transition()
      .style('transform', `scale(${ this.app.isMobile ? 2 : 1.3 })`)
  }

  shrink(duration = 250) {
    d3.select(this.videoEl).transition()
      .duration(duration)
      .style('transform', 'scale(1)')
  }

  lowerLeft() {
    return {
      x: this.x - this.videoEl.offsetWidth / 2,
      y: this.y + this.videoEl.offsetHeight
    }
  }

}