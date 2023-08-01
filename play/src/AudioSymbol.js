import html from '../../lib/nanohtml.es6.js'

export default class AudioSymbol {
  constructor(app, x, y, sound, targetX, targetY, isSpecial) {
    this.app = app
    this.el = html`<div class="audio-symbol"></div>`
    this.isSpecial = isSpecial

    this.el.style.top = `${y}px`
    this.el.style.left = `${x}px`

    this.el.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      app.draggingElement = this
      app.currentPointer = e.pointerId

      this.startingX = this.x
      this.startingY = this.y

      this.app.growPloppedVideos()
    })

    this.app.presentationContainer.appendChild(this.el)

    d3.select(this.el).transition()
      .style('top', `${targetY}px`)
      .style('left', `${targetX}px`)

    this.x = targetX
    this.y = targetY

    this.sound = sound
  }

  update(deltaX, deltaY) {
    this.x += deltaX
    this.y += deltaY
    
    this.el.style.top = `${this.y}px`
    this.el.style.left = `${this.x}px`
  }

  pointerUp() {
    let collidingVideos = this.app.checkCollisions(this)

    if (collidingVideos.length > 0) {
      d3.select(this.el).transition().style('opacity', 0.1)
      this.play()
      collidingVideos.map(v => v.play())
      setTimeout(() => {
        if (!this.isSpecial) {
          this.app.soundEffects['negative-bloop'].play()
        }
        
        this.app.shrinkPloppedVideos(600)
        d3.select(this.el).transition()
          .duration(600)
          .style('opacity', 1)
          .style('top', `${this.startingY}px`)
          .style('left', `${this.startingX}px`)
          .on('end', () => {
            this.x = this.startingX
            this.y = this.startingY
          })

        if (this.isSpecial) {
          this.app.nextLevel(collidingVideos[0])
        }
      }, collidingVideos[0].videoEl.duration * 1000)
    } else {
      this.app.shrinkPloppedVideos()
      this.app.soundEffects['negative-bloop'].play()
    }

    // this.sound.currentTime = 0
    // this.sound.play()
  }

  play() {
    this.sound.play()
  }
}