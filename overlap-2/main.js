import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'
import CoordinateSystem from './CoordinateSystem.js'

let crsA = new CoordinateSystem({ zoomEnabled: false })
let crsB = new CoordinateSystem({ zoomEnabled: false })

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

window.allAssets = []

window.app = {
  mode: 'a',
  ratio: 1.33
}

let baseSize = window.innerWidth > 800 ? 400 : (window.innerWidth / app.ratio - 40);

async function init() {
  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)
  morph(mainContainer, html`
    <main>
      <div class="asset-container"></div>
      <div class="presentation-container"></div>
      <div class="circle"></div>
      <div class="vertical-bar-a"><div class="content"></div></div>
      <div class="horizontal-bar-a"><div class="content"></div></div>
      <div class="vertical-bar-b"><div class="content"></div></div>
      <div class="horizontal-bar-b"><div class="content"></div></div>
      <div class="swap-button"><div class="content"></div></div>
    </main>
  `)

  let circle = document.querySelector('.circle')
  let padding = 80 * 2
  let circleSize = Math.min(window.innerWidth, window.innerHeight) - padding
  circle.style.width = `${circleSize}px`
  circle.style.height = circle.style.width
  circle.style['border-radius'] = circle.style.width

  if (window.innerWidth > window.innerHeight) {
    circle.style.top = `${padding / 2}px`
    circle.style.left = '50%'
    circle.style.transform = 'translateX(-50%)'
  } else {
    circle.style.top = '50%'
    circle.style.left = `${padding / 2}px`
    circle.style.transform = 'translateY(-50%)'
  }

  let verticalBarA = document.querySelector('.vertical-bar-a')
  verticalBarA.style.height = `${circleSize * 0.8}px`
  verticalBarA.style.left = `${window.innerWidth / 2 + circleSize / 2}px`

  let horizontalBarA = document.querySelector('.horizontal-bar-a')
  horizontalBarA.style.width = `${circleSize * 0.8}px`
  horizontalBarA.style.top = `${window.innerHeight / 2 + circleSize / 2}px`

  let verticalBarB = document.querySelector('.vertical-bar-b')
  verticalBarB.style.height = `${circleSize * 0.8}px`
  verticalBarB.style.left = `${window.innerWidth / 2 + circleSize / 2}px`

  let horizontalBarB = document.querySelector('.horizontal-bar-b')
  horizontalBarB.style.width = `${circleSize * 0.8}px`
  horizontalBarB.style.top = `${window.innerHeight / 2 + circleSize / 2}px`

  let swapButton = document.querySelector('.swap-button')
  swapButton.style.left = verticalBarA.style.left
  swapButton.style.top = horizontalBarA.style.top

  crsA.registerEventListeners(document.querySelector('.vertical-bar-a'), { yOnly: true })
  crsA.registerEventListeners(document.querySelector('.horizontal-bar-a'), { xOnly: true })

  crsB.registerEventListeners(document.querySelector('.vertical-bar-b'), { yOnly: true })
  crsB.registerEventListeners(document.querySelector('.horizontal-bar-b'), { xOnly: true })  

  swapButton.addEventListener('pointerdown', () => {
    if (app.mode === 'a') {
      app.mode = 'b'
    } else {
      app.mode = 'a'
    }

    render()
  })

  render()

  function render() {
    swapButton.querySelector('.content').style.background = app.mode === 'a' ? 'grey' : 'black'

    if (app.mode === 'a') {
      document.querySelector('.vertical-bar-a').style.display = 'block'
      document.querySelector('.horizontal-bar-a').style.display = 'block'
      document.querySelector('.vertical-bar-b').style.display = 'none'
      document.querySelector('.horizontal-bar-b').style.display = 'none'
    } else {
      document.querySelector('.vertical-bar-a').style.display = 'none'
      document.querySelector('.horizontal-bar-a').style.display = 'none'
      document.querySelector('.vertical-bar-b').style.display = 'block'
      document.querySelector('.horizontal-bar-b').style.display = 'block'
    }
  }
  
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
  
  // let specialHands = []
  // let specialHandsCoords = [{ x: -200, y: window.innerHeight - 200 }, { x: window.innerWidth + 200, y: window.innerHeight / 2 }]
  // assets.specialHands.forEach((asset, i) => {
  //   let imageEl = new Image()
  //   imageEl.src = `../${asset.url}`
  //   imageEl.style.width = `400px`

  //   if (i === 0) {
  //     imageEl.style.opacity = 0.7
  //   }
    
  //   assetContainer.appendChild(imageEl)
  //   asset = {
  //     type: 'specialHands',
  //     el: imageEl,
  //     id: asset.url,
  //     x: specialHandsCoords[i].x,
  //     y: specialHandsCoords[i].y
  //   }

  //   imageEl.style.left = `${ asset.x + 1.3 * crs.originX }px`
  //   imageEl.style.top = `${ asset.y + 1.3 * crs.originY }px`

  //   specialHands.push(asset)
  // })

  foregroundAssets.forEach((asset, i) => {
    asset.x = - window.innerWidth / 2 + (i * (2 * baseSize)) % (2 * window.innerWidth)
    asset.y = window.innerHeight / 5 + i * window.innerHeight / 3
    asset.el.style.left = `${ asset.x }px`
    asset.el.style.top = `${ asset.y }px`
    asset.el.style['z-index'] = 10

    if (asset.type === 'text') {
      asset.el.style.border = '1px solid'
    }
  })

  backgroundAssets.forEach((asset, i) => {
    asset.x = - window.innerWidth / 2 + ((0.75 + i) * (2 * baseSize)) % (2 * window.innerWidth)
    asset.y = window.innerHeight / 5 + (i - 0.75) * window.innerHeight / 3
    asset.el.style.left = `${ asset.x }px`
    asset.el.style.top = `${ asset.y }px`
    asset.el.style.opacity = 0.5
    asset.el.style['z-index'] = 5

    if (asset.type == 'text') {
      asset.el.style['font-size'] = '12px'
    }
  })

  crsA.onChange(() => {
    // specialHands.forEach((asset) => {
    //   asset.el.style.left = `${ asset.x + 1.3 * crs.originX }px`
    //   asset.el.style.top = `${ asset.y + 1.3 * crs.originY }px`
    // })

    
    foregroundAssets.forEach((asset, i) => {
      asset.el.style.left = `${ asset.x + crsA.originX }px`
      asset.el.style.top = `${ asset.y + crsA.originY }px`
    })

    infinity(foregroundAssets)

  })

  crsB.onChange(() => {
    backgroundAssets.forEach((asset, i) => {
      asset.el.style.left = `${ asset.x + crsB.originX }px`
      asset.el.style.top = `${ asset.y + crsB.originY }px`
    })

    infinity(backgroundAssets)
  })

  function infinity(assets) {
    // if the extrema assets are too close to the viewport, move some around
  }
}


