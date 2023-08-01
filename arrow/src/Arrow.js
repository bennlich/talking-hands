export default class Arrow {

  constructor({ src, angle, speed, resetDistance }) {
    this.src = src
    this.current = { x: 0, y: 0 }
    this.angle = angle
    this.speed = speed
    this.resetDistance = resetDistance
    this.samplesPerStep = 50
    this.points = []
    this.maxNumPoints = 100
    this.amplitude = 5
    this.frequency = 1 / 10
  }

  step(ms) {
    // increment current position
    if (this.mouse) {
      let angleBetweenCurrentPositionAndMouse = Math.atan2(this.current.y - this.mouse.y, this.current.x - this.mouse.x)
      this.angle -= (angleBetweenCurrentPositionAndMouse - this.angle) * ms / 1000
    }
    this.current.x += this.speed * ms / 1000 * Math.cos(this.angle)
    this.current.y += this.speed * ms / 1000 * Math.sin(this.angle)

    // append current position to list of points
    this.points.push(_.clone(this.current))

    // only keep track of maxNumPoints points
    while (this.points.length > this.maxNumPoints) {
      this.points.shift()
    }

    // reset if it travels too far
    if (distance(this.current, { x: 0, y: 0 }) > this.resetDistance) {
      // this.current = _.clone(this.src)
      this.current = { x: 0, y: 0 }
      this.points = []
    }
  }

  pointerDown(x, y) {
    this.mouse = { x, y }
  }

  pointerUp() {
    this.mouse = null
  }

  update(deltaX, deltaY) {
    this.mouse.x += deltaX
    this.mouse.y += deltaY
  }

  draw(canvas) {
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // paint from the source to target
    if (this.points.length < 2) {
      return
    }

    let squiggles = [
      {
        y: (x) => Math.cos(x * this.frequency) * this.amplitude,
        valid: (i) => (i >= 40),
        draw: (ctx) => {
          ctx.lineWidth = 10
          ctx.strokeStyle = 'rgb(0, 0, 0)'
          ctx.stroke()
        }
      },
      {
        y: (x, i) => 40 + Math.cos(x * 2 * this.frequency) * this.amplitude,
        valid: (i) => (i < 30),
        draw: (ctx) => {
          ctx.lineWidth = 5
          ctx.strokeStyle = 'rgb(0, 0, 0)'
          ctx.stroke()
        }
      },
      {
        y: (x, i) => -30 + Math.cos(x * 1.5 * this.frequency) * this.amplitude + Math.cos(x * 0.5 * this.frequency) * this.amplitude,
        valid: (i) => (i > 20 && i < 55),
        draw: (ctx) => {
          ctx.lineWidth = 3
          ctx.strokeStyle = 'rgb(0, 0, 0)'
          ctx.stroke()
        }
      }
    ]

    ctx.save()
    ctx.translate(this.src.x, this.src.y)

    for (let squiggle of squiggles) {
      ctx.beginPath()
      let firstPoint = true
      for (var i = 0; i < this.points.length - 1; i++) {
        if (!squiggle.valid(i)) {
          continue
        }
        
        let x0 = this.points[i].x
        let y0 = this.points[i].y
        let x1 = this.points[i+1].x
        let y1 = this.points[i+1].y
        let d = distance(this.points[i+1], this.points[i])
        let angle = Math.atan2((y1 - y0), x1 - x0)
        ctx.save()
        ctx.translate(x0, y0)
        ctx.rotate(angle)

        let y = squiggle.y(x0)
        if (firstPoint) {
          ctx.moveTo(0, y)
          firstPoint = false
        } else {
          ctx.lineTo(0, y)
        }

        // let numSamples = Math.round(this.samplesPerStep * d)
        // for (var j = 0; j < numSamples; j++) {
        //   let x = j * (x1 - x0) / numSamples
        //   let y = squiggle.y(x0 + x)
        //   if (firstPoint) {
        //     ctx.moveTo(x, y)
        //     firstPoint = false
        //   } else {
        //     ctx.lineTo(x, y)
        //   }
        // }

        ctx.restore()

      }

      squiggle.draw(ctx)
    }
    
    ctx.restore()
  }

}

function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

function smooth(input, iterations = 3) {

  for (let i = 0; i < iterations; i++) {
    input = chalkin(input)
  }

  return input
  
  // from https://github.com/Jam3/chaikin-smooth/blob/master/index.js
  function chalkin(input, output) {
    if (!Array.isArray(output)) {
      output = []
    }

    if (input.length>0) {
      output.push(_.clone(input[0]))
    }
    
    for (var i=0; i<input.length-1; i++) {
        var p0 = input[i]
        var p1 = input[i+1]
        var p0x = p0[0],
            p0y = p0[1],
            p1x = p1[0],
            p1y = p1[1]

        var Q = [ 0.75 * p0x + 0.25 * p1x, 0.75 * p0y + 0.25 * p1y ]
        var R = [ 0.25 * p0x + 0.75 * p1x, 0.25 * p0y + 0.75 * p1y ]
        output.push(Q)
        output.push(R)
    }
    
    if (input.length > 1) {
      output.push(_.clone(input[ input.length-1 ]))
    }
    
    return output
  }

}
