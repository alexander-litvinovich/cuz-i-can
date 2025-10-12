
import Phaser from "phaser";
import Asteroid from "./Asteroid";
import Player from "./Player";
import Background from "./Background";

const STAGES = [
    20, 500, 1000, 2500, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000
]

export default class GameScene extends Phaser.Scene {
    constructor() {
        // super('game-scene');

        super({
            key: 'GameScene',
            physics: {
                arcade: {
                    debug: false,

                },
                matter: {
                    debug: true,

                    debugShowBody: true,
                    debugBodyColor: 0x0000ff
                }
            }
        });

        this.level = 0;
        this.lifes = 3;
        this.scores = 0
        this.scoresCurrentLevel = 0;
        this.scoresNextLevel = STAGES[this.level];
        this.throttle = 1500; // ms
        this.throttleMax = 3000; // ms
        this.isThrottleOn = false;
        this.isThrottleEmpty = false;

        this.asteroidsAmount = 15;
    }

    preload() {
        Asteroid.preload(this);
        Player.preload(this);
        Background.preload(this);
    }

    create() {
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.bg = new Background(this);
        this.ship = new Player(this);

        this.invincibile = false;
        this.asteroids = this.add.group();
        for (let i = 0; i < this.asteroidsAmount; i++) {
            this.asteroids.add(new Asteroid(this));

        }

        this.startScore();
        this.startThrottleRecovery();
        this.events.emit('message', `< Get ready! >`);
    }

    startScore() {
        this.scoreInterval = setInterval(this.scoreCounter(this), 100);
    }

    scoreCounter(scene) {
        return () => {
            scene.scores += 1 * (scene.level + 1) + scene.level * 10;
            if (scene.scores > STAGES[scene.level]) {
                scene.scoresCurrentLevel = STAGES[scene.level] || 0;
                scene.level += 1;
                scene.lifes += 1;
                scene.scoresNextLevel = STAGES[scene.level];
                scene.events.emit('life');
                scene.events.emit('message', `< Level ${scene.level + 1} >`);
            }
            scene.events.emit('score');
        }
    }

    startThrottle() {
        if (!this.throttleTimer) {
            this.throttleTimer = window.setInterval(() => {
                if (this.throttle > 0) {
                    this.throttle -= 10;
                    this.isThrottleOn = true;
                    this.events.emit('throttle');
                }
                else {
                    this.throttle = 0;
                    this.isThrottleEmpty = true;
                    this.stopThrottle();
                }
            }, 10);
        }
    }

    stopThrottle() {
        this.isThrottleOn = false;
        if (!!this.throttleTimer) {
            window.clearInterval(this.throttleTimer);
            this.throttleTimer = null;
        }
    }

    startThrottleRecovery() {
        if (!this.throttleRecoveryTimer) {
            if (this.isThrottleEmpty) window.setTimeout(() => { this.isThrottleEmpty = false }, 1000);

            this.throttleRecoveryTimer = window.setInterval(() => {
                if (this.throttle < this.throttleMax) {
                    this.throttle += 5;
                    this.events.emit('throttle');
                }
                else {
                    this.throttle = this.throttleMax;
                    this.stopThrottleRecovery();
                }
            }, 10);
        }
    }

    stopThrottleRecovery() {
        if (!!this.throttleTimer) {
            window.clearInterval(this.throttleRecoveryTimer);
            this.throttleRecoveryTimer = null;
        }
    }

    update() {
        if (this.asteroids.getLength() < this.asteroidsAmount) {
            for (let i = this.asteroids.getLength(); i < this.asteroidsAmount; i++) {
                this.asteroids.add(new Asteroid(this));
                console.log('added');
            }
        }

        const VELOCITY_ANGLE = 0.01;


        if (this.cursorKeys.left.isDown) {
            this.asteroids.rotation -= 10 * VELOCITY_ANGLE;

        }

        if (this.cursorKeys.right.isDown) {
            this.asteroids.rotation += 10 * VELOCITY_ANGLE;
        }

        this.physics.collide(this.ship, this.asteroids, (ship, asteroid) => {
            console.log('hit', this.lifes);

            if (!this.invincibile) {
                this.lifes--;
                this.invincibile = true;
                this.events.emit('life');

                setTimeout(() => {
                    this.invincibile = false;
                }, 300);
            }

            if (this.lifes <= 0) {
                clearInterval(this.scoreInterval);
                // this.scene.start('game-over-scene');
            }

            // this.ship.destroy();
            // asteroid.destroyOnNextFrame();
            // this.scene.start('game-scene');
        });
        this.physics.collide(this.asteroids);
    }
}