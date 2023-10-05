import { CST } from "../CST.js";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        this.ship;
        this.scene = scene;
        this.timeSinceShot = 4;
        this.gunDelay = 4;
    }

    spawn(x, y, ship, laserGroupRed) {
        this.ship = ship;
        //this.laserGroup = laserGroupRed;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
    }
    
    preUpdate() {
        this.timeSinceShot -= 0.016;
        const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
        this.angle = Phaser.Math.RadToDeg(angleToShip);
        if (this.timeSinceShot <= 0) {
            this.shootLaser(angleToShip)
            this.timeSinceShot = this.gunDelay;
        }
    }
    shootLaser(angleToShip) {
        this.scene.laserGroupRed.fireLaser(this.x, this.y, angleToShip);
    }
    
}

class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Enemy,
            frameQuantity: 5,
            active: false,
            visible: false,
            key: 'enemy'
        })

        this.ship = scene.ship
        this.laserGroupRed = scene.laserGroupRed
    }

    spawnEnemy(x, y) {
        const enemy = this.getFirstDead(false);
        if (enemy) {
            enemy.spawn(x, y, this.ship, this.laserGroupRed)
        }
    }
}

// Laser physics classes by CodeCaptain https://www.youtube.com/watch?v=9wvlAzKseCo&t=510s
class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, laserColour) {
        super(scene, x, y, laserColour);
        this.postFX.addBloom(0xffffff, 1.5, 1.5, 2, 2);
        this.laserSpeed = 900;
    }

    fire(x, y, alpha) {
        this.body.reset(x,y);

        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);

        this.setVelocity(this.laserSpeed * Math.cos(alpha), this.laserSpeed * Math.sin(alpha))
        this.angle = Phaser.Math.RadToDeg(alpha);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.x >= 1000) { //|| this.x >= 1000 || this.x >= 1000 || this.x >= 1000) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class LaserGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, zapGunSound, laserColour) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Laser,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: laserColour
        })
        this.zapGunSound = zapGunSound;
    }

    fireLaser(x, y, alpha) {
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y, alpha)
            this.zapGunSound.play();
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
        this.enemyGroup;
        this.laserGroupRed;
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
        this.load.image("ship", "../../assets/images/star fighter ship blue.png");
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/star fighter ship red.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
    }
    create() {
        this.zapGun1 = this.sound.add("zap_gun_1", {volume: 1})
        this.laserGroupBlue = new LaserGroup(this, this.zapGun1, 'laser');
        this.addShip();
        this.enemyGroup = new EnemyGroup(this)
        this.laserGroupRed = new LaserGroup(this, this.zapGun1, 'laserRed');

        this.physics.world.setBounds(this.game.renderer.width*(0.1), this.game.renderer.height*(0.05), this.game.renderer.width*0.6, this.game.renderer.height*0.9, true, true, true, true);

        this.sound.volume = 0.05;
        this.background = this.add.tileSprite(0,0, this.game.renderer.width, this.game.renderer.height, "star_background").setOrigin(0).setDepth(-1);
        this.background.preFX.addBarrel(0.5);

        this.physics.add.existing(this.ship, 0);
        this.ship.body.collideWorldBounds = true;
        
        //game.physics.enable([this.ship, this.boundary], Phaser.Physics.ARCADE);

        let menuButton = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text").setDepth(1);
        let menuButtonHover = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text_hover").setDepth(1).setVisible(0);

        //this.gunReadyText = this.add.text(this.game.renderer.width / 50, this.game.renderer.height * 0.90, 'GUN READY', { fontFamily: 'Cambria math' }).setFontSize(18);
        //this.gunReadyTimeText = this.add.text(this.game.renderer.width / 40, this.game.renderer.height * 0.95, '', { fontFamily: 'Cambria math' }).setFontSize(18);

        let dropLoop = this.scene.get("MENU").data.get("dropLoop");

        
        //this.laser = this.add.image(this.game.renderer.width / 10, this.game.renderer.height * 0.6, "laser").setDepth(1);

        menuButton.setInteractive();

        menuButton.on("pointerover", () => {
            menuButtonHover.setVisible(1);
        });
        menuButton.on("pointerout", () => {
            menuButtonHover.setVisible(0);
        });
        menuButton.on("pointerup", () => {
            dropLoop.stop();
            this.scene.start(CST.SCENES.MENU, "Hello to Menu scene from play!");
        });

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.addEvents();
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
            if (this.keyShift.isDown) {
                this.spawnEnemy();
                this.timeTillGunReady = this.shootDelay;
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
        this.input.on('pointermove', pointer => {
            const angleToMouse = Phaser.Math.Angle.BetweenPoints(pointer, this.ship);
            this.ship.angle = Phaser.Math.RadToDeg(angleToMouse) + 180;
        })
    }

    shootLaser() {
        this.laserGroupBlue.fireLaser(this.ship.x, this.ship.y, Phaser.Math.DegToRad(this.ship.angle));
    }

    spawnEnemy() {
        this.enemyGroup.spawnEnemy(this.ship.x, this.ship.y);
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
