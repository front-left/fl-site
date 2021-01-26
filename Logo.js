global.THREE = require("three");
const THREE = global.THREE;
const OrbitControls = require("orbit-controls-es6");
const loadFont = require("load-bmfont");
const createGeometry = require("three-bmfont-text");
const MSDFShader = require("three-bmfont-text/shaders/msdf");


const fontFile = "./Montserrat-Bold.fnt";
const fontAtlas = "./Montserrat-Bold.png";
const shaders = require("./shaders.js");

class Logo1 {
	constructor() {
		this.renderer = new THREE.WebGLRenderer({
			alpha: true
		});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x828282, 1);
		let logoContainer = document.getElementById("logoContainer");
		logoContainer.appendChild(this.renderer.domElement);
		
		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		
		this.camera.position.z = 60;
		
		this.scene = new THREE.Scene();
		
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableZoom = false;
		this.controls.maxAzimuthAngle = Math.PI/4;
		this.controls.minAzimuthAngle = -Math.PI/4;
		this.controls.maxPolarAngle = 3*Math.PI/4; 
		this.controls.minPolarAngle = Math.PI/4;
		
		this.clock = new THREE.Clock();
	}
	
	init() {
		// Create geometry of packed glyphs
		loadFont(fontFile, (err, font) => {
			this.fontGeometry = createGeometry({
				font,
				text: "FRONT LEFT"
			});
			
			// Load texture containing font glyps
			this.loader = new THREE.TextureLoader();
			this.loader.load(fontAtlas, texture => {
				this.fontMaterial = new THREE.RawShaderMaterial(
					MSDFShader({
						map: texture,
						side: THREE.DoubleSide,
						transparent: true,
						negate: false,
						color: 0x1eff00
					})
				);
				this.createRenderTarget();
				this.createMesh();
				this.animate();
				this.addEvents();
			});
		});
		let fallbackLogo = document.getElementById("fallbackLogo");
		fallbackLogo.remove();
	}
	
	createMesh(){
		this.geometry = new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3);
		this.material = new THREE.ShaderMaterial({
			vertexShader: shaders.vert,
			fragmentShader: shaders.frag,
			uniforms: {
				uTime: { value: 0 },
				uTexture: { value: this.rt.texture }
			}
		});
		
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		
		this.scene.add(this.mesh);
	}
	
	createRenderTarget() {
		// Render Target setup
		this.rt = new THREE.WebGLRenderTarget(
			window.innerWidth,
			window.innerHeight
		);
		this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
		this.rtCamera.position.z = 2.5;
		
		this.rtScene = new THREE.Scene();
		this.rtScene.background = new THREE.Color("#828282");
		
		// Create text mesh with font geometry and material
		this.text = new THREE.Mesh(this.fontGeometry, this.fontMaterial);
		
		// Adjust dimensions
		this.text.position.set(-0.965, -0.275, 0);
		this.text.rotation.set(Math.PI, 0, 0);
		this.text.scale.set(0.007, 0.02, 1);
		
		// Add text mesh to buffer scene
		this.rtScene.add(this.text);
	}
	
	animate() {
		requestAnimationFrame(this.animate.bind(this));
		
		this.render();
	}
	
	render() {
		this.controls.update();
		// this.mesh.rotation.x += 0.005;
		this.mesh.rotation.z += 0.015;
		this.material.uniforms.uTime.value = this.clock.getElapsedTime();
		this.renderer.setRenderTarget(this.rt);
		this.renderer.render(this.rtScene, this.rtCamera);
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.scene, this.camera);
	}
	
	addEvents() {
		window.addEventListener("resize", this.resize.bind(this));
	}
	
	resize() {
		let width = window.innerWidth;
		let height = window.innerHeight;
		
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}
}

var logo1 = new Logo1();
logo1.init();