export const GPGPU_COMPUTE = `
uniform float uTime;
uniform float uDeltaTime;
uniform float uFlowFieldInfluence;
uniform float uFlowFieldStrength;
uniform float uFlowFieldFrequency;

uniform vec3  uMouse;
uniform float uMouseStrength;
uniform float uMouseSpeed;

uniform sampler2D uBase;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;
  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
  return p;
}

float simplexNoise4d(vec4 v){
  const vec2  C = vec2( 0.138196601125010504, 0.309016994374947451);
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);
  vec4 i0;
  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;
  i = mod(i, 289.0);
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
}

void main() {
  float time = uTime * 0.2;
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 particle = texture(uParticles, uv);
  vec4 base = texture(uBase, uv);

  float uRepelStrength = clamp(uMouseSpeed, 0.0, uMouseStrength);
  vec3 particlePos = particle.xyz;
  vec3 dir = normalize(particlePos - uMouse);
  float dist = distance(uMouse, particlePos);
  float repulsionForce = uRepelStrength / (dist * (dist + 1.0));
  vec3 repulsion = dir * repulsionForce * 2.0;
  particle.xyz += repulsion * uRepelStrength;

  if (particle.a >= 1.0) {
    particle.a = mod(particle.a, 1.0);
    particle.xyz = base.xyz;
  } else {
    float strength = simplexNoise4d(vec4(base.xyz, time + 1.0));
    float influence = (uFlowFieldInfluence - 0.5) * (- 2.0);
    strength = smoothstep(influence, 1.0, strength);

    vec3 flowField = vec3(
      simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 0.0, time)),
      simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 1.0, time)),
      simplexNoise4d(vec4(particle.xyz * uFlowFieldFrequency + 2.0, time))
    );
    flowField = normalize(flowField);
    particle.xyz += flowField * uDeltaTime * strength * uFlowFieldStrength;

    particle.a += uDeltaTime * 0.3;
    vec3 toTarget = base.xyz - particle.xyz;
    particle.xyz += toTarget * uDeltaTime * 2.2;
  }

  gl_FragColor = particle;
}
`;

export const PARTICLE_VERT = `
uniform vec2 uResolution;
uniform float uSize;
uniform float uVisibility;
uniform sampler2D uParticlesTexture;

attribute vec2 aParticlesUv;
attribute float aSize;

varying float vAlpha;

void main() {
  vec4 particle = texture2D(uParticlesTexture, aParticlesUv);

  vec4 modelPosition = modelMatrix * vec4(particle.xyz, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  vAlpha = uVisibility;
  gl_PointSize = uSize * aSize * uResolution.y * 0.006;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
`;

export const PARTICLE_FRAG = `
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.15, d) * vAlpha;
  gl_FragColor = vec4(vec3(1.0), a);
}
`;

export const ASCII_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const TRAIL_LEN = 24;

export const ASCII_FRAG = `
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uAsciiPixelSize;
uniform sampler2D uAsciiTexture;
uniform vec2 uCharCount;
uniform float uAsciiContrast;
uniform float uAsciiBrightness;
uniform float uAsciiMin;
uniform float uAsciiMax;

uniform float uAspect;
uniform vec3  uInk;
uniform vec2  uTrail[${TRAIL_LEN}];
uniform float uTrailAge[${TRAIL_LEN}];
uniform float uTrailOn;

varying vec2 vUv;

void main() {
  vec2 normalizedPixelSize = uAsciiPixelSize / uResolution;
  vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
  vec4 texColor = texture2D(tDiffuse, uvPixel);

  float lumaRGB = dot(vec3(0.2126, 0.7152, 0.0722), texColor.rgb);
  float luma = max(lumaRGB, texColor.a);

  luma = (luma - uAsciiMin) / (uAsciiMax - uAsciiMin);
  luma = clamp(luma, 0.0, 1.0);
  luma = luma + uAsciiBrightness;
  luma = (luma - 0.5) * uAsciiContrast + 0.5;
  luma = clamp(luma, 0.0, 1.0);

  vec2 cellUV = fract(vUv / normalizedPixelSize);
  float charIndex = clamp(
    floor(luma * (uCharCount.x - 1.0)),
    0.0,
    uCharCount.x - 1.0
  );
  vec2 asciiUV = vec2(
    (charIndex + cellUV.x) / uCharCount.x,
    cellUV.y
  );
  float character = texture2D(uAsciiTexture, asciiUV).r;

  vec2 cellCenter = uvPixel + normalizedPixelSize * 0.5;

  vec3 inkDeep = vec3(0.14, 0.16, 0.30);
  vec3 inkLift = vec3(0.20, 0.24, 0.42);
  vec3 baseColor = mix(inkDeep, inkLift, smoothstep(0.0, 1.0, cellCenter.x));

  float trail = 0.0;
  float headness = 0.0;
  for (int i = 0; i < ${TRAIL_LEN}; i++) {
    float age = uTrailAge[i];
    if (age >= 1.0) continue;
    vec2 d = (cellCenter - uTrail[i]) * vec2(uAspect, 1.0);
    float rad = 0.16 + age * 0.10;
    float g = smoothstep(rad, 0.0, length(d)) * (1.0 - age);
    if (g > trail) { trail = g; headness = 1.0 - age; }
  }
  trail *= uTrailOn;

  vec3 trailCool = vec3(0.29, 0.23, 1.0);
  vec3 trailHot  = vec3(1.0, 0.32, 0.68);
  vec3 trailColor = mix(trailCool, trailHot, headness);

  vec3 glyphColor = mix(baseColor, trailColor, clamp(trail, 0.0, 1.0));

  float ink = character * smoothstep(0.015, 0.18, luma);
  ink = min(1.0, ink + trail * character * 0.3);

  gl_FragColor = vec4(glyphColor * ink, ink);
}
`;
