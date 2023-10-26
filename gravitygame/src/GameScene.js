
import Phaser from "phaser";

class Asteroid extends Phaser.GameObjects.Sprite {
    constructor(scene) {

        let y = Math.random() * scene.game.canvas.height / -3;
        let x = Math.random() * scene.game.canvas.width; //TBD Fix this


        super(scene, x, y, 'asteroid_sprite')
        scene.add.existing(this);

        scene.physics.world.enableBody(this);
        this.setScale(0.5);
        this.body.velocity.y = 50 + 90 * Math.random();
        this.body.velocity.x = 5 * Math.random();
        this.body.bounce.set(1);
        this.body.setBounce(1.0, 0.9);
        this.body.allowRotation = true;
        this.gameWidth = scene.game.canvas.width;
        this.gameHeight = scene.game.canvas.height;

        scene.events.on('update', (time, delta) => { this.update(time, delta) });
        scene.events.on('create', () => this.create());
        console.log(this);

        this.anims.play('spin', true);
    }
    preload() {

    }

    create() {
        console.log("create");


    }

    update() {


        if (this.y > this.gameHeight || this.y < this.gameHeight / -3) {
            this.destroy();
        }

        if (this.x > this.gameWidth * 1.1 || this.x < this.gameWidth * -1.1) {
            this.destroy();
        }

    }

    explode() {

    }
}

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('game-scene');

        this.lifes = 3;
    }

    preload() {
        this.canvas = this.sys.game.canvas;
        this.load.image('space', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('asteroid', 'assets/asteroid.png');
        this.load.spritesheet('asteroid_sprite',
            'assets/asteroid_sprite.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet('player_sprite',
            'assets/player_sprite.png',
            { frameWidth: 96 * 2, frameHeight: 87 * 2 }
        );
    }

    create() {
        this.bg = this.add.tileSprite(300, 700, 2024, 2024, 'space');
        // this.bg.setOrigin(0.5, 0.90);
        this.ship = this.physics.add.sprite(300, 700, 'player_sprite');
        this.ship.setScale(0.5);
        this.ship.setImmovable(true);
        this.ship.setCollideWorldBounds(true);

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('asteroid_sprite', { start: 0, end: 31 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 3, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player_sprite', { start: 6, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.asteroids = this.add.group();
        for (let i = 0; i < 10; i++) {
            this.asteroids.add(new Asteroid(this));
            // this.asteroids.add(this.physics.add.sprite(Math.random() * this.canvas.width, 0, 'asteroid'));
        }
    }

    // moveAsteroid(asteroid) {
    //     asteroid.y += 3;

    //     if (asteroid.y > this.canvas.height) {
    //         asteroid.y = 0;
    //         asteroid.x = Math.random() * this.canvas.width;
    //     }
    // }

    update() {
        // this.moveAsteroid(this.asteroid);

        if (this.asteroids.getLength() < 10) {
            for (let i = this.asteroids.getLength(); i < 10; i++) {
                this.asteroids.add(new Asteroid(this));
                console.log('added');
            }
        }

        const VELOCITY_SHIFT = 200;
        const VELOCITY_ANGLE = 0.01;
        this.bg.tilePositionY -= 1;


        if (this.cursorKeys.right.isUp && this.cursorKeys.left.isUp) {
            if (Math.abs(this.bg.rotation) > VELOCITY_ANGLE)
                this.bg.rotation = (this.bg.rotation / 2);
        }




        if (this.cursorKeys.left.isDown) {
            this.ship.setVelocityX(-VELOCITY_SHIFT);
            this.bg.rotation += VELOCITY_ANGLE;
            this.asteroids.rotation -= 10 * VELOCITY_ANGLE;
            this.ship.anims.play('left', true)
        }



        if (this.cursorKeys.right.isDown) {
            this.ship.setVelocityX(VELOCITY_SHIFT);
            this.bg.rotation -= VELOCITY_ANGLE;
            this.asteroids.rotation += 10 * VELOCITY_ANGLE;
            this.ship.anims.play('right', true)
        }

        if (this.cursorKeys.left.isUp && this.cursorKeys.right.isUp) {
            this.ship.setVelocityX(0);
            this.ship.anims.play('idle', true)
        }

        this.physics.collide(this.ship, this.asteroids, (ship, asteroid) => {
            console.log('hit', this.lifes);
            this.lifes--;
            // if (this.lifes <= 0) {
            //     this.scene.start('game-over-scene');
            // }
            // this.ship.destroy();
            // asteroid.destroy();
            // this.scene.start('game-scene');
        });
        this.physics.collide(this.asteroids);
    }
}