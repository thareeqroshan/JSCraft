# JSCraft

JSCraft is a voxel-based sandbox game inspired by Minecraft, built using modern web technologies. It features a procedurally generated, infinite world that you can explore and interact with. This project is written in JavaScript and utilizes the `three.js` library for 3D rendering.

## Getting Started

To run JSCraft on your local machine, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd jscraft
    ```
2.  **Install dependencies:**
    Make sure you have Node.js and npm installed. Then, run the following command to install the project's dependencies:
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start a local development server. You can now open your web browser and navigate to the provided URL (usually `http://localhost:5173`) to play the game.

## Systems Overview

JSCraft is built upon a modular architecture, with each file in the `scripts/` directory responsible for a specific part of the game's functionality.

### `main.js`
This is the main entry point of the application. It sets up the `three.js` renderer, camera, and scene. It also initializes the game world, player, and physics engine, and contains the main render loop that updates and renders the game on each frame.

### `world.js`
The `world.js` module is responsible for managing the game world, which is composed of individual chunks. It dynamically loads and unloads chunks based on the player's position to create the illusion of an infinite world while conserving resources. Key features include:
-   **Chunk Management:** Keeps track of which chunks are currently visible and should be rendered.
-   **Dynamic Loading:** Asynchronously loads new chunks as the player moves into new areas.
-   **Draw Distance:** Allows configuring the number of chunks rendered around the player.

### `worldChunk.js`
A "chunk" is a segment of the world of a fixed size. `worldChunk.js` handles the generation of the terrain and resources within a single chunk.
-   **Procedural Generation:** Uses Simplex noise to generate natural-looking terrain.
-   **Resource Spawning:** Populates the world with resources like stone, coal, and iron ore based on noise patterns.
-   **Mesh Generation:** Creates optimized instanced meshes for the blocks in the chunk, significantly improving rendering performance by only rendering visible faces.

### `blocks.js`
This file defines all the different types of blocks available in the game, such as grass, dirt, stone, and various ores. Each block has properties like its ID, name, and material (including textures).

### `player.js`
The `player.js` module implements the player's behavior and controls.
-   **First-Person Controls:** Uses `PointerLockControls` to provide a standard first-person shooter control scheme.
-   **Movement:** Handles player input for movement (walking and jumping).
-   **Camera:** Manages the player's camera and perspective.

### `physics.js`
The physics engine is implemented in `physics.js`. It handles gravity and collision detection to make player movement realistic.
-   **Gravity:** Applies a constant downward force to the player.
-   **Collision Detection:**
    -   **Broad Phase:** Quickly identifies all potential blocks the player might be colliding with.
    -   **Narrow Phase:** Performs precise collision checks against the candidate blocks.
-   **Collision Resolution:** Adjusts the player's position and velocity to prevent them from passing through solid blocks.

### `rng.js`
This is a simple linear congruential random number generator (RNG). It's used to create deterministic "randomness" based on a seed, which is essential for ensuring that the world generates consistently every time the same seed is used.

### `ui.js`
`ui.js` creates the in-game debug user interface using the `lil-gui` library. This UI allows for real-time tweaking of various game parameters, such as terrain generation settings, player speed, and physics properties, which is invaluable for development and debugging.

## Roadmap

JSCraft is an ongoing project with many opportunities for future development. Here are some ideas for potential features:

-   **Block Breaking and Placing:** Implement the ability for players to break and place blocks to modify the world.
-   **Inventory System:** Add an inventory system for players to collect and store items.
-   **Crafting:** Introduce a crafting system that allows players to create new items and tools from the resources they've gathered.
-   **More Biomes:** Add different biomes to the world generation, such as deserts, forests, and oceans.
-   **Multiplayer:** Integrate networking to allow multiple players to join and interact in the same world.
-   **Saving and Loading:** Implement a system to save the state of the world and player, so progress isn't lost between sessions.
-   **Sound Effects:** Add sound effects for actions like walking, jumping, and breaking blocks.
-   **Mobile Support:** Improve controls and performance for mobile devices.
-   **Day/Night Cycle:** Add a day/night cycle with changing light levels.