import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'
import CoordinateSystem from './CoordinateSystem.js'
import isIOS from '../lib/isios.js'

import JournalComponent from './JournalComponent.js'
let journalComponent = new JournalComponent()

let crsA = new CoordinateSystem({ zoomEnabled: false })
let crsB = new CoordinateSystem({ zoomEnabled: false })

let multiplier = 0.5
let crsMultiplier = 1.5

crsA.originX = -1956 * multiplier / crsMultiplier
crsA.originY = -1127 * multiplier / crsMultiplier
crsB.originX = -1956 * multiplier / crsMultiplier
crsB.originY = -1127 * multiplier / crsMultiplier

let deviceWidth = Math.max(window.innerWidth, window.innerHeight)

let targetWidth = 676
let scaleFactor = deviceWidth / targetWidth

multiplier = multiplier * scaleFactor

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

// stop double-tap zoom
document.addEventListener('dblclick', (e) => event.preventDefault())

async function init() {

  let assets = (await import(`../assets.js?rand=${Math.random()}`)).default

  window.app = {
    chaosVideos: [],
    chaosImages: [],
    matchedMüllers: Array(8).fill().map(o => ({ empty: true })),
    numMüller: 8,
    page: 'table',
    showJournal: () => {
      app.page = 'journal'
      morph(document.querySelector('.journal-component'), journalComponent.render())
    },
    closeJournal: () => {
      app.page = 'table'
      morph(document.querySelector('.journal-component'), journalComponent.render())
    },
    playTextCaptureAnimation: (centeredVideo) => {
      setTimeout(() => {
        let textForAnimation = document.querySelector('.text-animation-container')
        textForAnimation.innerText = centeredVideo.text[0]
        
        let textPosition = document.querySelector('.text-container').getBoundingClientRect()
        console.log(textPosition)
        d3.select(textForAnimation)
          .style('width', `${textPosition.width}px`)
          .style('top', `${textPosition.top}px`)
          .style('left', `${textPosition.left}px`)
          .style('opacity', 1)
          .transition()
            .duration(1000)
            .style('left', `${window.innerWidth - 20}px`)
            .style('top', `${window.innerHeight - 20}px`)
            .style('opacity', 0)
      }, 500)
    }
  }

  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)

  morph(mainContainer, html`
    <main>
      <div class="presentation-container"></div>
      <div class="text-container"></div>
      <div class="text-animation-container"></div>
      <div class="debug"></div>
      <div class="click-blocker"></div>
      <div class="left-touch-target"></div>
      <div class="right-touch-target"></div>
      <div class="toggle-journal-button" onclick=${ () => app.showJournal() }>
        <img src="../assets/icons/journal-icon.png" />
      </div>
      <div class="journal-component"></div>
      <div class="blocker" onclick="${ () => closeBlocker() }">tap to begin</div>
    </main>
  `)

  function renderDebugInfo() {
    morph(document.querySelector('.debug'), html`
      <div class="debug">
        <div>width: ${window.innerWidth}</div>
        <div>height: ${window.innerHeight}</div>
        <div>orientationType: ${window.matchMedia("(orientation: portrait)").matches ? 'portrait' : 'landscape'}</div>
      </div>
    `)
  }

  // renderDebugInfo()

  // screen.orientation.addEventListener("change", (event) => {
  //   renderDebugInfo()
  // })

  async function closeBlocker() {

    app.chaosImages.forEach(asset => {
      // asset.sound.muted = true
      asset.sound.play().then(async () => {
        asset.sound.pause()
        asset.sound.muted = false
        asset.sound.currentTime = 0
      })
    })

    // .forEach(audioEl => {
    //     audioEl.primingForJavascriptPlayback = true
    //     let originalVolume = audioEl.volume
    //     audioEl.volume = 0
    //     audioEl.play().then(() => {
    //       audioEl.primedForJavascriptPlayback = true
    //       audioEl.primingForJavascriptPlayback = false
    //       audioEl.pause()
    //       audioEl.volume = originalVolume
    //       audioEl.currentTime = 0
    //     })
    //   })

    try {
      let el = document.documentElement
      if (!isIOS && document.fullscreenEnabled) {
        // await el.requestFullscreen()
      }
      // else if (document.webkitFullscreenEnabled) {
      //   await el.webkitRequestFullscreen()
      // }
    } catch(err) {
      alert(
        `An error occurred while trying to switch into fullscreen mode: ${err.message} (${err.name})`,
      );
    } finally {
      initListeners()
      document.querySelector('.blocker').style.display = 'none'
    }
  }

  // document.querySelector('.left-touch-target').style.width = `${window.innerWidth / 2}px`
  // document.querySelector('.right-touch-target').style.width = `${window.innerWidth / 2}px`

  crsA.registerEventListeners(document.querySelector('.left-touch-target'))
  crsB.registerEventListeners(document.querySelector('.right-touch-target'))

  function initListeners() {
    document.addEventListener('pointerup', () => {
      
      function assetDistanceToCenter(asset) {
        let assetCenter = {
          x: asset.getX() + (asset.width * multiplier / 2),
          y: asset.getY() + (asset.height * multiplier / 2)
        }

        return Math.sqrt(Math.pow(assetCenter.x - window.innerWidth / 2, 2) + Math.pow(assetCenter.y - window.innerHeight / 2, 2))
      }

      // 
      // Play centered video
      // 

      let centeredVideo = _.min(app.chaosVideos, assetDistanceToCenter)

      if (centeredVideo.mediaEl.paused) {
        app.chaosVideos.forEach(a => a.mediaEl.pause())

        centeredVideo.mediaEl.currentTime = 0
        centeredVideo.mediaEl.play()
      }


      // 
      // Play centered audio
      // 

      let centeredAudio = _.min(app.chaosImages, assetDistanceToCenter)

      if (centeredAudio.sound.paused) {
        app.chaosImages.forEach(a => a.sound.pause())

        centeredAudio.sound.currentTime = 0
        centeredAudio.sound.play()
      }

      if (centeredAudio.mediaEl.paused) {
        app.chaosImages.forEach(a => a.mediaEl.pause())

        centeredAudio.mediaEl.currentTime = 0
        centeredAudio.mediaEl.play()
      }

      if (centeredVideo.matchId === centeredAudio.url) {
        // record the match
        if (app.matchedMüllers[centeredVideo.index].empty) {
          app.matchedMüllers[centeredVideo.index] = centeredVideo
          app.playTextCaptureAnimation(centeredVideo)
        }
        
        // show the text
        document.querySelector('.text-container').innerText = centeredVideo.text[0]
        centeredVideo.el.appendChild(document.querySelector('.text-container'))
        d3.select(document.querySelector('.text-container')).transition().style('opacity', 1)
      } else {
        d3.select(document.querySelector('.text-container')).transition().style('opacity', 0)
      }

    })
  }


  // 
  // Load assets
  // 


  let presentationContainer = document.querySelector('.presentation-container')

  // let widths = [0.55, 0.5, 0.45]
  let widths = [0.7]

  assets.textSideVideos.forEach((asset, i) => {
    let elWidth = _.sample(widths) * deviceWidth

    let dimensions = { style: `width: ${elWidth}px; height: ${asset.height / asset.width  * elWidth}px` }

    let el = html`
      <div class="translation-container">
        <div class="video-placeholder" ${ dimensions }>
          <video
            playsinline
            muted
            src="../${asset.url}"
            width="${ elWidth }"></video>
        </div>
      </div>
    `

    let mediaEl = el.querySelector('video')
    let placeholderEl = el.querySelector('.video-placeholder')

    mediaEl.addEventListener('loadeddata', () => placeholderEl.classList.add('loaded'))

    el.style.opacity = 1

    app.chaosVideos.push({
      ...asset,
      index: i,
      el: el,
      mediaEl: mediaEl,
      getX: () => asset.x * multiplier + crsMultiplier * crsB.originX,
      getY: () => asset.y * multiplier + crsMultiplier * crsB.originY
    })

    console.log("Appending", el)

    presentationContainer.appendChild(el)
  })

  assets.chaosImagesDurationExperiment1.forEach(asset => {
    let el = html`<img
      src="../${asset.url}"
      width="${asset.width * multiplier}"
      height="${asset.height * multiplier}">`

    // el.style.opacity = asset.opacity
    el.style.opacity = 1

    let sound = new Audio(`../${asset.sound}`)
    sound.muted = true

    app.chaosImages.push({
      ...asset,
      sound: sound,
      el: el,
      mediaEl: el,
      getX: () => asset.x * multiplier + crsMultiplier * crsA.originX,
      getY: () => asset.y * multiplier + crsMultiplier * crsA.originY
    })

    console.log("Appending", el)

    presentationContainer.appendChild(el)
  })

  crsA.onChange(() => {
    render()
  })

  crsB.onChange(() => {
    render()
  })

  render()

}


function render() {

  for (let asset of app.chaosVideos) {
    asset.el.style.transform = `translate(${asset.getX()}px, ${asset.getY()}px)`
  }

  for (let asset of app.chaosImages) {
    asset.el.style.transform = `translate(${asset.getX()}px, ${asset.getY()}px)`
  }

}


init()