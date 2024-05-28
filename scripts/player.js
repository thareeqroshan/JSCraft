import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

/**
 * Represents a player in the game.
 * @namespace Player
 */
export class Player {
  radius = 0.5;
  height = 1.75;
  jumpSpeed = 50;
  onGround = false;

  maxSpeed = 10;
  input = new THREE.Vector3();
  velocity = new THREE.Vector3();
  #worldVelocity = new THREE.Vector3();

  /**
   * The camera used by the player.
   * @type {THREE.PerspectiveCamera}
   */
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  /**
   * The controls for the player's movement.
   * @type {PointerLockControls}
   */
  controls = new PointerLockControls(this.camera, document.body);

  cameraHelper = new THREE.CameraHelper(this.camera);

  /**
   * Creates a new player instance.
   * @param {THREE.Scene} scene - The scene to add the player to.
   */
  constructor(scene) {
    this.position.set(32, 64, 32);
    this.cameraHelper.visible = false;

    scene.add(this.camera);
    scene.add(this.cameraHelper);

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    // Wirefrme mesh visualizing the player's bounding cylinder
    this.boundsHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    scene.add(this.boundsHelper);
  }

  get worldVelocity() {
    this.#worldVelocity.copy(this.velocity);
    this.#worldVelocity.applyEuler(
      new THREE.Euler(0, this.camera.rotation.y, 0)
    );
    return this.#worldVelocity;
  }

  /**
   * Applies a change in velocity 'dv' that is specified in the world frame
   * @param {THREE.Vector3} dv
   */

  applyWorldDeltaVelocity(dv) {
    dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
    this.velocity.add(dv);
  }

  applyInput(dt) {
    if (this.controls.isLocked) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;
      this.controls.moveRight(this.velocity.x * dt);
      this.controls.moveForward(this.velocity.z * dt);
      this.position.y += this.velocity.y * dt;

      document.getElementById("player-position").innerHTML = this.toString();
    }
  }

  updateBoundsHelper() {
    this.boundsHelper.position.copy(this.position);
    this.boundsHelper.position.y -= this.height / 2;
  }

  /**
   * The position of the player.
   * @type {THREE.Vector3}
   */
  get position() {
    return this.camera.position;
  }

  /**
   * Event handler for when a key is pressed.
   * @param {KeyboardEvent} event - The event object.
   */
  onKeyDown(event) {
    if (!this.controls.isLocked) {
      this.controls.lock();
      console.log("locked");
    }
    switch (event.code) {
      case "KeyW":
        this.input.z = this.maxSpeed;
        break;
      case "KeyA":
        this.input.x = -this.maxSpeed;
        break;
      case "KeyS":
        this.input.z = -this.maxSpeed;
        break;
      case "KeyD":
        this.input.x = this.maxSpeed;
        break;
      case "KeyR":
        this.position.set(32, 16, 32);
        this.velocity.set(0, 0, 0);
        break;
      case "Space":
        if (this.onGround) {
          this.velocity.y += this.jumpSpeed;
          this.onGround = false;
        }
        break;
    }
  }

  /**
   * Event handler for when a key is released.
   * @param {KeyboardEvent} event - The event object.
   */
  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.input.z = 0;
        break;
      case "KeyA":
        this.input.x = 0;
        break;
      case "KeyS":
        this.input.z = 0;
        break;
      case "KeyD":
        this.input.x = 0;
        break;
    }
  }

  /**
   * Returns player position in a readable string format.
   * @returns {string} - Player position.
   */

  toString() {
    let str = "";
    str += `X: ${this.position.x.toFixed(3)}, `;
    str += `Y: ${this.position.y.toFixed(3)}, `;
    str += `Z: ${this.position.z.toFixed(3)}`;
    return str;
  }
}
