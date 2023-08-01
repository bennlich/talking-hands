class CoordinateSystem {
  constructor({ zoomEnabled } = { zoomEnabled: true }) {
    this.scale = 0
    this.originX = 0
    this.originY = 0

    this.prevMouseX = null
    this.prevMouseY = null

    this.callbacks = []
    this.mousedown = false
    this.panning = false

    this.zoomEnabled = zoomEnabled
  }

  // transform(worldCoord) {
  //   let worldX = worldCoord.x;
  //   let worldY = worldCoord.y;
  //   return {
  //     x: (worldX + this.originX) * this.scale,
  //     y: (worldY + this.originY) * this.scale
  //   };
  // }

  getZoom() {
    return Math.pow(2, this.scale)
  }

  invert(screenCoord) {
    let screenX = screenCoord.x
    let screenY = screenCoord.y
    return {
      x: (screenX - this.originX) / this.getZoom(),
      y: (screenY - this.originY) / this.getZoom()
    }
  }

  registerEventListeners(element) {
    // Pan
    element.addEventListener('pointerdown', (event) => {
      event.stopPropagation()
      
      if (!this.pointerId) {
        this.pointerId = event.pointerId
        this.mousedown = true
      }
    })

    document.addEventListener('pointermove', (event) => {
      if (this.pointerId !== event.pointerId) {
        return
      }

      if (this.mousedown && this.prevMouseX && this.prevMouseY) {
        this.panning = true

        this.originX += (event.clientX - this.prevMouseX)
        this.originY += (event.clientY - this.prevMouseY)
        this.emitChange()
      }

      this.prevMouseX = event.clientX
      this.prevMouseY = event.clientY
    })

    document.addEventListener('pointerup', (event) => {
      if (this.pointerId !== event.pointerId) {
        return
      }
      
      if (this.panning) {
        // Stop the event from triggering any other listeners (e.g. the listener that creates a new text input)
        event.stopPropagation()
      }

      this.mousedown = false
      this.panning = false
      this.prevMouseX = null
      this.prevMouseY = null
      this.pointerId = null
    })

    // Zoom
    if (this.zoomEnabled) {
      document.addEventListener('wheel', (event) => {
        let oldMouseWorldCoord = this.invert({ x: event.clientX, y: event.clientY })
        if (event.deltaY < 0) {
          this.scale += 0.1
        } else {
          this.scale -= 0.1
        }
        let newMouseWorldCoord = this.invert({ x: event.clientX, y: event.clientY })
        this.originX += (newMouseWorldCoord.x - oldMouseWorldCoord.x) * this.getZoom()
        this.originY += (newMouseWorldCoord.y - oldMouseWorldCoord.y) * this.getZoom()
        this.emitChange()
      })
    }
  }

  onChange(fn) {
    this.callbacks.push(fn)
  }

  emitChange() {
    this.callbacks.forEach((fn) => fn())
  }
}

export default CoordinateSystem
