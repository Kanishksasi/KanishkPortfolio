import * as THREE from 'three';
import images from 'portfolio-textures';

const canvas = document.getElementById('studio-scene');
const hero = document.querySelector('.personal-hero');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

async function initializeStudio() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-7, 7, 3.5, -3.5, .1, 60);
  camera.position.set(0, 0, 15);
  const studio = new THREE.Group();
  scene.add(studio);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x747c86, 2.4));
  const light = new THREE.DirectionalLight(0xffffff, 3.2);
  light.position.set(-3, 6, 10);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = -12;
  light.shadow.camera.right = 12;
  light.shadow.camera.top = 8;
  light.shadow.camera.bottom = -8;
  light.shadow.normalBias = .025;
  scene.add(light);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.ShadowMaterial({ opacity: .13 }));
  shadow.position.z = -1;
  shadow.receiveShadow = true;
  scene.add(shadow);

  function roundedShape(width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2, y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }
  function solid(width, height, depth, radius, color) {
    const geometry = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), { depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .025, bevelThickness: .025, curveSegments: 12 });
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: .5, metalness: .14 }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
  const loader = new THREE.TextureLoader();
  async function imageTexture(url, portrait = false) {
    const texture = await loader.loadAsync(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    if (!portrait) return texture;
    const picture = document.createElement('canvas');
    picture.width = 512;
    picture.height = 640;
    const context = picture.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 512, 640);
    context.drawImage(texture.image, 0, 0, texture.image.width, texture.image.width * 1.25, 0, 0, 512, 640);
    texture.dispose();
    const cropped = new THREE.CanvasTexture(picture);
    cropped.colorSpace = THREE.SRGBColorSpace;
    return cropped;
  }
  function picturePlane(width, height, texture) {
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  }
  const [portrait, investo, prepxa] = await Promise.all([imageTexture(images.portrait, true), imageTexture(images.investo), imageTexture(images.prepxa)]);
  const photo = new THREE.Group();
  photo.add(solid(2.1, 2.8, .08, .02, '#ffffff'));
  const face = picturePlane(1.96, 2.45, portrait);
  face.position.set(0, .1, .12);
  photo.add(face);
  photo.position.set(.1, .65, .15);
  photo.rotation.set(.04, -.15, -.07);
  studio.add(photo);

  function phone(texture, x, y, rotation, href) {
    const group = new THREE.Group();
    group.add(solid(1.02, 2.21, .12, .13, '#202422'));
    const screen = picturePlane(.92, 2, texture);
    screen.position.z = .16;
    group.add(screen);
    const sideButton = new THREE.Mesh(new THREE.BoxGeometry(.025, .24, .07), new THREE.MeshStandardMaterial({ color: '#7c847d', metalness: .7, roughness: .3 }));
    sideButton.position.set(.54, .25, .05);
    group.add(sideButton);
    group.position.set(x, y, .8);
    group.rotation.set(.04, rotation, rotation / 2);
    group.traverse(object => { object.userData.href = href; });
    studio.add(group);
    return group;
  }
  const investoPhone = phone(investo, -1.2, -.7, -.24, 'projects/investo.html');
  const prepxaPhone = phone(prepxa, 1.25, -.9, .19, 'projects/prepxa.html');
  const notebook = solid(1.6, 1.1, .09, .035, '#cec5ef');
  notebook.position.set(-.05, -1.4, .25);
  notebook.rotation.z = -.15;
  studio.add(notebook);
  const bookmark = new THREE.Mesh(new THREE.BoxGeometry(.11, 1.13, .025), new THREE.MeshStandardMaterial({ color: '#d44331' }));
  bookmark.position.set(.48, -1.4, .38);
  bookmark.rotation.z = -.15;
  studio.add(bookmark);

  let paused = motionPreference.matches;
  let visible = true;
  let frame;
  let targetRotation = 0;
  let pointerStart;
  let moved = false;
  let sceneScale = 1;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const motionButton = document.querySelector('.studio-motion');
  function updateMotionButton() {
    const label = paused ? 'Play studio motion' : 'Pause studio motion';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.querySelector('.scene-pause').hidden = paused;
    motionButton.querySelector('.scene-play').hidden = !paused;
  }
  function render(time = 0) {
    frame = undefined;
    studio.rotation.y += (targetRotation - studio.rotation.y) * .12;
    studio.rotation.x = -.04;
    if (!paused) {
      photo.rotation.z = -.07 + Math.sin(time * .00055) * .015;
      investoPhone.position.y = -.7 + Math.sin(time * .0008) * .035;
      prepxaPhone.position.y = -.9 + Math.cos(time * .0007) * .035;
    }
    renderer.render(scene, camera);
    canvas.dataset.rotation = studio.rotation.y.toFixed(3);
    if (visible && !document.hidden && (!paused || Math.abs(targetRotation - studio.rotation.y) > .001)) frame = requestAnimationFrame(render);
  }
  function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
  function resize() {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height, false);
    const worldWidth = width / height * 7;
    camera.left = -worldWidth / 2;
    camera.right = worldWidth / 2;
    camera.updateProjectionMatrix();
    const mobile = width <= 900;
    sceneScale = mobile ? (height < 570 ? .53 : .76) : 1.05;
    studio.scale.setScalar(sceneScale);
    studio.position.set(mobile ? 0 : worldWidth * .265, mobile ? (height < 570 ? -1.9 : -1.5) : -.1, 0);
    requestRender();
  }
  function rotate(delta) {
    targetRotation = THREE.MathUtils.clamp(targetRotation + delta, -.42, .42);
    requestRender();
  }
  function hit(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([investoPhone, prepxaPhone], true)[0]?.object.userData.href;
  }
  canvas.addEventListener('pointerdown', event => {
    pointerStart = event.clientX;
    moved = false;
    if (event.pointerType !== 'touch') canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (pointerStart !== undefined) {
      const delta = event.clientX - pointerStart;
      if (Math.abs(delta) > 3) moved = true;
      rotate(delta * .002);
      pointerStart = event.clientX;
    } else canvas.style.cursor = hit(event) ? 'pointer' : 'grab';
  });
  canvas.addEventListener('pointerup', event => {
    if (pointerStart !== undefined && !moved) {
      const href = hit(event);
      if (href) location.href = href;
    }
    pointerStart = undefined;
  });
  canvas.addEventListener('pointercancel', () => { pointerStart = undefined; });
  canvas.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); rotate(event.key === 'ArrowLeft' ? -.15 : .15); }
    if (event.code === 'Space') { event.preventDefault(); paused = !paused; updateMotionButton(); requestRender(); }
  });
  document.querySelector('.studio-left').addEventListener('click', () => rotate(-.15));
  document.querySelector('.studio-right').addEventListener('click', () => rotate(.15));
  motionButton.addEventListener('click', () => { paused = !paused; updateMotionButton(); requestRender(); });
  motionPreference.addEventListener('change', () => { paused = motionPreference.matches; updateMotionButton(); requestRender(); });
  document.addEventListener('visibilitychange', requestRender);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) requestRender(); });
  observer.observe(hero);
  new ResizeObserver(resize).observe(hero);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    hero.classList.remove('studio-ready');
    document.querySelector('.studio-controls').hidden = true;
  });
  updateMotionButton();
  resize();
  renderer.render(scene, camera);
  hero.classList.add('studio-ready');
  canvas.dataset.ready = 'true';
  document.querySelector('.studio-controls').hidden = false;
}

if (canvas) initializeStudio().catch(() => {
  hero.classList.remove('studio-ready');
  canvas.hidden = true;
});