function loadAssets() {
  let assetContainer = document.querySelector('.asset-container')

  // assets.images.forEach(asset => {
  //   let imageEl = new Image()
  //   imageEl.src = `../${asset.url}`
  //   imageEl.style.width = `${baseSize}px`
  //   assetContainer.appendChild(imageEl)
  //   allAssets.push({
  //     type: 'image',
  //     el: imageEl,
  //     id: asset.url
  //   })
  // })

  assets.vImages.forEach(asset => {
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

  assets.hImages.forEach(asset => {
    let imageEl = new Image()
    imageEl.src = `../${asset.url}`
    imageEl.style.height = `${baseSize}px`
    assetContainer.appendChild(imageEl)
    allAssets.push({
      type: 'image',
      el: imageEl,
      id: asset.url
    })
  })

  // assets.videos.forEach(asset => {
  //   let videoEl = document.createElement('video')
  //   videoEl.src = `../${asset.url}`
  //   videoEl.loop = true
  //   videoEl.style.width = `${baseSize}px`
  //   assetContainer.appendChild(videoEl)
  //   allAssets.push({
  //     type: 'video',
  //     el: videoEl,
  //     id: asset.url
  //   })
  // })

  // assets.texts.forEach(asset => {
  //   let textEl = document.createElement('div')
  //   textEl.classList.add('text-asset')
  //   textEl.style.width = `200px`
  //   textEl.style.color = 'white'
  //   textEl.style.position = 'absolute'
  //   textEl.style['font-family'] = 'sans-serif'
  //   textEl.style['font-size'] = '14px'
  //   textEl.style['line-height'] = '1.5em'
  //   textEl.style.padding = '10px 12px'
  //   textEl.innerHTML = asset.content

  //   assetContainer.appendChild(textEl)
  //   allAssets.push({
  //     type: 'text',
  //     el: textEl,
  //     id: asset.content
  //   })
  // })

  allAssets = _.shuffle(allAssets)
}

init()