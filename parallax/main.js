import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'
import CoordinateSystem from './CoordinateSystem.js'

let crs = new CoordinateSystem({ zoomEnabled: false })
crs.registerEventListeners(document)

console.log(assets)

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

let baseSize = Math.min(200, window.innerWidth / 4)

window.allAssets = []

async function init() {
  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)
  morph(mainContainer, html`
    <main>
      <iframe src="../background-transformation"></iframe>
      <div class="asset-container"></div>
      <div class="presentation-container"></div>
    </main>
  `)
  
  let assetContainer = document.querySelector('.asset-container')
  loadAssets()

  let firstInteraction = false
  document.addEventListener('pointerup', () => {
    if (firstInteraction) {
      return
    }

    firstInteraction = true
    allAssets.forEach(asset => {
      if (asset.type === 'video') {
        asset.el.play()
      }
    })
  })

  let foregroundAssets = allAssets.slice(0, Math.floor(allAssets.length / 2))
  let backgroundAssets = allAssets.slice(Math.floor(allAssets.length / 2))
  
  let specialHands = []
  let specialHandsCoords = [{ x: -200, y: window.innerHeight - 200 }, { x: window.innerWidth + 200, y: window.innerHeight / 2 }]
  assets.specialHands.forEach((asset, i) => {
    let imageEl = new Image()
    imageEl.src = `../${asset.url}`
    imageEl.style.width = `400px`

    if (i === 0) {
      imageEl.style.opacity = 0.7
    }
    
    assetContainer.appendChild(imageEl)
    asset = {
      type: 'specialHands',
      el: imageEl,
      id: asset.url,
      x: specialHandsCoords[i].x,
      y: specialHandsCoords[i].y
    }

    imageEl.style.left = `${ asset.x + 1.3 * crs.originX }px`
    imageEl.style.top = `${ asset.y + 1.3 * crs.originY }px`

    specialHands.push(asset)
  })

  foregroundAssets.forEach((asset, i) => {
    asset.x = - window.innerWidth / 2 + i * (4 * baseSize)
    asset.y = window.innerHeight / 5 + i * window.innerHeight / 10
    asset.el.style.left = `${ asset.x }px`
    asset.el.style.top = `${ asset.y }px`
    asset.el.style['z-index'] = 10

    if (asset.type !== 'text') {
      asset.el.style.width = `${ 1.3 * baseSize }px`
    }

    if (asset.type === 'text') {
      asset.el.style.border = '1px solid'
    }
  })

  backgroundAssets.forEach((asset, i) => {
    asset.x = -window.innerWidth / 2 + window.innerWidth / 3 + i * window.innerWidth / 1.8 + Math.random() * 50
    asset.y = 200 + (-0.5 + Math.random()) * (window.innerHeight / 4 - 400)
    asset.el.style.left = `${ asset.x }px`
    asset.el.style.top = `${ asset.y }px`
    asset.el.style.opacity = 0.5
    asset.el.style['z-index'] = 5

    if (asset.type !== 'text') {
      asset.el.style.width = `${ 0.7 * baseSize }px`  
    }

    if (asset.type == 'text') {
      asset.el.style['font-size'] = '12px'
    }
  })

  let clonedBackgroundAssets = _.shuffle(backgroundAssets.slice()).map((asset, i) => {
    asset = _.clone(asset)
    asset.el = asset.el.cloneNode()
    assetContainer.appendChild(asset.el)
    asset.x = -window.innerWidth / 2 + window.innerWidth / 7 + i * window.innerWidth / 1.2 + Math.random() * 50
    asset.y = window.innerHeight - 200 + (-0.5 + Math.random()) * (3 * window.innerHeight / 4)
    asset.el.style.left = `${ asset.x }px`
    asset.el.style.top = `${ asset.y }px`
    asset.el.style.opacity = 0.5
    asset.el.style['z-index'] = 5
    asset.el.style.width = `${ 0.7 * baseSize }px`
    return asset
  })

  backgroundAssets = backgroundAssets.concat(clonedBackgroundAssets)

  crs.onChange(() => {
    specialHands.forEach((asset) => {
      asset.el.style.left = `${ asset.x + 1.3 * crs.originX }px`
      asset.el.style.top = `${ asset.y + 1.3 * crs.originY }px`
    })

    foregroundAssets.forEach((asset, i) => {
      asset.el.style.left = `${ asset.x + 1.3 * crs.originX }px`
      asset.el.style.top = `${ asset.y + 1.3 * crs.originY }px`
    })

    backgroundAssets.forEach((asset, i) => {
      asset.el.style.left = `${ asset.x + crs.originX }px`
      asset.el.style.top = `${ asset.y + crs.originY }px`
    })
  })
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