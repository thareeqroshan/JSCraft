import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { blocks, resources } from "./blocks";
import { Physics } from "./physics";

export function createUI(scene, world, player, physics) {
  const gui = new GUI();

  const sceneFolder = gui.addFolder("Scene");
  sceneFolder.add(scene.fog, "near", 1, 200, 1).name("Fog Near");
  sceneFolder.add(scene.fog, "far", 1, 200, 1).name("Fog Far");

  const playerFolder = gui.addFolder("Player");
  playerFolder.add(player, "maxSpeed", 1, 20).name("Max Speed");
  playerFolder.add(player, "jumpSpeed", 1, 50, 0.1).name("Jump Speed");
  playerFolder.add(player.boundsHelper, "visible").name("Debug Player Bounds");
  playerFolder.add(player.cameraHelper, "visible").name("Debug Player Camera");

  const physicsFolder = gui.addFolder("Physics");
  physicsFolder.add(physics.helpers, "visible").name("Debug Physics");

  const worldFolder = gui.addFolder("World");
  worldFolder.add(world, "drawDistance", 0, 5, 1).name("Draw Distance");

  const terrainFolder = gui.addFolder("Terrain");
  terrainFolder.add(world.chunkSize, "width", 1, 150, 1).name("Width");
  terrainFolder.add(world.chunkSize, "height", 8, 128, 1).name("Height");
  terrainFolder.add(world.params, "seed", 0, 10000, 1).name("Seed");
  terrainFolder.add(world.params.terrain, "scale", 10, 100).name("Scale");
  terrainFolder.add(world.params.terrain, "magnitude", 0, 1).name("Magnitude");
  terrainFolder.add(world.params.terrain, "offset", 0, 1).name("Offset");
  // terrainFolder.close();

  const resourcesFolder = gui.addFolder("Resources");
  resources.forEach((resource) => {
    const resourceFolder = resourcesFolder.addFolder(resource.name);
    resourceFolder.add(resource, "scarcity", 0, 1).name("Scarcity");

    const scaleFolder = resourceFolder.addFolder("Scale");
    scaleFolder.add(resource.scale, "x", 10, 100).name("X Scale");
    scaleFolder.add(resource.scale, "y", 10, 100).name("Y Scale");
    scaleFolder.add(resource.scale, "z", 10, 100).name("Z Scale");
    resourceFolder.close();
  });

  gui.onChange(() => {
    world.generate();
  });
}
