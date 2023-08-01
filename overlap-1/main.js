import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'
import CoordinateSystem from './CoordinateSystem.js'

let crs = new CoordinateSystem({ zoomEnabled: false })
crs.registerEventListeners(document)

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

window.app = {
  vImages: [],
  hImages: [],
  ratio: 1.33
}

async function init() {
  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)

  let baseSize = window.innerWidth > 800 ? 400 : (window.innerWidth / app.ratio - 40);

  morph(mainContainer, html`
    <main>
      <div class="presentation-container"></div>
      <div class="click-blocker"></div>
    </main>
  `)

  loadAssets()

  crs.onChange(() => {
    for (let asset of app.vImages) {
      asset.curY = asset.y + crs.originY
      asset.el.style.top = `${ asset.curY }px`
    }

    for (let asset of app.hImages) {
      asset.curX = asset.x + crs.originX
      asset.el.style.left = `${ asset.curX }px`
    }

    let firstHImage = app.hImages[0]
    if (firstHImage.curX > -window.innerWidth) {
      // Move the last image to the front
      let lastHImage = app.hImages.pop()
      app.hImages.splice(0, 0, lastHImage)
      lastHImage.x = firstHImage.x - (baseSize * app.ratio + 80)
      lastHImage.curX = lastHImage.x + crs.originX
    }

    let lastHImage = app.hImages[app.hImages.length - 1]
    if (lastHImage.curX < window.innerWidth) {
      // Move the first image to the end
      let firstHImage = app.hImages.shift()
      app.hImages.push(firstHImage)
      firstHImage.x = lastHImage.x + (baseSize * app.ratio + 80)
      firstHImage.curX = firstHImage.x + crs.originX
    }

    let firstVImage = app.vImages[0]
    if (firstVImage.curY > -window.innerHeight) {
      // Move the last image to the front
      let lastVImage = app.vImages.pop()
      app.vImages.splice(0, 0, lastVImage)
      lastVImage.y = firstVImage.y - (baseSize * app.ratio + 80)
      lastVImage.curY = lastVImage.y + crs.originY
    }

    let lastVImage = app.vImages[app.vImages.length - 1]
    if (lastVImage.curY < window.innerHeight) {
      // Move the first image to the end
      let firstVImage = app.vImages.shift()
      app.vImages.push(firstVImage)
      firstVImage.y = lastVImage.y + (baseSize * app.ratio + 80)
      firstVImage.curY = firstVImage.y + crs.originY
    }

  })

  function loadAssets() {
    let presentationContainer = document.querySelector('.presentation-container')

    assets.vImages.forEach((asset, i) => {
      let imageEl = new Image()
      imageEl.src = `../${asset.url}`
      imageEl.style.width = `${baseSize}px`
      imageEl.style.position = 'absolute'
      imageEl.style.transform = 'translateX(-50%)'
      presentationContainer.appendChild(imageEl)
      let imageObject = {
        type: 'image',
        el: imageEl,
        id: asset.url,
        x: window.innerWidth / 2,
        y: i * (baseSize * app.ratio + 80)
      }
      imageEl.style.left = `${imageObject.x}px`
      imageEl.style.top = `${imageObject.y}px`
      app.vImages.push(imageObject)
    })

    assets.hImages.forEach((asset, i) => {
      let imageEl = new Image()
      imageEl.src = `../${asset.url}`
      imageEl.style.height = `${baseSize}px`
      imageEl.style.position = 'absolute'
      imageEl.style.transform = 'translateY(-50%)'
      presentationContainer.appendChild(imageEl)
      let imageObject = {
        type: 'image',
        el: imageEl,
        id: asset.url,
        x: i * (baseSize * app.ratio + 80),
        y: window.innerHeight / 2
      }
      imageEl.style.left = `${imageObject.x}px`
      imageEl.style.top = `${imageObject.y}px`
      app.hImages.push(imageObject)
    })
  }

}


init()