import Phaser from "phaser";

const NAME = "ship";
const VELOCITY_SHIFT = 200;

export default class Player extends Phaser.GameObjects.Sprite {
    static objectName = NAME;

    constructor(scene) {
        super(scene, 0, 0, NAME);
        scene.add.existing(this);
        scene.physics.world.enableBody(this);
        scene.events.on('update', this.update, this);
        this.create();
    }

    static preload(scene) {
        console.log("Player preload");
        scene.load.spritesheet(NAME,
            'assets/player_sprite.png',
            { frameWidth: 96 * 2, frameHeight: 87 * 2 }
        );
    }

    create() {
        console.log("Player created");
        console.log(this);
        window.player = this;
        this.x = 300;
        this.y = 700;

        this.isBreakOn = false;

        this.setScale(0.5);

        this.body.setImmovable(true);
        this.body.setCollideWorldBounds(true);
        // this.body.setSize(58 * 2, 60 * 2);
        // this.body.setOffset(38, 0)
        this.body.setSize(50 * 2, 60 * 2);
        this.body.setOffset(38 + 8, 0)


        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers(NAME, { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(NAME, { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(NAME, { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'throttle',
            frames: this.anims.generateFrameNumbers(NAME, { start: 9, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'throttleLeft',
            frames: this.anims.generateFrameNumbers(NAME, { start: 12, end: 14 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'throttleRight',
            frames: this.anims.generateFrameNumbers(NAME, { start: 15, end: 17 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'break',
            frames: this.anims.generateFrameNumbers(NAME, { start: 18, end: 20 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'breakLeft',
            frames: this.anims.generateFrameNumbers(NAME, { start: 21, end: 23 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'breakRight',
            frames: this.anims.generateFrameNumbers(NAME, { start: 24, end: 26 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.play('idle', true);
    }

    shrinkBody(isShrinked) {
        if (isShrinked) {
            this.body.setSize(50 * 2, 60 * 2);
            this.body.setOffset(46, 0)
        } else {
            this.body.setSize(58 * 2, 60 * 2);
            this.body.setOffset(38, 0)
        }
    }

    steer(direction) {
        if (direction === 'left') {
            this.body.setVelocityX(1.3 * -VELOCITY_SHIFT);

            if (this.scene.cursorKeys.down.isDown)
                this.anims.play('breakLeft', true);
            else if (this.scene.isThrottleOn && !this.scene.isThrottleEmpty)
                this.anims.play('throttleLeft', true)
            else
                this.anims.play('left', true);
        }

        if (direction === 'right') {
            this.body.setVelocityX(1.3 * VELOCITY_SHIFT);

            if (this.scene.cursorKeys.down.isDown)
                this.anims.play('breakRight', true);
            else if (this.scene.isThrottleOn && !this.scene.isThrottleEmpty)
                this.anims.play('throttleRight', true)
            else
                this.anims.play('right', true);
        }

        if (direction === 'hold') {
            this.anims.play('idle', true);
            this.body.setVelocityX(0);
        }
    }

    idle() {
        this.anims.play('idle', true);
        this.body.setVelocityX(0);

        if (this.y < 700) {
            this.body.setVelocityY(VELOCITY_SHIFT / 3);
        } else {
            this.body.setVelocityY(0);
        }
    }

    break(isOn) {
        if (!this.scene.isThrottleOn) {
            this.isBreakOn = isOn;

            if (isOn) {
                if (this.y < 700) {
                    this.body.setVelocityY(VELOCITY_SHIFT);
                } else {
                    this.body.setVelocityY(0);
                }
                this.anims.play('break', true);
            } else {
                this.anims.play('idle', true);
            }
        }
    }

    throttle(isOn) {
        if (!this.isBreakOn) {
            if (isOn) {
                this.scene.startThrottle();
                this.scene.stopThrottleRecovery();

                if (this.scene.isThrottleOn && !this.scene.isThrottleEmpty) {
                    this.shrinkBody(true);
                    this.body.setVelocityY(-VELOCITY_SHIFT);
                    this.anims.play('throttle', true)
                } else {
                    console.log("Throttle out");
                    this.shrinkBody(false);
                    this.body.setVelocityY(VELOCITY_SHIFT / 3);
                    this.anims.play('idle', true)
                }
            } else {
                this.shrinkBody(false);
                this.scene.stopThrottle();
                this.scene.startThrottleRecovery();
            }
        }
    }

    update() {

        if (this.scene.cursorKeys.up.isDown) this.throttle(true);
        if (this.scene.cursorKeys.up.isUp) this.throttle(false);

        if (this.scene.cursorKeys.down.isDown) this.break(true);
        if (this.scene.cursorKeys.down.isUp) this.break(false);

        if (this.scene.cursorKeys.left.isDown) this.steer('left');
        if (this.scene.cursorKeys.right.isDown) this.steer('right');

        if (this.scene.cursorKeys.left.isUp &&
            this.scene.cursorKeys.right.isUp) this.steer('hold');

        if (this.scene.cursorKeys.left.isUp &&
            this.scene.cursorKeys.right.isUp &&
            this.scene.cursorKeys.up.isUp &&
            this.scene.cursorKeys.down.isUp)
            this.idle();
    }

    destroyOnNextFrame() {
        this.scene.events.off('update', this.update, this);
        requestAnimationFrame(() => this.destroy());
    }
}