import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { RNG } from "./rng.js";
import { blocks, resources } from "./blocks.js";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial();

/**
 * Represents the world in the game.
 */
export class World extends THREE.Group {
  /**
   * @type {{
   * id: number,
   * instanceId: number
   * }[][][]}
   */
  data = [];

  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    },
  };

  /**
   * Creates a new instance of the World class.
   * @param {Object} size - The size of the world.
   * @param {number} size.width - The width of the world.
   * @param {number} size.height - The height of the world.
   */
  constructor(size = { width: 64, height: 32 }) {
    super();
    this.size = size;
  }

  /**
   * Generates the terrain data for the world.
   */
  generate() {
    const rng = new RNG(this.params.seed);
    this.initializeTerrain();
    this.generateResources(rng);
    this.generateTerrain(rng);
    this.generateMeshes();
  }

  /**
   * initializes the terrain data for the world.
   */
  initializeTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  generateResources(rng) {
    const simplex = new SimplexNoise(rng);
    resources.forEach((resource) => {
      for (let x = 0; x < this.size.width; x++) {
        for (let y = 0; y < this.size.width; y++) {
          for (let z = 0; z < this.size.width; z++) {
            const value = simplex.noise3d(
              x / resource.scale.x,
              y / resource.scale.y,
              z / resource.scale.z
            );
            if (value > resource.scarcity) {
              this.setBlockId(x, y, z, resource.id);
            }
          }
        }
      }
    });
  }

  /**
   * Generates the terrain for the world.
   */
  generateTerrain(rng) {
    const simplex = new SimplexNoise(rng);
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        const value = simplex.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );

        const scaledNoise =
          this.params.terrain.magnitude * value + this.params.terrain.offset;
        let height = Math.floor(this.size.height * scaledNoise);
        height = Math.max(0, Math.min(this.size.height - 1, height));
        for (let y = 0; y <= this.size.height; y++) {
          if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  /**
   * Generates the meshes for the world.
   */
  generateMeshes() {
    this.clear();

    const maxCount = this.size.width * this.size.height * this.size.width;
    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    mesh.count = 0;

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;
          const blockType = Object.values(blocks).find((x) => x.id === blockId);
          const instanceId = mesh.count;
          if (blockId != blocks.empty.id && !this.isBlockObscured(x, y, z)) {
            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.setColorAt(instanceId, new THREE.Color(blockType.color));
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }

    this.add(mesh);
  }

  /**
   * Gets the block at the specified coordinates.
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @returns {Object|null} - The block object at the specified coordinates, or null if the coordinates are out of bounds.
   */
  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  }

  /**
   * Sets the ID of a block at the specified coordinates.
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @param {number} id - The ID to set.
   */
  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
   * Sets the instance ID of a block at the specified coordinates.
   *
   * @param {number} x - The x-coordinate of the block.
   * @param {number} y - The y-coordinate of the block.
   * @param {number} z - The z-coordinate of the block.
   * @param {number} instanceId - The instance ID to set.
   */
  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  /**
   * Checks if the specified coordinates are within the bounds of the world.
   * @param {number} x - The x-coordinate to check.
   * @param {number} y - The y-coordinate to check.
   * @param {number} z - The z-coordinate to check.
   * @returns {boolean} - True if the coordinates are within the bounds of the world, false otherwise.
   */
  inBounds(x, y, z) {
    return (
      x >= 0 &&
      x < this.size.width &&
      y >= 0 &&
      y < this.size.height &&
      z >= 0 &&
      z < this.size.width
    );
  }

  isBlockObscured(x, y, z) {
    const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
    const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
    const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

    // If any of the block's sides is exposed, it is not obscured
    if (
      up === blocks.empty.id ||
      down === blocks.empty.id ||
      left === blocks.empty.id ||
      right === blocks.empty.id ||
      forward === blocks.empty.id ||
      back === blocks.empty.id
    ) {
      return false;
    } else {
      return true;
    }
  }
}
