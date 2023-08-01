import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'

import Arrow from './src/Arrow.js'

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

window.app = {

  ratio: 1.33,

  arrow: new Arrow({
    src: { x: 70, y: window.innerHeight / 3 },
    angle: -Math.PI / 2,
    // angle: 0,
    resetDistance: 700,
    speed: 100
  }),
  
  step: (ms) => {
    app.arrow.step(ms)
  },

  draw: () => {
    app.arrow.draw(app.canvas)
  }
}

async function init() {
  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)

  let baseSize = window.innerWidth > 800 ? 400 : (window.innerWidth / app.ratio - 40);

  morph(mainContainer, html`
    <main>
      <video src="../assets/videos/eye-1.mp4" style="width: ${ baseSize }px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)"></video>
      <canvas id="canvas"></canvas>
    </main>
  `)

  let maxDpr = 2; // pixel ratios above 2 look weirdly skinny
  let dpr = Math.min(maxDpr, window.devicePixelRatio || 1)

  app.canvas = document.querySelector('#canvas')
  app.canvas.width = dpr * window.innerWidth
  app.canvas.height = dpr * window.innerHeight
  app.ctx = app.canvas.getContext('2d')

  app.canvas.addEventListener('pointerdown', (e) => {
    e.stopPropagation()

    // Only one touch at a time for now
    if (app.currentPointer) {
      return
    }
    
    app.currentPointer = e.pointerId

    app.draggingElement = app.arrow
    app.draggingElement.pointerDown(e.clientX, e.clientY)
  })

  document.addEventListener('pointermove', (e) => {
    if (e.pointerId !== app.currentPointer) {
      return
    }
    
    if (app.draggingElement && app.prevX && app.prevY) {
      let deltaX = e.clientX - app.prevX
      let deltaY = e.clientY - app.prevY
      app.draggingElement.update(deltaX, deltaY)
    }

    app.prevX = e.clientX
    app.prevY = e.clientY
  })

  document.addEventListener('pointerup', (e) => {
    if (e.pointerId !== app.currentPointer) {
      return
    }

    app.currentPointer = null
    
    app.pointerAnimation && app.pointerAnimation.pointerUp()

    app.pointerAnimation = null

    app.draggingElement && app.draggingElement.pointerUp()

    app.draggingElement = null

    app.prevX = null
    app.prevY = null
  })

  MainLoop
    .setUpdate((msElapsed) => app.step(msElapsed))
    .setDraw(() => app.draw())
    .start()

}


init()