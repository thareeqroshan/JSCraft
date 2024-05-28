import * as THREE from "three";
import { WorldChunk } from "./worldChunk";
import { Player } from "./player";

export class World extends THREE.Group {
  /**
   * The number of chunks to render around the player.
   * When this is set to 0, the chunk the player is on
   * is the only one that is rendered. If it is set to 1,
   * the adjacent chunks are rendered; if set to 2, the
   * chunks adjacent to those are rendered, and so on.
   */
  drawDistance = 1;

  /**
   * If true, chunks are loaded asynchronously.
   */
  asyncLoading = true;

  /**
   * Width and height of a single chunk of terrain
   */
  chunkSize = {
    width: 32,
    height: 32,
  };

  /**
   * Parameters for terrain generation
   */
  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.2,
      offset: 0.5,
    },
  };

  constructor(seed = 0) {
    super();
    this.seed = seed;
  }

  /**
   * Clears existing world data and regenerates everything
   * @param {Player} player
   */
  regenerate(player) {
    this.children.forEach((obj) => {
      obj.disposeChildren();
    });
    this.clear();
    this.update(player);
  }

  /**
   * Updates the visible portions of the world based on the
   * current player position
   * @param {Player} player
   */
  update(player) {
    const visibleChunks = this.getVisibleChunks(player);
    const chunksToAdd = this.getChunksToAdd(visibleChunks);
    this.removeUnusedChunks(visibleChunks);

    for (const chunk of chunksToAdd) {
      this.generateChunk(chunk.x, chunk.z);
    }
  }

  /**
   * Returns an array containing the coordinates of the chunks that
   * are current visible to the player
   * @param {Player} player
   * @returns {{ x: number, z: number}[]}
   */
  getVisibleChunks(player) {
    // Get the coordinates of the chunk the player is currently in
    const coords = this.worldToChunkCoords(
      player.position.x,
      0,
      player.position.z
    );

    const visibleChunks = [];
    for (
      let x = coords.chunk.x - this.drawDistance;
      x <= coords.chunk.x + this.drawDistance;
      x++
    ) {
      for (
        let z = coords.chunk.z - this.drawDistance;
        z <= coords.chunk.z + this.drawDistance;
        z++
      ) {
        visibleChunks.push({ x, z });
      }
    }

    return visibleChunks;
  }

  /**
   * Returns an array containing the coordinates of the chunks that
   * are not yet loaded and need to be added to the scene
   * @param {{ x: number, z: number}[]} visibleChunks
   * @returns {{ x: number, z: number}[]}
   */
  getChunksToAdd(visibleChunks) {
    // Filter down visible chunks, removing ones that already exist
    return visibleChunks.filter((chunkToAdd) => {
      const chunkExists = this.children
        .map((obj) => obj.userData)
        .find(({ x, z }) => {
          return chunkToAdd.x === x && chunkToAdd.z === z;
        });

      return !chunkExists;
    });
  }

  /**
   * Removes current loaded chunks that are no longer visible to the player
   * @param {{ x: number, z: number}[]} visibleChunks
   */
  removeUnusedChunks(visibleChunks) {
    // Filter current chunks, getting ones that don't exist in visible chunks
    const chunksToRemove = this.children.filter((obj) => {
      const { x, z } = obj.userData;
      const chunkExists = visibleChunks.find((visibleChunk) => {
        return visibleChunk.x === x && visibleChunk.z === z;
      });

      return !chunkExists;
    });

    for (const chunk of chunksToRemove) {
      chunk.disposeChildren();
      this.remove(chunk);
      //console.log(`Removed chunk at X: ${chunk.userData.x} Z: ${chunk.userData.z}`);
    }
  }

  /**
   * Generates the chunk at the (x,z) coordinates
   * @param {number} x
   * @param {number} z
   */
  generateChunk(x, z) {
    const chunk = new WorldChunk(this.chunkSize, this.params);
    chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
    chunk.userData = { x, z };

    if (this.asyncLoading) {
      requestIdleCallback(chunk.generate.bind(chunk), { timeout: 1000 });
    } else {
      chunk.generate();
    }

    this.add(chunk);
    //console.log(`Creating chunk at X: ${x} Z: ${z}`);
  }

  /**
   * Gets the block data at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {{id: number, instanceId: number} | null}
   */
  getBlock(x, y, z) {
    const coords = this.worldToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk && chunk.loaded) {
      return chunk.getBlock(coords.block.x, y, coords.block.z);
    } else {
      return null;
    }
  }

  /**
   * Returns the chunk and world coordinates of the block at (x,y,z)\
   *  - `chunk` is the coordinates of the chunk containing the block
   *  - `block` is the world coordinates of the block
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {{
   *  chunk: { x: number, z: number},
   *  block: { x: number, y: number, z: number}
   * }}
   */
  worldToChunkCoords(x, y, z) {
    const chunkCoords = {
      x: Math.floor(x / this.chunkSize.width),
      z: Math.floor(z / this.chunkSize.width),
    };

    const blockCoords = {
      x: x - this.chunkSize.width * chunkCoords.x,
      y,
      z: z - this.chunkSize.width * chunkCoords.z,
    };

    return {
      chunk: chunkCoords,
      block: blockCoords,
    };
  }

  /**
   * Returns the WorldChunk object the contains the specified coordinates
   * @param {number} chunkX
   * @param {number} chunkZ
   * @returns {WorldChunk | null}
   */
  getChunk(chunkX, chunkZ) {
    return this.children.find((chunk) => {
      return chunk.userData.x === chunkX && chunk.userData.z === chunkZ;
    });
  }
}
