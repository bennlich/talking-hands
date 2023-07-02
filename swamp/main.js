import * as THREE from 'three'
import assets from '../assets.js'
import html from '../lib/nanohtml.es6.js'
import morph from '../lib/nanomorph.es6.js'

// stop long touch hold from poping up context menus
document.addEventListener('contextmenu', (e) => false)

window.allAssets = []

let mainContainer = document.createElement('main')
document.body.appendChild(mainContainer)
morph(mainContainer, html`
  <main>
    <div class="asset-container"></div>
    <div class="presentation-container"></div>
  </main>
`)

function loadAssets() {
  let assetContainer = document.querySelector('.asset-container')

  assets.images.forEach(asset => {
    let imageEl = new Image()
    imageEl.src = `../${asset.url}`
    imageEl.style.width = `${Math.min(200, window.innerWidth / 2)}px`
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
    videoEl.style.width = `${Math.min(200, window.innerWidth / 2)}px`
    assetContainer.appendChild(videoEl)
    allAssets.push({
      type: 'video',
      el: videoEl,
      id: asset.url
    })
  })

  allAssets = _.shuffle(allAssets)
}

loadAssets()

function getAsset(e) {
  // Select a new asset mapped to pixel space
  let pixelsPerAsset = Math.floor((window.innerWidth * window.innerHeight) / allAssets.length)
  let assetIndex = Math.floor((e.clientY * window.innerWidth + e.clientX) / pixelsPerAsset)
  return allAssets[assetIndex]
}

function showAsset(asset, e) {
  d3.select(asset.el)
    .transition()
    .duration(500)
    .style('opacity', 1)

  let { width, height } = asset.el.getBoundingClientRect()

  // center the asset in the middle of the screen
  asset.el.style.left = `${window.innerWidth / 2 - width / 2}px`
  asset.el.style.top = `${window.innerHeight / 2 - height / 2}px`

  if (asset.type === 'video') {
    asset.el.play()
  }
}

function hideAsset(asset) {
  d3.select(asset.el)
    .transition()
    .duration(500)
    .style('opacity', 0)
}

let currentAsset
document.addEventListener('pointerdown', (e) => {
  if (currentAsset) {
    // currentAsset.el.style.visibility = 'hidden'
    hideAsset(currentAsset)
  }

  currentAsset = getAsset(e)

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
  if (currentAsset) {
    hideAsset(currentAsset)
  }
  currentAsset = null
})

const cloudFrag = `
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise3(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }


float fbm3d(vec3 x, const in int it) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100);

    
    for (int i = 0; i < 32; ++i) {
        if(i<it) {
            v += a * snoise3(x);
            x = x * 2.0 + shift;
            a *= 0.5;
        }
    }
    return v;
}


vec4 gammaCorrect(vec4 color, float gamma){
  return pow(color, vec4(1.0 / gamma));
}

vec4 levelRange(vec4 color, float minInput, float maxInput){
  return min(max(color - vec4(minInput), vec4(0.0)) / (vec4(maxInput) - vec4(minInput)), vec4(1.0));
}

vec4 levels(vec4 color, float minInput, float gamma, float maxInput){
  return gammaCorrect(levelRange(color, minInput, maxInput), gamma);
}


uniform sampler2D uTxtShape;
uniform sampler2D uTxtCloudNoise;
uniform float uTime;

uniform float uFac1;
uniform float uFac2;
uniform float uTimeFactor1;
uniform float uTimeFactor2;
uniform float uDisplStrenght1;
uniform float uDisplStrenght2;

varying vec2 vUv;

void main() {
    vec2 newUv = vUv;

    vec4 txtNoise1 = texture2D(uTxtCloudNoise, vec2(vUv.x + uTime * 0.000001, vUv.y - uTime * 0.000014)); // noise txt
    vec4 txtNoise2 = texture2D(uTxtCloudNoise, vec2(vUv.x - uTime * 0.00002, vUv.y + uTime * 0.000017 + 0.2)); // noise txt

    float noiseBig = fbm3d(vec3(vUv * uFac1, uTime * uTimeFactor1), 4)+ 1.0 * 0.5;
    newUv += noiseBig * uDisplStrenght1;

    float noiseSmall = snoise3(vec3(newUv * uFac2, uTime * uTimeFactor2));

    newUv += noiseSmall * uDisplStrenght2;

    vec4 txtShape = texture2D(uTxtShape, newUv);

    float alpha = levels((txtNoise1 + txtNoise2) * 0.6, 0.2, 0.4, 0.7).r;
    alpha *= txtShape.r;

    gl_FragColor = vec4(vec3(0.35,0.35,0.35), alpha);
}
`

const cloudVert = `
uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec2 vUv;

void main() {
  // #include <uv_vertex>
  vUv = uv;

  vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
  vec2 scale;
  scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
  scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
  vec2 rotatedPosition;
  rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
  rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
  mvPosition.xy += rotatedPosition;
  gl_Position = projectionMatrix * mvPosition;
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <fog_vertex>
}
`


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
mainContainer.appendChild( renderer.domElement );

const geometry = new THREE.PlaneGeometry( 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


camera.position.z = 0.2;
camera.position.x = -0.25;
camera.position.y = -0.15;



const myUniforms = {
  uTime: {value: Math.random() * 10000},
  uTxtShape: {value: new THREE.TextureLoader().load("clouds/1.jpg")},
  uTxtCloudNoise: {value: new THREE.TextureLoader().load("clouds/2.jpg")},
  uFac1: {value: 3.4},
  uFac2: {value: 3.3},
  uTimeFactor1: {value: 0.0005},
  uTimeFactor2: {value: 0.0001},
  uDisplStrenght1: {value: 0.3},
  uDisplStrenght2: {value: 0.0},
}

const cloudMaterial = new THREE.ShaderMaterial({
  uniforms: {...THREE.UniformsUtils.clone(THREE.ShaderLib.sprite.uniforms), ...myUniforms},
  vertexShader: cloudVert,
  fragmentShader: cloudFrag,
  transparent: true,
})

const cube = new THREE.Mesh( geometry, cloudMaterial );
scene.add( cube );


async function init() {
  animate();
}

function animate() {
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  if (cloudMaterial) {
    cloudMaterial.uniforms.uTime.value += 1
  }
  
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}


init()