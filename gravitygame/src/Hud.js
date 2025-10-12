const GRID_UNIT = 24;

export default class Hud extends Phaser.Scene {

    constructor() {
        super({ key: 'Hud', active: true });
    }

    preload() {
        this.load.svg("life_0", 'assets/life_sprite_0.svg');
        this.load.svg("life_1", 'assets/life_sprite_1.svg');
        this.load.svg("throttle_icon", 'assets/throttle_icon.svg');
    }

    create() {
        //  Grab a reference to the Game Scene
        const game = this.scene.get('GameScene');
        console.log("Hud", game);


        //  Listen for events from it
        game.events.on('score', this.updateScore(game), this);
        game.events.on('life', this.updateLifes(game), this);
        game.events.on('throttle', this.updateThrottle(game), this);
        game.events.on('message', this.showMessage, this);

        this.createLeftHUD(game);
        this.createRightHUD(game.lifes);
    }

    showMessage(message = "Level Up",) {
        const DELAY_BEFORE_HIDE = 500; // ms
        // return () => {
        const posX = this.game.config.width / 2;
        const posY = this.game.config.height / 2;

        let messageScale = 1;

        let messageTextSh = this.add.text(posX + 2, posY + 4, message, {
            fontFamily: "'Permanent Marker', cursive",
            fontSize: '48px',
            fontWeight: '600',
            fill: '#B64C4C',
            textAlign: 'center'
        }).setOrigin(0.5, 0);

        let messageText = this.add.text(posX, posY, message, {
            fontFamily: "'Permanent Marker', cursive",
            fontSize: '48px',
            fontWeight: '600',
            fill: '#FAD749',
            textAlign: 'center'
        }).setOrigin(0.5, 0);


        window.setTimeout(() => {
            const messageInterval = window.setInterval(() => {
                messageText.y -= 5;
                messageText.setScale(messageScale);
                messageText.setAlpha(messageScale);

                messageTextSh.y -= 5;
                messageTextSh.setScale(messageScale);
                messageTextSh.setAlpha(messageScale);

                if (messageScale >= 0) {
                    messageScale -= 0.05;
                } else {
                    window.clearInterval(messageInterval);
                    messageText.destroy();
                    messageText = null;

                    messageTextSh.destroy();
                    messageTextSh = null;
                }
            }, 20);
        }, DELAY_BEFORE_HIDE);
        // };
    }

    updateScore(game) {
        return () => {
            const nextLevelBarSize = (game.scores - game.scoresCurrentLevel) * GRID_UNIT * 4 / (game.scoresNextLevel - game.scoresCurrentLevel);

            this.nextLevelBar.width = nextLevelBarSize;
            this.scoreIndicator.setText(game.scores);
        };
    }

    updateLifes(game) {
        return () => {
            let lifes = game.lifes;
            // this.lifesIndicator.setText(game.lifes);
            this.lifeIndicator.forEach(life => {
                if (lifes > 0) {
                    life.setTexture('life_1');
                    lifes--;
                } else {
                    life.setTexture('life_0');
                }
            })

            if (lifes > 0) {
                this.additionalLifes.setText(`${lifes}+`);
            } else {
                this.additionalLifes.setText('');
            }
        };
    }

    updateThrottle(game) {
        return () => {

            const throttleBarSize = game.throttle * GRID_UNIT * 4 / game.throttleMax;

            this.throttleBar.width = throttleBarSize;
        }
    }

    createLeftHUD(game) {
        const posX = 10;
        const posY = 10;

        this.scoreIndicator = this.add.text(posX, posY + GRID_UNIT / 2, '0', {
            fontFamily: '\'Inter\', sans-serif',
            fontSize: '20px',
            fontWeight: '600',
            fill: '#FAD749',
            textAlign: 'left'
        }).setOrigin(0, 0.5);

        this.nextLevelBg = this.add.rectangle(posX, posY + 1.5 * GRID_UNIT, GRID_UNIT * 4, 8, 0, 128).setOrigin(0, 0.5).setStrokeStyle(2, 0xFAD749);
        this.nextLevelBar = this.add.rectangle(posX, posY + 1.5 * GRID_UNIT, 50, 8, 0xFAD749).setOrigin(0, 0.5);//.setStrokeStyle(2, 0x000000);
    }

    createRightHUD() {
        const posX = this.game.config.width - 150;
        const posY = 10;

        this.lifeIndicator = [
            this.add.image(posX + 4 * GRID_UNIT, posY, 'life_1').setOrigin(0, 0),
            this.add.image(posX + 3 * GRID_UNIT, posY, 'life_1').setOrigin(0, 0),
            this.add.image(posX + 2 * GRID_UNIT, posY, 'life_1').setOrigin(0, 0),
            this.add.image(posX + GRID_UNIT, posY, 'life_0').setOrigin(0, 0),
            this.add.image(posX + 0, posY, 'life_0').setOrigin(0, 0),
        ];
        this.additionalLifes = this.add.text(posX, posY + GRID_UNIT / 2, '99+', {
            fontFamily: '\'Inter\', sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            fill: '#FAD749',
            textAlign: 'right'
        }).setOrigin(1, 0.5);


        const throttleIcon = this.add.image(posX, posY + 1.5 * GRID_UNIT, 'throttle_icon').setOrigin(0, 0.5);
        const throttleBg = this.add.rectangle(posX + GRID_UNIT, posY + 1.5 * GRID_UNIT, GRID_UNIT * 4, 8, 0, 128).setOrigin(0, 0.5).setStrokeStyle(2, 0xFAD749);
        this.throttleBar = this.add.rectangle(posX + GRID_UNIT, posY + 1.5 * GRID_UNIT, 50, 8, 0xFAD749).setOrigin(0, 0.5);//.setStrokeStyle(2, 0x000000);
    }
}