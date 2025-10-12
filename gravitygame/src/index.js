import Phaser from 'phaser';
import GameScene from './GameScene';
import Hud from './Hud';

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    scene: [GameScene, Hud],
    physics: {
        default: "arcade",
        debug: true,
        debugShowBody: true,
        debugBodyColor: 0x0000ff
    }
};

const game = new Phaser.Game(config);




class InputHandler {
    constructor() {
        console.log("input");
        this.keys = new Set();

        window.addEventListener("keydown", (e) => {
            if (e.repeat) { return }
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") this.keys.add(e.key);
            console.log(e.key, this.keys);
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") this.keys.delete(e.key);
            console.log(e.key, this.keys);
        });
    }
}



