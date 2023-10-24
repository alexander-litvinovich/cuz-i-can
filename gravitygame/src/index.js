import Phaser from 'phaser';
import GameScene from './GameScene';

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    scene: [GameScene],
    physics: {
        default: "arcade"
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



