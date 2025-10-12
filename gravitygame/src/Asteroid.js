import Phaser from "phaser";

const NAME = "asteroid_sprite";

export default class Asteroid extends Phaser.GameObjects.Sprite {
    static objectName = NAME;

    constructor(scene) {
        super(scene, 0, 0, NAME);
        scene.add.existing(this);
        scene.physics.world.enableBody(this);
        scene.events.on('update', this.update, this);
        this.create();
    }

    static preload(scene) {
        console.log("Asteroid preload");
        scene.load.spritesheet(NAME,
            'assets/asteroid_sprite.png',
            { frameWidth: 128, frameHeight: 128 }
        );
    }

    create() {

        this.y = Math.random() * this.scene.game.canvas.height / -3;
        this.x = Math.random() * this.scene.game.canvas.width;

        this.setScale(0.5);
        this.body.velocity.y = 100 + 90 * Math.random();
        this.body.velocity.x = 5 * Math.random();
        this.body.bounce.set(1);
        this.body.setBounce(1.0, 0.9);
        this.body.allowRotation = true;
        this.body.setSize(46 * 2, 46 * 2);


        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('asteroid_sprite', { start: 0, end: 31 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.play('spin', true);
        console.log("Asteroid created", this);

    }

    update() {
        if (this.y > this.scene.game.canvas.height || this.y < this.scene.game.canvas.height / -3) {
            this.destroyOnNextFrame();
        }

        if (this.x > this.scene.game.canvas.width * 1.1 || this.x < this.scene.game.canvas.width * -1.1) {
            this.destroyOnNextFrame();
        }
    }

    destroyOnNextFrame() {
        this.scene.events.off('update', this.update, this);
        requestAnimationFrame(() => this.destroy());
    }
}