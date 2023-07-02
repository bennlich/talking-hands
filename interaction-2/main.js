import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'

console.log(assets)

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

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
  
  loadAssets()

  function getAsset(e) {
    // Select a new asset mapped to pixel space
    let pixelsPerAsset = Math.floor((window.innerWidth * window.innerHeight) / allAssets.length)
    let assetIndex = Math.floor((e.clientY * window.innerWidth + e.clientX) / pixelsPerAsset)
    return allAssets[assetIndex]
  }
  
  function showAsset(asset, e) {
    asset.el.style.visibility = 'visible'

    let { width, height } = asset.el.getBoundingClientRect()

    // if (e.clientX + width < window.innerWidth) {
    //   asset.el.style.left = `${e.clientX}px`
    // } else {
    //   asset.el.style.left = `${window.innerWidth - width}px`
    // }

    // if (e.clientY + height < window.innerHeight) {
    //   asset.el.style.top = `${e.clientY}px`
    // } else {
    //   asset.el.style.top = `${window.innerHeight - height}px`
    // }
    
    // center the asset in the middle of the screen
    asset.el.style.left = `${window.innerWidth / 2 - width / 2}px`
    asset.el.style.top = `${window.innerHeight / 2 - height / 2}px`

    if (asset.type === 'video') {
      asset.el.play()
    }
  }

  let currentAsset
  document.addEventListener('pointerdown', (e) => {
    if (currentAsset) {
      currentAsset.el.style.visibility = 'hidden'
    }

    currentAsset = getAsset(e)

    // Select a new asset at random
    // let prevAsset = _.clone(currentAsset)
    // currentAsset = _.sample(allAssets)
    // while (currentAsset.id === prevAsset?.id) {
    //   currentAsset = _.sample(allAssets)
    // }

    showAsset(currentAsset, e)
  })

  // document.addEventListener('pointermove', (e) => {
  //   let nextAsset = getAsset(e)
  //   if (!currentAsset || nextAsset.id === currentAsset.id) {
  //     return
  //   }
    
  //   // if (!currentAsset) {
  //   //   return
  //   // }
    
  //   currentAsset.el.style.visibility = 'hidden'

  //   currentAsset = nextAsset

  //   showAsset(currentAsset, e)
  // })

  document.addEventListener('pointerup', (e) => {
    currentAsset.el.style.visibility = 'hidden'
    currentAsset = null
  })
}

function loadAssets() {
  let assetContainer = document.querySelector('.asset-container')

  assets.images.forEach(asset => {
    let imageEl = new Image()
    imageEl.src = `../${asset.url}`
    imageEl.style.width = `${window.innerWidth / 2}px`
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
    videoEl.style.width = `${window.innerWidth / 2}px`
    assetContainer.appendChild(videoEl)
    allAssets.push({
      type: 'video',
      el: videoEl,
      id: asset.url
    })
  })

  allAssets = _.shuffle(allAssets)
}

init()