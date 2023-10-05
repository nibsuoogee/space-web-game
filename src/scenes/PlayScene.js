import { CST } from "../CST.js";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);

        this.ship;
        this.scene = scene;
        this.timeSinceShot = 4;
        this.gunDelay = 4;

        this.fireRate = 250;
        this.lastFired = 0;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 500;
        this.bulletDamage = 10;
    }

    spawn(x, y, ship) {
        this.ship = ship;
        this.health = 10;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
    }
    
    preUpdate() {
        this.timeSinceShot -= 0.016;
        const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
        this.angle = Phaser.Math.RadToDeg(angleToShip) +90;
        if (this.timeSinceShot <= 0) {
            this.shootLaser(angleToShip)
            this.timeSinceShot = this.gunDelay;
        }
        if (this.health <= 0) {
            console.log("enemy dead!");
            this.scene.playerDestruction.play();
            this.setActive(false);
            this.setVisible(false);
            //this.setActive(false);
        }
    }
    shootLaser(angleToShip) {
        const laserSpawnDistance = 100;
        const xOffset = Math.cos(angleToShip) * laserSpawnDistance;
        const yOffset = Math.sin(angleToShip) * laserSpawnDistance;
        this.scene.laserGroupRed.fireLaser(this.x + xOffset, this.y + yOffset, angleToShip);
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
        scene.add.existing(this);
        scene.physics.world.enable(this);
        //this.body.setMass(0);
        this.scene = scene;
        this.ship = scene.ship;
        this.postFX.addBloom(0xffffff, 1.5, 1.5, 2, 2);
        this.laserSpeed = 900;
        this.laserHasHit = false;
        this.enemy;
        
    }

    fire(x, y, alpha) {
        //console.log("Ship health:");
        //console.log(this.ship.health);
        this.laserHasHit = false;
        this.body.reset(x,y);
        //this.body.setMass(0);
        //this.setMass(0);

        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);

        this.setVelocity(this.laserSpeed * Math.cos(alpha), this.laserSpeed * Math.sin(alpha))
        this.angle = Phaser.Math.RadToDeg(alpha);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.laserHasHit) {
            this.scene.physics.world.collide(this, this.ship, this.laserHitsShip, null, this);
            
            this.scene.enemyGroup.children.iterate((enemy) => {
                this.enemy = enemy;
                if (enemy.active) {
                    this.scene.physics.world.collide(this, enemy, this.laserHitsEnemy, null, this);
                }
            })
            
            
        }

        if (this.x >= 1000 || this.x <= -1000 || this.y >= 1000 || this.y <= -1000) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    laserHitsShip() {
        //this.setVisible(false);
        this.laserHasHit = true;
        this.scene.laserDamage.play();
        console.log("Ship hit!");
        this.ship.health -= 10;
        console.log(this.ship.health);
    }

    laserHitsEnemy() {
        //this.setVisible(false);
        this.laserHasHit = true;
        console.log("Enemy hit!");
        this.enemy.health -= 10;
        console.log(this.enemy.health);
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

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ship');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);

        this.isShooting = false;
        this.shootFromFirstPosition = true;

        this.fireRate = 250;
        this.lastFired = 0;
        this.health = 10;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 500;
        this.bulletDamage = 50;
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
        this.playerDeathHasPlayed = false;
    }

    init(data) {
        console.log(data);
        console.log("Play scene init!");
        this.backgroundSpeed = 3;
        this.shootDelay = 0.5;
        this.timeTillGunReady = 2;
        this.shipMoveSpeed = 3;
        this.dropLoop = data.dropLoop;
    }
    preload() {
        //this.load.image("ship", "../../assets/images/star fighter ship blue.png");
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/enemy.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
        this.load.spritesheet('ship', 'assets/images/SpriteAnimationFixed.png', {
            frameWidth: 180,
            frameHeight: 70,
        });
    }
    create() {
        this.addShip();

        this.anims.create({
            key: 'thrustersOn',
            frames: this.anims.generateFrameNumbers('ship', {
                start: 0,
                end: 4,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'still',
            frames: [{
                key: 'ship',
                frame: 5,
            }],
            frameRate: 20,
        });

        this.zapGun1 = this.sound.add("zap_gun_1")
        this.laserDamage = this.sound.add("laser_damage")
        this.playerDestruction = this.sound.add("player_destruction")
        this.laserGroupBlue = new LaserGroup(this, this.zapGun1, 'laser');
        this.enemyGroup = new EnemyGroup(this)
        this.laserGroupRed = new LaserGroup(this, this.zapGun1, 'laserRed');

        //this.physics.world.setBounds(this.game.renderer.width*(0.1), this.game.renderer.height*(0.05), this.game.renderer.width*0.6, this.game.renderer.height*0.9, true, true, true, true);

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
        //this.physics.world.enable([this.projectiles, this.enemies]);
    }

    update() {
        this.moveBackground(this.background, this.backgroundSpeed);
        if (this.checkPlayerAlive()) {
            this.playerMove();
            //this.checkCollisions();

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
        };
    }

    playerMove() {
        if (this.keyW.isDown || this.keyS.isDown || this.keyA.isDown || this.keyD.isDown) {
            this.ship.anims.play('thrustersOn', true);
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

    checkCollisions() {
        //this.physics.world.collide(this.player, this.enemies, this.playerEnemyCollision, null, this);
        //this.physics.world.collide(this.projectiles, this.enemies, this.projectileEnemyCollision, null, this);
        //this.physics.world.collide(this.enemyProjectiles, this.player, this.projectilePlayerCollision, null, this);
        //this.physics.world.collide(this.laserGroupBlue., this.enemies, this.projectileEnemyCollision, null, this);
        
    }

    moveBackground(background, speed) {
        background.tilePositionX += speed;
    }

    checkPlayerAlive() {
        if (this.ship.health <= 0) {
            if (!this.playerDeathHasPlayed) {
                this.playerDeath();
                this.playerDeathHasPlayed = true;
            }
            return(false);
        }
        return(true);
    }

    playerDeath() {
        this.playerDestruction.play();
        console.log("YOU DIED!");
    }

    addEvents() {
        this.input.on('pointermove', pointer => {
            const angleToMouse = Phaser.Math.Angle.BetweenPoints(pointer, this.ship);
            this.ship.angle = Phaser.Math.RadToDeg(angleToMouse) + 180;
        })
    }

    shootLaser() {
        const laserSpawnDistance = 200;
        const shipAngleRad = Phaser.Math.DegToRad(this.ship.angle)
        const xOffset = Math.cos(shipAngleRad) * laserSpawnDistance;
        const yOffset = Math.sin(shipAngleRad) * laserSpawnDistance;
        this.laserGroupBlue.fireLaser(this.ship.x+ xOffset, this.ship.y + yOffset, shipAngleRad);
    }

    spawnEnemy() {
        this.enemyGroup.spawnEnemy(this.ship.x, this.ship.y);
    }

    addShip() {
        const centerX = this.game.renderer.width / 2;
        const centerY = this.game.renderer.height / 2;
        this.ship = new Player(this, centerX, centerY);
        this.ship.setCollideWorldBounds(true);
    }

    moveShipY(ship, shipMoveSpeed) {
        ship.y += shipMoveSpeed;
    }
    moveShipX(ship, shipMoveSpeed) {
        ship.x += shipMoveSpeed;
    }
}
