const fontFileName = '../fonts/FiraSansMedium.woff';

async function init() {

  let fontFile = await fetch(fontFileName)
  let parsedFont

  try {
      const data = await fontFile.arrayBuffer()
      parsedFont = window.parsedFont = opentype.parse(data)
  } catch (err) {
      console.error(err)
  }

  let fontSize = 2000

  // let canvas = document.createElement('canvas')
  // document.body.appendChild(canvas)
  // canvas.width = 2 * window.innerWidth
  // canvas.height = 2 * window.innerHeight
  // canvas.style.width = '100%'
  // canvas.style.height = '100%'

  // let context = canvas.getContext('2d')
  let scale = 1 / parsedFont.unitsPerEm * fontSize
  let maxHeight = (parsedFont.ascender - parsedFont.descender) * scale

  console.log(scale, maxHeight)

  let testPath = parsedFont.getPath('g', 0, 0, fontSize)
  let bbox = testPath.getBoundingBox()
  let glyphWidth = bbox.x2 - bbox.x1
  let glyphHeight = bbox.y2 - bbox.y1
  
  window.path = parsedFont.getPath('g', window.innerWidth / 2 - glyphWidth / 2, window.innerHeight - (bbox.y2 * scale) - (window.innerHeight - glyphHeight) / 2, fontSize)
  let commands = path.commands

  var svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)

  let svgPath = svg.append("path")
    .attr("fill", "#000")
    .attr("stroke", "#000")
  svgPath.attr("d", path.toPathData())

  window.addEventListener('keydown', (e) => {
    nextForm()
  })

  window.addEventListener('pointerdown', () => {
    nextForm()
  })

  nextForm()
  setInterval(() => nextForm(), 5000)

  function nextForm() {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
    let randomChar = chars.charAt(Math.floor(Math.random() * chars.length))

    let pathFrom = path
    let numPreviousPoints = path.commands.length
    
    let nextFontSize = Math.random() > 0.2 ? 2000 : 1200
    let testPath = parsedFont.getPath(randomChar, 0, 0, nextFontSize)
    let bbox = testPath.getBoundingBox()
    let glyphWidth = bbox.x2 - bbox.x1
    let glyphHeight = bbox.y2 - bbox.y1
    
    let nextPath = parsedFont.getPath(randomChar, window.innerWidth / 2 - glyphWidth / 2, window.innerHeight - (bbox.y2 * scale) - (window.innerHeight - glyphHeight) / 2, nextFontSize)
    let numNextPoints = nextPath.commands.length

    let transitionStartingPath = new opentype.Path()
    transitionStartingPath.extend(pathFrom)

    // // Add a bunch of dummy points that are useful for transitioning from
    // if (numNextPoints > numPreviousPoints) {
    //   let endingPoint = pathFrom.commands[pathFrom.commands.length - 1]
    //   let numNewPoints = numNextPoints - numPreviousPoints
    //   console.log(`Adding ${numNewPoints} dummy points`)
    //   for (var i = 0; i < numNewPoints; i++) {
    //     transitionStartingPath.commands.push({
    //       type: 'L',
    //       x: endingPoint.x,
    //       y: endingPoint.y
    //     })
    //   }
    // }

    // // Prepare for the transition by adding the dummy points
    // svgPath
    //   .attr("d", transitionStartingPath.toPathData())

    // // Execute the transition
    // svgPath
    //   .transition()
    //   .duration(1000)
    //   .ease(d3.easeCubicInOut)
    //   .attr("d", nextPath.toPathData())    

    svgPath
      .transition()
      // .ease(d3.easeLinear)
      .ease(d3.easeSinInOut)
      .duration(5000)
      .attrTween("d", pathTween(nextPath.toPathData(), 24))
  }
}

init()

// From https://gist.github.com/mbostock/3916621
function pathTween(d1, precision) {
  return function() {
    var path0 = this,
        path1 = path0.cloneNode(),
        n0 = path0.getTotalLength(),
        n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

    // Uniform sampling of distance based on specified precision.
    var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
    while ((i += dt) < 1) distances.push(i);
    distances.push(1);

    // Compute point-interpolators at each distance.
    var points = distances.map(function(t) {
      var p0 = path0.getPointAtLength(t * n0),
          p1 = path1.getPointAtLength(t * n1);
      return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
    });

    return function(t) {
      return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
    };
  };
}