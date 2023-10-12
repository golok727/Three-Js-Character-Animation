import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const DEG_TO_RAD = (deg) => (deg * Math.PI) / 180;
const RAD_TO_DEG = (rad) => (rad * 180) / Math.PI;

console.log("%cRadhey Shyam", "font: Arial; font-size: 2rem;");

const scene = new THREE.Scene();
// scene.background = new THREE.Color("#cca675");
const loader = new GLTFLoader();

const file = "poseFinal.gltf";

loader.load(file, (model) => {
	model.scene.position.set(0, 0, 0);
	model.scene.castShadow = true;
	model.scene.receiveShadow = true;

	scene.add(model.scene);
	model.scene.children[0]?.children?.forEach((obj) => {
		if (obj.isMesh) {
			obj.castShadow = true;
		}
	});
	console.log(model);

	const mixer = new THREE.AnimationMixer(model.scene);
	const action = mixer.clipAction(model.animations[0]);
	action.fadeIn(1);
	action.setLoop(THREE.LoopPingPong);
	action.clampWhenFinished = true;
	action.play();
	main(mixer);
});
const createPlane = (width, height, color = "#606060") => {
	const geometry = new THREE.PlaneGeometry(width, height);
	const material = new THREE.MeshLambertMaterial({ color });

	const plane = new THREE.Mesh(geometry, material);
	return plane;
};

const createLights = () => {
	const ambientLight = new THREE.AmbientLight("#e5e9ef", 0.3);

	const directionalLight = new THREE.DirectionalLight("#1f4f9d", 2);
	directionalLight.position.set(2, 12, 5); // Set the light's position
	directionalLight.castShadow = true; // Enable shadow casting
	directionalLight.shadow.mapSize = new THREE.Vector2(2048, 2048);

	const light1 = new THREE.PointLight("#e4a63e", 10);
	light1.position.set(1, 1, 2);
	light1.castShadow = true;
	light1.shadow.mapSize = new THREE.Vector2(2048, 2048);

	const light2 = new THREE.PointLight("#d83030", 10);
	light2.position.set(-2, 1.3, 0.2);

	const light3 = new THREE.PointLight("#d83030", 4);
	light3.position.set(3, 0.5, 0.2);

	return [ambientLight, light1, light2, light3, directionalLight];
};
/**
 *
 * @param {THREE.AnimationMixer} mixer
 */

const main = (mixer) => {
	const camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	// Renderer
	const renderer = new THREE.WebGLRenderer({
		antialias: true,
		premultipliedAlpha: true,
		preserveDrawingBuffer: true,
	});
	renderer.shadowMap.enabled = true;

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.pixelRatio = window.devicePixelRatio;
	document.body.appendChild(renderer.domElement);

	// Controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	// Objects
	const floor = createPlane(100, 100, "#303030");
	floor.receiveShadow = true;
	floor.rotateX(-Math.PI / 2);
	floor.position.y = -1;

	const wall = createPlane(100, 100, "#404040");
	wall.receiveShadow = true;
	wall.position.z = -1;

	const lights = createLights();
	lights.forEach((light) => scene.add(light));

	scene.add(floor);
	scene.add(wall);

	camera.position.z = 3; // move the camera out a little bit other vise the camera will be inside the cube

	renderer.render(scene, camera);

	const clock = new THREE.Clock();
	/**
	 * @type {THREE.Object3D}
	 */
	const hipBone = mixer.getRoot().children[0].getObjectByName("mixamorigHips");

	const cameraOffset = new THREE.Vector3(0, 0, 2.567); // Offset from the bone

	function animate(time) {
		if (hipBone) {
			const hipBonePosition = new THREE.Vector3();
			hipBone.getWorldPosition(hipBonePosition);

			camera.position.copy(hipBonePosition.clone().add(cameraOffset));
			camera.lookAt(hipBonePosition);
		}

		renderer.render(scene, camera);

		if (mixer) {
			mixer.update(clock.getDelta());
		}
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
};
