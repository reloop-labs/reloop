import * as THREE from "three";

interface AppleStripeConfig {
	axis: "x" | "y";
	top: number;
	bottom: number;
}

function getAppleStripeConfig(mesh: THREE.Mesh): AppleStripeConfig {
	const geom = mesh.geometry;
	const pos = geom?.attributes?.position;
	if (!geom || !pos) {
		return { axis: "y", top: 1, bottom: 0 };
	}

	const worldUp = new THREE.Vector3(0, 1, 0);
	const q = new THREE.Quaternion();
	mesh.getWorldQuaternion(q);
	const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
	const yAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(q);

	const useY = Math.abs(yAxis.dot(worldUp)) >= Math.abs(xAxis.dot(worldUp));
	const axis = useY ? "y" : "x";
	const axisWorld = useY ? yAxis : xAxis;
	const dir = Math.sign(axisWorld.dot(worldUp)) || 1;

	geom.computeBoundingBox();
	const bb = geom.boundingBox;
	if (!bb) return { axis: "y", top: 1, bottom: 0 };

	const min = axis === "y" ? bb.min.y : bb.min.x;
	const max = axis === "y" ? bb.max.y : bb.max.x;
	const top = dir > 0 ? max : min;
	const bottom = dir > 0 ? min : max;

	if (!Number.isFinite(top) || !Number.isFinite(bottom) || top === bottom) {
		return { axis: "y", top: 1, bottom: 0 };
	}
	return { axis, top, bottom };
}

function makeRainbowAppleMaterial(
	baseMaterial: THREE.Material,
	{ axis, top, bottom }: AppleStripeConfig,
): THREE.Material {
	const m = baseMaterial.clone() as THREE.MeshStandardMaterial;

	m.transparent = true;
	m.depthWrite = false;
	m.alphaTest = 0;

	if ("roughness" in m) m.roughness = 0.9;
	if ("metalness" in m) m.metalness = 0;
	m.polygonOffset = true;
	m.polygonOffsetFactor = -1;
	m.polygonOffsetUnits = -1;

	m.onBeforeCompile = (shader) => {
		shader.uniforms.uAppleTop = { value: top };
		shader.uniforms.uAppleBottom = { value: bottom };

		shader.vertexShader = shader.vertexShader
			.replace(
				"#include <common>",
				`#include <common>\nvarying float vAppleCoord;`,
			)
			.replace(
				"#include <begin_vertex>",
				`#include <begin_vertex>\nvAppleCoord = ${axis === "y" ? "transformed.y" : "transformed.x"};`,
			);

		shader.fragmentShader = shader.fragmentShader
			.replace(
				"#include <common>",
				`#include <common>
varying float vAppleCoord;
uniform float uAppleTop;
uniform float uAppleBottom;

vec3 appleSrgbToLinear(vec3 c) {
  bvec3 cutoff = lessThanEqual(c, vec3(0.04045));
  vec3 low = c / 12.92;
  vec3 high = pow((c + 0.055) / 1.055, vec3(2.4));
  return vec3(
    cutoff.r ? low.r : high.r,
    cutoff.g ? low.g : high.g,
    cutoff.b ? low.b : high.b
  );
}

vec3 appleRainbowStripe(float t) {
  float w0 = 3.5;
  float w = w0 + 5.0;
  float s0 = w0 / w;
  float s1 = (w0 + 1.0) / w;
  float s2 = (w0 + 2.0) / w;
  float s3 = (w0 + 3.0) / w;
  float s4 = (w0 + 4.0) / w;

  vec3 c0 = appleSrgbToLinear(vec3(117.0, 189.0, 34.0) / 255.0);
  vec3 c1 = appleSrgbToLinear(vec3(255.0, 198.0, 40.0) / 255.0);
  vec3 c2 = appleSrgbToLinear(vec3(255.0, 102.0, 27.0) / 255.0);
  vec3 c3 = appleSrgbToLinear(vec3(207.0, 14.0, 43.0) / 255.0);
  vec3 c4 = appleSrgbToLinear(vec3(176.0, 29.0, 171.0) / 255.0);
  vec3 c5 = appleSrgbToLinear(vec3(0.0, 161.0, 222.0) / 255.0);

  if (t < s0) return c0;
  if (t < s1) return c1;
  if (t < s2) return c2;
  if (t < s3) return c3;
  if (t < s4) return c4;
  return c5;
}
`,
			)
			.replace(
				"#include <map_fragment>",
				`#include <map_fragment>
	float denomApple = uAppleBottom - uAppleTop;
	denomApple = (denomApple >= 0.0 ? 1.0 : -1.0) * max(abs(denomApple), 0.0001);
	float tApple = (vAppleCoord - uAppleTop) / denomApple;
	tApple = clamp(tApple, 0.0, 1.0);
	diffuseColor.rgb = appleRainbowStripe(tApple);
`,
			);
	};

	m.customProgramCacheKey = () => `rainbow-apple-v1-${axis}`;
	m.needsUpdate = true;
	return m;
}

export function applyRainbowToMesh(mesh: THREE.Mesh): void {
	const config = getAppleStripeConfig(mesh);
	const applyToMaterial = (mat: THREE.Material) =>
		makeRainbowAppleMaterial(mat, config);

	if (Array.isArray(mesh.material)) {
		mesh.material = mesh.material.map(applyToMaterial);
	} else if (mesh.material) {
		mesh.material = applyToMaterial(mesh.material);
	}
}
