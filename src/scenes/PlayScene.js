import { CST } from "../CST.js";

// Laser physics classes by CodeCaptain https://www.youtube.com/watch?v=9wvlAzKseCo&t=510s
class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'laser');
        this.postFX.addBloom(0xffffff, 1.5, 1.5, 2, 2);
    }

    fire(x, y) {
        this.body.reset(x,y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocity(900, 0)
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.x >= 1000) {
            //console.log("Laser reset!");
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class LaserGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Laser,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: 'laser'
        })
    }

    fireLaser(x, y) {
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y)
        }
    }
}

export class PlayScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.PLAY
        })

        this.ship;
        this.laserGroup;
    }

    init(data) {
        console.log(data);
        console.log("Play scene init!");
        this.backgroundSpeed = 3;
        this.shootDelay = 0.5;
        this.timeTillGunReady = 2;
        this.shipMoveSpeed = 3;
    }
    preload() {
        this.load.image("ship", "../../assets/images/star fighter ship 1.png");
        this.load.image('laser', "../../assets/images/star fighter laser.png");
    }
    create() {
        this.laserGroup = new LaserGroup(this);
        this.addShip();
        this.physics.world.setBounds(this.game.renderer.width*(0.1), this.game.renderer.height*(0.05), this.game.renderer.width*0.6, this.game.renderer.height*0.9, true, true, true, true);

        this.sound.volume = 0.05;
        this.background = this.add.tileSprite(0,0, this.game.renderer.width, this.game.renderer.height, "star_background").setOrigin(0).setDepth(-1);
        //this.background.setScale(2,2);
        
        //this.background.setOrigin(0, 0.5);
        this.background.preFX.addBarrel(0.5);
        //this.background.x = -this.game.renderer.width* 0.25;
        //this.background.y = this.game.renderer.height / 2;

        this.physics.add.existing(this.ship, 0);
        this.ship.body.collideWorldBounds = true;
        
        
        //game.physics.enable([this.ship, this.boundary], Phaser.Physics.ARCADE);

        let menuButton = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text").setDepth(1);
        let menuButtonHover = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text_hover").setDepth(1).setVisible(0);

        //this.gunReadyText = this.add.text(this.game.renderer.width / 50, this.game.renderer.height * 0.90, 'GUN READY', { fontFamily: 'Cambria math' }).setFontSize(18);
        //this.gunReadyTimeText = this.add.text(this.game.renderer.width / 40, this.game.renderer.height * 0.95, '', { fontFamily: 'Cambria math' }).setFontSize(18);

        let dropLoop = this.scene.get("MENU").data.get("dropLoop");

        this.zapGun1 = this.sound.add("zap_gun_1", {volume: 1})
        //this.laser = this.add.image(this.game.renderer.width / 10, this.game.renderer.height * 0.6, "laser").setDepth(1);

        menuButton.setInteractive();

        menuButton.on("pointerover", () => {
            console.log("hovering");
            menuButtonHover.setVisible(1);
        });

        menuButton.on("pointerout", () => {
            console.log("off da buttton");
            menuButtonHover.setVisible(0);
        });

        menuButton.on("pointerup", () => {
            console.log("back to menu pressed");
            dropLoop.stop();
            this.scene.start(CST.SCENES.MENU, "Hello to Menu scene from play!");
        });

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        //this.addEvents();
    }

    update() {
        this.moveBackground(this.background, this.backgroundSpeed)

        //this.gunReadyTimeText.setText(`${Phaser.Math.RoundTo(this.timeTillGunReady, 0)} s`)

        if (this.timeTillGunReady <= 0) {
            //this.gunReadyText.setVisible(1);
            if (this.keySpace.isDown) {
                this.zapGun1.play();
                this.timeTillGunReady = this.shootDelay;
                this.shootLaser();
            }
        } else {
            this.timeTillGunReady -= 0.016;
            //this.gunReadyText.setVisible(0);
        }
        
        if (this.keyW.isDown) {
            this.moveShipY(this.ship, -this.shipMoveSpeed)
        }
        if (this.keyS.isDown) {
            this.moveShipY(this.ship, this.shipMoveSpeed)
        }
        if (this.keyA.isDown) {
            this.moveShipX(this.ship, -this.shipMoveSpeed)
        }
        if (this.keyD.isDown) {
            this.moveShipX(this.ship, this.shipMoveSpeed)
        }
        
    }

    moveBackground(background, speed) {
        background.tilePositionX += speed;
    }

    addEvents() {

    }

    shootLaser() {
        this.laserGroup.fireLaser(this.ship.x+20, this.ship.y);
    }

    addShip() {
        const leftX = this.game.renderer.width / 6;
        const centerY = this.game.renderer.height / 2;

        this.ship = this.add.image(leftX, centerY, "ship").setDepth(1);
    }

    moveShipY(ship, shipMoveSpeed) {
        ship.y += shipMoveSpeed;
    }
    moveShipX(ship, shipMoveSpeed) {
        ship.x += shipMoveSpeed;
    }
}
