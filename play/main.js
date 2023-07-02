import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'

// stop long touch hold from popping up context menus
document.addEventListener('contextmenu', (e) => false)

let baseSize = Math.min(200, window.innerWidth / 4)

window.allAssets = []

async function init() {
  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)
  morph(mainContainer, html`
    <main>
      <div class="asset-container"></div>
      <div class="presentation-container"></div>
    </main>
  `)
  
  let assetContainer = document.querySelector('.asset-container')
  let presentationContainer = document.querySelector('.presentation-container')
  loadAssets()

  class LetterRoulette {
    
    constructor(container, x, y) {
      this.x = x
      this.y = y - 60
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
    }

  }

  class GrowingLetter {

    constructor(container, x, y) {
      this.x = x
      this.y = y - 20
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

    step(msElapsed) {
      this.fontSize += this.growRate * msElapsed / 1000
    }

    render() {
      this.el.style.fontSize = `${this.fontSize}px`
    }

    pointerUp() {
      this.container.removeChild(this.el)
    }

  }

  class JennyHolzer {

    constructor(container, x, y) {
      this.container = container
      this.phrase = 'This kind of pleasure can only be defined as "aesthetic."'
      this.el = html`
        <div class="jenny-holzer" style="opacity: 0;">
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
    }

    step(msElapsed) {

    }

    render() {

    }

    pointerUp() {
      d3.select(this.el).transition().duration(250).style('opacity', 0.0)
        .on('end', () => this.container.removeChild(this.el))
    }

  }

  let possibleAnimations = [
    // GrowingLetter,
    // JennyHolzer,
    LetterRoulette
  ]


  let pointerAnimation
  document.addEventListener('pointerdown', (e) => {
    let animation = _.sample(possibleAnimations)
    pointerAnimation = new animation(presentationContainer, e.clientX, e.clientY)
    pointerAnimation.init && pointerAnimation.init()
  })

  document.addEventListener('pointerup', (e) => {
    pointerAnimation && pointerAnimation.pointerUp()
  })

  MainLoop
    .setUpdate((msElapsed) => {
      pointerAnimation && pointerAnimation.step(msElapsed)
    })
    .setDraw(() => {
      pointerAnimation && pointerAnimation.render()
    }).start()
  
}


function loadAssets() {
  let assetContainer = document.querySelector('.asset-container')

  assets.images.forEach(asset => {
    let imageEl = new Image()
    imageEl.src = `../${asset.url}`
    imageEl.style.width = `${baseSize}px`
    assetContainer.appendChild(imageEl)
    allAssets.push({
      type: 'image',
      el: imageEl,
      id: asset.url
    })
  })

  assets.videos.forEach(asset => {
    let videoEl = document.createElement('video')
    videoEl.src = `../${asset.url}`
    videoEl.loop = true
    videoEl.style.width = `${baseSize}px`
    assetContainer.appendChild(videoEl)
    allAssets.push({
      type: 'video',
      el: videoEl,
      id: asset.url
    })
  })

  assets.texts.forEach(asset => {
    let textEl = document.createElement('div')
    textEl.classList.add('text-asset')
    textEl.style.width = `200px`
    textEl.style.color = 'white'
    textEl.style.position = 'absolute'
    textEl.style['font-family'] = 'sans-serif'
    textEl.style['font-size'] = '14px'
    textEl.style['line-height'] = '1.5em'
    textEl.style.padding = '10px 12px'
    textEl.innerHTML = asset.content

    assetContainer.appendChild(textEl)
    allAssets.push({
      type: 'text',
      el: textEl,
      id: asset.content
    })
  })

  allAssets = _.shuffle(allAssets)
}

init()