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

  let fontSize = 900
  let scale = 1 / parsedFont.unitsPerEm * fontSize
  let maxHeight = (parsedFont.ascender - parsedFont.descender) * scale

  let testPath = parsedFont.getPath('g', 0, 0, fontSize)
  let bbox = testPath.getBoundingBox()
  let glyphWidth = bbox.x2 - bbox.x1
  let glyphHeight = bbox.y2 - bbox.y1

  var svg = d3.select("body").append("svg")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight)
    .attr("version", "1.1")
    .attr("xmlns", "http://www.w3.org/2000/svg")

  // let chars = 'abcdefghijklmnopqrstuvwxyz'
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let boxWidth = window.innerWidth / chars.length
  let boxHeight = window.innerHeight / chars.length
  for (var i = 0; i < chars.length; i++) {
    let startChar = chars[i]
    for (var j = 0; j < chars.length; j++) {
      let endChar = chars[j]
      let x = boxWidth * i + boxWidth / 2
      let y = boxHeight * (j + 1)
      
      let startPath = getCenteredPath(startChar, x, y, 30)
      let endPath = getCenteredPath(endChar, x, y, 30)
      let svgPath = svg.append("path")
        .attr("fill", "#000")
        .attr("stroke", "#000")
      svgPath.attr("d", startPath.toPathData())
      svgPath.attr("d", function() {
        return pathTween(endPath.toPathData(), 2).bind(this)()(0.7)
      })
    }
  }

  function getCenteredPath(char, x, y, fontSize) {
    let measurePath = parsedFont.getPath(char, 0, 0, fontSize)
    let bbox = measurePath.getBoundingBox()
    let glyphWidth = bbox.x2 - bbox.x1
    let glyphHeight = bbox.y2 - bbox.y1
    return parsedFont.getPath(char, x - glyphWidth / 2, y, fontSize)
  }

  function nextForm() {
    
    let randomChar = chars.charAt(Math.floor(Math.random() * chars.length))

    let pathFrom = path
    let numPreviousPoints = path.commands.length
    
    let testPath = parsedFont.getPath(randomChar, 0, 0, fontSize)
    let bbox = testPath.getBoundingBox()
    let glyphWidth = bbox.x2 - bbox.x1
    let glyphHeight = bbox.y2 - bbox.y1
    
    let nextPath = parsedFont.getPath(randomChar, window.innerWidth / 2 - glyphWidth / 2, window.innerHeight - (bbox.y2 * scale) - (window.innerHeight - glyphHeight) / 2, fontSize)

    svgPath
      .attr("d", function() {
        return pathTween(nextPath.toPathData(), 24).bind(this)()(0.5)
      })
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