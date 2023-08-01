import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'

import LetterRoulette from './src/LetterRoulette.js'
import JennyHolzer from './src/JennyHolzer.js'
import GrowingLetter from './src/GrowingLetter.js'
import PloppedVideo from './src/PloppedVideo.js'
import AudioSymbol from './src/AudioSymbol.js'
import TextHunk from './src/TextHunk.js'
import CoordinateSystem from './CoordinateSystem.js'

// stop long touch hold from popping up context menus
document.addEventListener('contextmenu', (e) => false)

let baseSize = Math.min(200, window.innerWidth / 4)

window.allAssets = []

async function init() {
  let mainContainer = document.createElement('main')
  document.body.appendChild(mainContainer)
  morph(mainContainer, html`
    <main>
      <div class="background-container"></div>
      <div class="asset-container"></div>
      <div class="presentation-container"></div>
    </main>
  `)
  
  let backgroundContainer = document.querySelector('.background-container')
  let assetContainer = document.querySelector('.asset-container')
  let presentationContainer = document.querySelector('.presentation-container')
  
  loadAssets()
  let soundEffects = _.indexBy(assets.soundEffects.map(asset => {
    let effect = { name: asset.name, sound: new Audio(`../${asset.url}`) }
    effect.play = () => effect.sound.play()
    return effect
  }), 'name')
  

  let app = {
    coords: new CoordinateSystem({ zoomEnabled: false }),
    currentPointer: null,
    draggingElement: null,
    ploppedVideos: [],
    isMobile: (window.innerWidth < 800),
    soundEffects: soundEffects,
    presentationContainer: presentationContainer,
    
    checkCollisions: (audioSymbol) => {
      return app.ploppedVideos.filter(ploppedVideo => {
        // console.log(ploppedVideo.x, audioSymbol.x, ploppedVideo.y, audioSymbol.y)
        if (
          (audioSymbol.x > ploppedVideo.x - ploppedVideo.el.offsetWidth / 2) &&
          (audioSymbol.x < ploppedVideo.x + ploppedVideo.el.offsetWidth / 2) &&
          (audioSymbol.y > ploppedVideo.y) &&
          (audioSymbol.y < ploppedVideo.y + ploppedVideo.el.offsetHeight)
        ) {
          return true
        }
      })
    },

    growPloppedVideos: () => {
      soundEffects['positive-bloop'].play()
      app.ploppedVideos.forEach(v => v.grow())
    },

    shrinkPloppedVideos: (duration) => {
      app.ploppedVideos.forEach(v => v.shrink(duration))
    },

    nextLevel: (ploppedVideo) => {
      soundEffects['yahoo'].play()
      // app.borders.show()
      app.text = new TextHunk(app, ploppedVideo.lowerLeft().x, ploppedVideo.lowerLeft().y)

      d3.select(backgroundContainer).style('background', 'radial-gradient(#0058cade, #0047a2)')
        .transition()
        .style('opacity', 1)
        
    }
  }

  let notPlopped = true
  app.coords.onChange(() => {
    app.presentationContainer.style.top = `${app.coords.originY}px`
    app.presentationContainer.style.left = `${app.coords.originX}px`

    if (notPlopped && app.text && (-app.coords.originX > app.text.x + app.text.width - (3 * window.innerWidth / 4))) {
      notPlopped = false
      plopVideo()
    }
  })
  
  function plopVideo() {
    let x = -app.coords.originX + window.innerWidth / 3
    let y = -app.coords.originY + window.innerHeight / 2 + 100
    
    let videoAsset = _.sample(allAssets.filter(a => a.type === 'video'))
    let clonedEl = videoAsset.el.cloneNode()

    let ploppedVideo = new PloppedVideo(app, videoAsset.el.cloneNode(), x, y)
    app.ploppedVideos.push(ploppedVideo)

    let padding = Math.min(200, window.innerWidth / 4)
    let audioTargetX = x + videoAsset.el.offsetWidth / 2 + padding

    let audio1 = new AudioSymbol(app, x, y, soundEffects['cooking'].sound, audioTargetX, y - 100, true)
    let audio2 = new AudioSymbol(app, x, y, soundEffects['schwang'].sound, audioTargetX, y - 200)
    let audio3 = new AudioSymbol(app, x, y, soundEffects['sigh'].sound, audioTargetX, y - 300)
  }


  let possibleAnimations = [
    GrowingLetter,
    JennyHolzer,
    LetterRoulette
  ]

  possibleAnimations.forEach(a => a.preload())


  let sequence = [
    { type: 'animation', class: LetterRoulette },
    { type: 'animation', class: LetterRoulette },
    { type: 'animation', class: GrowingLetter },
    { type: 'animation', class: GrowingLetter },
    { type: 'animation', class: JennyHolzer },
    { type: 'function', function: (e) => plopVideo(e) }
  ]


  let tappedOnce = false
  let currentPointer = null

  let pointerAnimation
  document.addEventListener('pointerdown', (e) => {
    e.stopPropagation()
    
    if (!tappedOnce) {
      tappedOnce = true
      backgroundContainer.style.background = 'white'
      backgroundContainer.style.opacity = 0
      return
    }

    // Only one touch at a time for now
    if (app.currentPointer) {
      return
    }
    
    app.currentPointer = e.pointerId

    if (sequence.length > 0) {
      let nextThing = sequence.shift()
      if (nextThing.type === 'function') {
        nextThing.function(e)
      } else {
        pointerAnimation = new nextThing.class(app, presentationContainer, e.clientX, e.clientY)
        pointerAnimation.init && pointerAnimation.init()
      }
    } else {
      let animation = _.sample(possibleAnimations)
      pointerAnimation = new animation(app, presentationContainer, e.clientX, e.clientY)
      pointerAnimation.init && pointerAnimation.init()
    }
  })

  let prevX
  let prevY
  document.addEventListener('pointermove', (e) => {
    if (e.pointerId !== app.currentPointer) {
      return
    }
    
    if (app.draggingElement && prevX && prevY) {
      let deltaX = e.clientX - prevX
      let deltaY = e.clientY - prevY
      app.draggingElement.update(deltaX, deltaY)
    }

    prevX = e.clientX
    prevY = e.clientY
  })

  document.addEventListener('pointerup', (e) => {
    if (e.pointerId !== app.currentPointer) {
      return
    }

    app.currentPointer = null
    
    pointerAnimation && pointerAnimation.pointerUp()

    pointerAnimation = null

    app.draggingElement && app.draggingElement.pointerUp()

    app.draggingElement = null

    prevX = null
    prevY = null
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

  let videos = [{ url: 'assets/videos/hand-4.mp4' }]
  videos.forEach(asset => {
    let videoEl = document.createElement('video')
    videoEl.src = `../${asset.url}`
    videoEl.setAttribute('muted', true)
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