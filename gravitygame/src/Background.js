import Phaser from "phaser";

const NAME = "bg";
const VELOCITY_ANGLE = 0.001;


export default class Background extends Phaser.GameObjects.TileSprite {
    static objectName = NAME;

    constructor(scene) {
        super(scene, 0, 0, 0, 0, NAME);
        scene.add.existing(this);
        scene.events.on('update', this.update, this);
        this.create();
    }

    static preload(scene) {
        scene.load.image(NAME, 'assets/background.png');
    }

    create() {
        this.setPosition(300, 700);
        this.setSize(2024, 2024);
        console.log("BG created");
        console.log(this);
        window.bg = this;
    }

    update() {
        this.tilePositionY -= 1;


        if (this.scene.cursorKeys.right.isUp && this.scene.cursorKeys.left.isUp) {
            if (Math.abs(this.rotation) > VELOCITY_ANGLE)
                this.rotation = (this.rotation / 1.01);
        }

        if (this.scene.cursorKeys.left.isDown) {
            this.rotation += VELOCITY_ANGLE;
        }

        if (this.scene.cursorKeys.right.isDown) {
            this.rotation -= VELOCITY_ANGLE;
        }
    }

    destroyOnNextFrame() {
        this.scene.events.off('update', this.update, this);
        requestAnimationFrame(() => this.destroy());
    }
}