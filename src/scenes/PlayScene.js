import { CST } from "../CST.js";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this, 0);

        this.ship;
        this.scene = scene;
        this.timeSinceShot = 4;
        this.gunDelay = 4;

        this.fireRate = 0.016;
        this.lastFired = 0;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 500;
        this.bulletDamage = 10;

        this.dragValue = 300;
        this.movementDelay = 2;
        this.moveForTime = 1500
        this.timeSinceMovement = 0.5;
    }

    spawn(x, y, ship) {
        this.scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.ship = ship;
        this.health = 100;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.body.setDrag(this.dragValue, this.dragValue)
        this.healthText = this.scene.add.bitmapText(this.x, this.y + 50, 'atari-classic', 'HP', 12).setVisible(true);
        this.healthText.setTint(0xff0000);
    }
    
    preUpdate() {
        this.timeSinceShot -= this.fireRate;
        this.healthText.setPosition(this.x - 20, this.y - 50);
        this.healthText.setText(`${this.health}`)
        const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
        this.angle = Phaser.Math.RadToDeg(angleToShip) +90;
        if (this.timeSinceShot <= 0) {
            if (this.scene.checkPlayerAlive()) {
                this.shootLaser(angleToShip)
                this.timeSinceShot = this.gunDelay;
            }
        }
        if (this.health <= 0) {
            this.scene.playerDestruction.play();
            this.setActive(false);
            this.setVisible(false);
            this.scene.addPlayersPoints(10);
            this.healthText.setVisible(false);
            //this.setActive(false);
        }
        if (this.timeSinceMovement <= 0) {
            this.timeSinceMovement = this.movementDelay;
            this.setRandomDirectionVeloctiy(true);
            this.scene.time.addEvent({
                delay: this.moveForTime,
                callback: () => {
                  this.setRandomDirectionVeloctiy(false);
                },
                callbackScope: this,
                loop: false,
            });
        } else {
            this.timeSinceMovement -= 0.01
        }
    }
    shootLaser(angleToShip) {
        const laserSpawnDistance = 70;
        const xOffset = Math.cos(angleToShip) * laserSpawnDistance;
        const yOffset = Math.sin(angleToShip) * laserSpawnDistance;
        this.scene.laserGroupRed.fireLaser(this.x + xOffset, this.y + yOffset, angleToShip);
    }
    setRandomDirectionVeloctiy(active) {
        if (active) {
            if (Math.random() < 0.5) {
                this.setAccelerationX(-300 + Math.random() * 200);
            } else {
                this.setAccelerationX(300 + Math.random() * -200);
            }
            if (Math.random() < 0.5) {
                this.setAccelerationY(-300 + Math.random() * 200);
            } else {
                this.setAccelerationY(300 + Math.random() * -200);
            }
        } else {
            this.setAccelerationX(0);
            //this.setVelocityX(0);
            this.setAccelerationY(0);
            //this.setVelocityY(0);
        }
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

class BeamLaser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setActive(false);
        this.setVisible(false);
        this.scene = scene;
        this.ship = scene.ship;
        this.postFX.addBloom(0x9a9aff, 1.2, 1.2, 2, 2);
        this.enemy;
        this.isFiring = false;
    }

    fire(x, y, alpha) {
        if (!this.isFiring) {
            this.isFiring = true;
            const offsetX = Math.cos(alpha) * 1090;
            const offsetY = Math.sin(alpha) * 1090;
            this.body.reset(x + offsetX, y + offsetY);
            this.setActive(true);
            this.setVisible(true);
            this.setDepth(1);
            this.angle = Phaser.Math.RadToDeg(alpha);
        } else {
            const offsetX = Math.cos(alpha) * 1090;
            const offsetY = Math.sin(alpha) * 1090;
            this.body.reset(x + offsetX, y + offsetY);
            this.angle = Phaser.Math.RadToDeg(alpha);
        }
    }

    stopFiring() {
        this.setActive(false);
        this.setVisible(false);
        this.isFiring = false;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.scene.enemyGroup.children.iterate((enemy) => {
            if (enemy.active) {
                this.enemy = enemy;
                this.scene.physics.world.overlap(this, enemy, this.laserHitsEnemy, null, this);
            }
        })   
    }

    laserHitsEnemy() {
        this.enemy.health -= this.ship.bulletDamage * 0.08;
    }
}

class Rocket extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        //scene.physics.world.enable(this); off so that lasers don't collide and transfer kinetic energy
        // kinetic damage could be fun for certain weapon types (rocket?)
        this.scene = scene;
        this.ship = scene.ship;
        this.projectileSpeed = 900;
        this.hasHit = false;
        this.enemy;
        this.lockedOnEnemy = undefined;

        this.anims.create({
            key: 'rocketAnimation',
            frames: this.anims.generateFrameNumbers('rocket', {
                start: 0,
                end: 4,
            }),
            frameRate: 20,
            repeat: -1,
        });
    }

    fire(x, y, alpha) {
        this.lockedOnEnemy = undefined;
        this.hasHit = false;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);
        //this.setVelocity(this.projectileSpeed * Math.cos(alpha), this.projectileSpeed * Math.sin(alpha))
        this.angle = Phaser.Math.RadToDeg(alpha);
        this.play('rocketAnimation');
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.hasHit) {
            this.scene.enemyGroup.children.iterate((enemy) => {
                this.enemy = enemy;
                // enemy damage stored separately, so it can be referenced after enemy death
                if (enemy.active) {
                    if (this.lockedOnEnemy == undefined) {
                        this.lockedOnEnemy = enemy;
                        console.log("New lock!")
                    }
                    this.scene.physics.world.overlap(this, enemy, this.laserHitsEnemy, null, this);
                }
            })
        }
        if (this.x <= 0 || this.x >= this.scene.game.renderer.width || this.y <= 0 || this.y >= this.scene.game.renderer.height) {
            this.setActive(false);
            this.setVisible(false);
        }
        if (this.lockedOnEnemy) {
            this.homeToEnemy();
        }
    }
    homeToEnemy() {
        const angleToEnemy = Phaser.Math.Angle.BetweenPoints(this, this.lockedOnEnemy);
        const angle = Phaser.Math.RadToDeg(angleToEnemy);
        //this.setVelocity(this.projectileSpeed * Math.cos(angle), this.projectileSpeed * Math.sin(angle))
        this.angle = angle;
        this.setAccelerationX(this.projectileSpeed * Math.cos(angle))
        this.setAccelerationY(this.projectileSpeed * Math.sin(angle))

    }
    laserHitsEnemy() {
        this.setVisible(false);
        this.hasHit = true;
        this.enemy.health -= this.ship.bulletDamage;
        this.lockedOnEnemy = undefined;
    }
}

class Bomb extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this); //off so that lasers don't collide and transfer kinetic energy
        this.setActive(true);
        this.setVisible(true);
        this.scene = scene;
        this.ship = scene.ship;
        this.enemy;

        this.pullEnemies = false;
        this.bombFuse = 1000;
        this.blackHoleDuration = 2000;
        this.explosionDuration = 133;
        this.maxRecharge = 5;
        this.recharge = 1;
        this.explosionActive = false;
        this.dragValue = 350;
        this.anims.create({
            key: 'BombAnimation',
            frames: this.anims.generateFrameNumbers('bomb', {
                start: 0,
                end: 4,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'BlackHoleAnimation',
            frames: this.anims.generateFrameNumbers('BlackHole', {
                start: 0,
                end: 30,
            }),
            frameRate: 15,
            repeat: 0,
        });

        this.anims.create({
            key: 'BlackHoleExplosionAnimation',
            frames: this.anims.generateFrameNumbers('BlackHole', {
                start: 30,
                end: 37,
            }),
            frameRate: 60,
            repeat: -1,
        });
    }

    fire(x, y, alpha, velocityX, velocityY) {
        if (this.recharge <= 0) {
            this.hasHit = false;
            console.log("dropped a bomb");
            this.recharge = this.maxRecharge;
            this.body.reset(x,y);
            this.setScale(5,5)
            this.setActive(true);
            this.setVisible(true);
            this.setDepth(5);
            this.setVelocity(velocityX, velocityY)
            this.body.setDrag(this.dragValue, this.dragValue)
            this.play('BombAnimation');
            this.scene.time.addEvent({
                delay: this.bombFuse,
                callback: () => {
                this.activateBlackHole();
                },
                callbackScope: this,
                loop: false,
            });
        }
    }

    activateBlackHole() {
        this.anims.stop('BombAnimation');
        this.play('BlackHoleAnimation');
        //this.explosionActive = true;
        this.pullEnemies = true;
        this.scene.time.addEvent({
            delay: this.blackHoleDuration,
            callback: () => {
            this.activateExplosion();
            },
            callbackScope: this,
            loop: false,
        });
    }

    activateExplosion() {
        this.anims.stop('BlackHoleAnimation');
        this.play('BlackHoleExplosionAnimation');
        this.explosionActive = true;
        this.scene.time.addEvent({
            delay: this.explosionDuration,
            callback: () => {
            this.deactivateExplosion();
            },
            callbackScope: this,
            loop: false,
        });
    }

    deactivateExplosion() {
        this.anims.stop('BlackHoleExplosionAnimation');
        this.explosionActive = false;
        this.pullEnemies = false;
        //this.setActive(true);
        this.scene.displayTintOverlay('0xffffff');
        this.setVisible(false);
    }

    preUpdate(time, delta) {
        this.recharge -= 0.05;
        super.preUpdate(time, delta);
        this.scene.enemyGroup.children.iterate((enemy) => {
            this.enemy = enemy;
            if (enemy.active) {
                if (this.pullEnemies) {
                    const angleToBomb = Phaser.Math.Angle.BetweenPoints(enemy, this);
                    const angle = Phaser.Math.RadToDeg(angleToBomb);
                    enemy.setVelocityX(500 * Math.cos(angle))
                    enemy.setVelocityY(500 * Math.sin(angle))
                }
                if (this.explosionActive) {
                this.scene.physics.world.overlap(this, enemy, this.hitsEnemy, null, this);
                }
            }
        })
        if (this.explosionActive) {
            this.scene.physics.world.overlap(this, this.ship, this.hitsShip, null, this);
        }
    }

    hitsShip() {
        //this.scene.laserDamage.play();
        this.ship.health -= 10//this.ship.bulletDamage / 10;
    }

    hitsEnemy() {
        this.enemy.health -= 10//this.ship.bulletDamage / 10;
    }
}

// Laser physics classes by CodeCaptain https://www.youtube.com/watch?v=9wvlAzKseCo&t=510s
class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, laserColour) {
        super(scene, x, y, laserColour);
        scene.add.existing(this);
        //scene.physics.world.enable(this); off so that lasers don't collide and transfer kinetic energy
        // kinetic damage could be fun for certain weapon types (rocket?)
        this.scene = scene;
        this.ship = scene.ship;
        this.postFX.addBloom(0xffffff, 1.5, 1.5, 2, 2);
        this.laserSpeed = 900;
        this.laserHasHit = false;
        this.enemy;
        this.enemyBulletDamage;
    }

    fire(x, y, alpha) {
        this.laserHasHit = false;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);
        this.setVelocity(this.laserSpeed * Math.cos(alpha), this.laserSpeed * Math.sin(alpha))
        this.angle = Phaser.Math.RadToDeg(alpha);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.laserHasHit) {
            this.scene.physics.world.overlap(this, this.ship, this.laserHitsShip, null, this);
            
            this.scene.enemyGroup.children.iterate((enemy) => {
                this.enemy = enemy;
                // enemy damage stored separately, so it can be referenced after enemy death
                this.enemyBulletDamage = enemy.bulletDamage; 
                if (enemy.active) {
                    this.scene.physics.world.overlap(this, enemy, this.laserHitsEnemy, null, this);
                }
            })
        }
        if (this.x <= 0 || this.x >= this.scene.game.renderer.width || this.y <= 0 || this.y >= this.scene.game.renderer.height) {
            this.setActive(false);
            this.setVisible(false);
            console.log("laser deleted!")
        }
    }

    laserHitsShip() {
        this.setVisible(false);
        this.laserHasHit = true;
        this.scene.laserDamage.play();
        this.ship.health -= this.enemyBulletDamage;
        this.scene.displayTintOverlay('0xff0000');
    }

    laserHitsEnemy() {
        this.setVisible(false);
        this.laserHasHit = true;
        this.enemy.health -= this.ship.bulletDamage;
    }
}

class WeaponGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, weaponSound, weaponSprite, weaponType) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: weaponType,//Laser,
            frameQuantity: 20,
            active: false,
            visible: false,
            key: weaponSprite
        })
        this.zapGunSound = weaponSound;
    }

    fireLaser(x, y, alpha) {
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y, alpha)
            //this.zapGunSound.play(); enemy laser sound
        }
    }
}

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ship');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.dragValue = 800;
        this.body.setDrag(this.dragValue, this.dragValue)

        this.isShooting = false;
        this.shootFromFirstPosition = true;

        this.fireRate = 250;
        this.lastFired = 0;
        this.health = 1000;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 400;
        this.bulletDamage = 50;
        this.points = 0;
        this.energy = 100;
        this.energyGeneration = 10;
        this.energyUsage = 1;

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
        this.backgroundSpeed = 3;
        this.shootDelay = 0.5;
        this.timeTillGunReady = 2;
        this.dropLoop = this.scene.get("MENU").data.get("dropLoop");
    }
    preload() {
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/enemy.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
        this.load.spritesheet('rocket', '../../assets/images/MissileSprite.png', {
            frameWidth: 35,
            frameHeight: 16,
        });
        this.load.image('beamLaser', "../../assets/images/star fighter max long blue.png");
        this.load.spritesheet('bomb', "../../assets/images/BlackHoleBombSprite.png", {
            frameWidth: 13,
            frameHeight: 13,
        });
        this.load.spritesheet('BlackHole', "../../assets/images/BlackHoleSprite.png", {
            frameWidth: 40,
            frameHeight: 40,
        });
        this.load.spritesheet('ship', 'assets/images/SpriteAnimationFixed.png', {
            frameWidth: 180,
            frameHeight: 70,
        });
        this.damageOverlay = this.add.rectangle(this.game.renderer.width / 2, this.game.renderer.height /2, this.game.renderer.width, this.game.renderer.height, 0xff0000).setVisible(0);
        this.load.bitmapFont('atari-classic', 'assets/images/text/bitmap/atari-classic.png', 'assets/images/text/bitmap/atari-classic.xml');
        this.load.image('shop', "../../assets/images/shop.png");
        this.load.image('EngineUpgrade', "../../assets/images/EngineUpgrade.png");
        this.load.image('HealthUpgrade', "../../assets/images/HealthUpgrade.png");
        this.load.image('FireRateUpgrade', "../../assets/images/FireRateUpgrade.png");
        this.load.image('DamageUpgrade', "../../assets/images/DamageUpgrade.png");
        this.load.image('shopWindow', "../../assets/images/shopWindow.png");
        this.load.image('LeaveShop', "../../assets/images/LeaveShop.png");
        this.load.image('MissileUpgrade', "../../assets/images/MissileUpgrade.png");
        this.load.image('RepairShip', "../../assets/images/RepairShip.png");

        this.load.audio("shop_zap", "../../assets/sfx/star-fighter-laser-shop-wet-zap.mp3");
        this.load.audio("shop_upgrade_meaty", "../../assets/sfx/star-fighter-laser-purchase-upgrade-water-like-sound.mp3");
        this.load.audio("repair_hammering", "../../assets/sfx/star-fighter-repair-hammering-2.mp3");
        this.load.audio("repair_drill", "../../assets/sfx/star-fighter-repair-drill.wav");
        this.load.audio("rocket_weapon", "../../assets/sfx/star-fighter-fire-rocket-weapon-2.mp3");
        
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
        this.shopZap = this.sound.add("shop_zap")
        this.shopUpgradeMeaty = this.sound.add("shop_upgrade_meaty")
        this.repairHammer = this.sound.add("repair_hammering");
        this.repairDrill = this.sound.add("repair_drill");
        this.rocketWeapon = this.sound.add("rocket_weapon");
        this.laserGroupBlue = new WeaponGroup(this, this.zapGun1, 'laser', Laser);
        this.rocketGroup = new WeaponGroup(this, this.rocketWeapon, 'rocket', Rocket)
        this.beamLaser = new BeamLaser(this, 0, 0, 'beamLaser');
        this.bomb = new Bomb(this, 0, 0, 'bomb');
        this.enemyGroup = new EnemyGroup(this)
        this.laserGroupRed = new WeaponGroup(this, this.zapGun1, 'laserRed', Laser);

        this.sound.volume = 0.05;
        this.background = this.add.tileSprite(0,0, this.game.renderer.width, this.game.renderer.height, "star_background").setOrigin(0).setDepth(-1);
        this.background.preFX.addBarrel(0.5);

        this.physics.add.existing(this.ship, 0);
        this.ship.body.collideWorldBounds = true;

        let menuButton = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text").setDepth(1);
        let menuButtonHover = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text_hover").setDepth(1).setVisible(0);

        //this.gunReadyText = this.add.text(this.game.renderer.width / 50, this.game.renderer.height * 0.90, 'GUN READY', { fontFamily: 'Cambria math' }).setFontSize(18);
        //this.gunReadyTimeText = this.add.text(this.game.renderer.width / 40, this.game.renderer.height * 0.95, '', { fontFamily: 'Cambria math' }).setFontSize(18);

        //this.healthPercent = this.add.text(50, -50, '', { fontFamily: 'Cambria math' }).setFontSize(18);
        //this.bitmapText = this.add.bitmapText(0, 0, 'arcade', 16.34);
        this.healthPercent = this.add.bitmapText(20, this.game.renderer.height * 0.95, 'atari-classic', 'init', 20);
        this.scoreCounter = this.add.bitmapText(this.game.renderer.width -150, this.game.renderer.height * 0.95, 'atari-classic', '0 pts', 20);
        this.tooltipText = this.add.bitmapText(this.game.renderer.width / 4, this.game.renderer.height * 0.95, 'atari-classic', 'Tooltip', 20).setVisible(false);

        this.hudDamageStat = this.add.bitmapText(this.game.renderer.width - 150, this.game.renderer.height /2 - 40, 'atari-classic', 'DMG', 15).setVisible(true);
        this.hudFireRateStat = this.add.bitmapText(this.game.renderer.width - 150, this.game.renderer.height /2 - 20, 'atari-classic', 'FR', 15).setVisible(true);
        this.hudBulletSpeedStat = this.add.bitmapText(this.game.renderer.width - 150, this.game.renderer.height /2, 'atari-classic', 'FR', 15).setVisible(true);
        this.hudHullCollisionDamageStat = this.add.bitmapText(this.game.renderer.width - 150, this.game.renderer.height /2 + 20, 'atari-classic', 'HCD', 15).setVisible(true);
        this.hudFlySpeedStat = this.add.bitmapText(this.game.renderer.width - 150, this.game.renderer.height /2 + 40, 'atari-classic', 'FS', 15).setVisible(true);
        
        this.updateHudStatValues();
        let dropLoop = this.scene.get("MENU").data.get("dropLoop");

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
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);


        this.addEvents();
    }

    update() {
        this.moveBackground(this.background, this.backgroundSpeed);
        if (this.checkPlayerAlive()) {
            this.playerMove();
            const shipAngleRad = Phaser.Math.DegToRad(this.ship.angle)
            //this.checkCollisions();

            //this.gunReadyTimeText.setText(`${Phaser.Math.RoundTo(this.timeTillGunReady, 0)} s`)
            if (this.keyE.isDown) {
                this.beamLaser.fire(this.ship.x, this.ship.y, shipAngleRad);
            }
            if (Phaser.Input.Keyboard.JustUp(this.keyE)) {
                console.log("E released")
                this.beamLaser.stopFiring();
            }

            if (this.timeTillGunReady <= 0) {
                //this.gunReadyText.setVisible(1);
                if (this.keySpace.isDown) {
                    this.zapGun1.play();
                    //this.rocketWeapon.play();
                    this.timeTillGunReady = this.shootDelay;
                    this.shootWeaponByGroup(this.laserGroupBlue);
                }
                if (this.keyShift.isDown) {
                    this.rocketWeapon.play();
                    this.timeTillGunReady = this.shootDelay;
                    this.shootWeaponByGroup(this.rocketGroup);
                }
                if (this.keyF.isDown) {
                    console.log("F pressed")
                    this.timeTillGunReady = this.shootDelay;
                    this.bomb.fire(this.ship.x, this.ship.y, shipAngleRad, this.ship.body.velocity.x, this.ship.body.velocity.y);
                }
            } else {
                this.timeTillGunReady -= 0.016;
                //this.gunReadyText.setVisible(0);
            }

            if (!this.timerStarted) {
                this.timerStarted = true;
                const delay = 2000; // 2 seconds
                const ShopDelay = 2000;
              
                // Define game boundaries (adjust these values to fit your game)
                const minX = 0;
                const maxX = this.game.config.width;
                const minY = 0;
                const maxY = this.game.config.height;

                this.time.addEvent({
                    delay: delay,
                    callback: () => {
                      this.getRandomPositionWithinBounds(minX, maxX, minY, maxY);
                    },
                    callbackScope: this,
                    loop: true,
                  });

                  this.time.addEvent({
                    delay: ShopDelay,
                    callback: () => {
                        this.onTimerComplete();
                    },
                    callbackScope: this,
                    loop: false,
                  });

            }
        };
    }

    getRandomPositionWithinBounds(minX, maxX, minY, maxY) {
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;
        this.spawnEnemyXY(x, y);
      }
    

    onTimerComplete() {
        //all the enemies must be killed first



        // all the scrap floats fairly quickly to the player



        const minAttributeValue = 0;  // Minimum attribute value
        const maxAttributeValue = 3;  // Maximum attribute value (inclusive)
        
        const minWeaponValue = 0;     // Minimum weapon value
        const maxWeaponValue = 1;     // Maximum weapon value (inclusive)
        
        const selectedWeapons = [];
        const selectedAttributes = [];
        
        for (let i = 0; i < 4; i++) {
            const randomAttribute = Math.floor(Math.random() * (maxAttributeValue - minAttributeValue + 1)) + minAttributeValue;
            selectedAttributes.push(randomAttribute);
        }
        
        const randomWeapon = Math.floor(Math.random() * (maxWeaponValue - minWeaponValue + 1)) + minWeaponValue;
        selectedWeapons.push(randomWeapon);
        
        this.shopSlideIn(selectedAttributes, selectedWeapons);

    }

    playerMove() {
        if (this.keyW.isDown || this.keyS.isDown || this.keyA.isDown || this.keyD.isDown) {
            this.ship.anims.play('thrustersOn', true);
            if (this.keyW.isDown) {
                //this.moveShipY(this.ship, -this.ship.flySpeed)
                this.ship.setVelocityY(-this.ship.flySpeed)
            } 
            if (this.keyS.isDown) {
                //this.moveShipY(this.ship, this.ship.flySpeed)
                this.ship.setVelocityY(this.ship.flySpeed)
            } 
            if (this.keyA.isDown) {
                //this.moveShipX(this.ship, -this.ship.flySpeed)
                this.ship.setVelocityX(-this.ship.flySpeed)
            } 
            if (this.keyD.isDown) {
                //this.moveShipX(this.ship, this.ship.flySpeed)
                this.ship.setVelocityX(this.ship.flySpeed)
            } 
        } else {
            this.ship.anims.play('still', true);
            //this.ship.setVelocityX(0);
            //this.ship.setVelocityY(0);            
        }
        
    }

    moveBackground(background, speed) {
        background.tilePositionX += speed;
    }

    displayTintOverlay(colour) {
        this.damageOverlay.setVisible(1);
        this.damageOverlay.setFillStyle(colour, 1);
        this.damageOverlay.setAlpha(0); // Initially transparent
        this.damageOverlay.setDepth(9999); // Make sure it's on top of everything
        const duration = 200; // 1 second (adjust as needed)
        // Create a tween to fade in and out the overlay
        this.tweens.add({
            targets: this.damageOverlay,
            alpha: 0.5, // Set the desired tint opacity (adjust as needed)
            duration: duration / 2, // Fade in for half of the duration
            yoyo: true, // Yoyo to fade out
            repeat: 0, // Repeat once to fade out after fading in
            onComplete: () => {
                // Callback function when the tween is complete
                this.damageOverlay.setVisible(0); // Remove the overlay after the animation
            }
        });
    }

    checkPlayerAlive() {
        this.healthPercent.setText(`${this.ship.health}%`);
        if (this.ship.health <= 0) {
            if (!this.playerDeathHasPlayed) {
                this.playerDeath();
                this.playerDeathHasPlayed = true;
            }
            return(false);
        }
        return(true);
    }

    addPlayersPoints(points) {
        this.ship.points += points;
        this.scoreCounter.setText(`${this.ship.points} pts`);
    }

    playerDeath() {
        this.playerDestruction.play();
        console.log("YOU DIED!");
        this.dropLoop.stop();
    }

    addEvents() {
        this.input.on('pointermove', pointer => {
            const angleToMouse = Phaser.Math.Angle.BetweenPoints(pointer, this.ship);
            this.ship.angle = Phaser.Math.RadToDeg(angleToMouse) + 180;
        })
    }

    shootWeaponByGroup(weaponGroup) {
        const laserSpawnDistance = 150;
        const shipAngleRad = Phaser.Math.DegToRad(this.ship.angle)
        const xOffset = Math.cos(shipAngleRad) * laserSpawnDistance;
        const yOffset = Math.sin(shipAngleRad) * laserSpawnDistance;
        weaponGroup.fireLaser(this.ship.x+ xOffset, this.ship.y + yOffset, shipAngleRad);
    }

    spawnEnemy() {
        this.enemyGroup.spawnEnemy(this.ship.x, this.ship.y);
    }

    spawnEnemyXY(x, y) {
        this.enemyGroup.spawnEnemy(x, y);
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

    displayTooltip(tooltipText, active) {
        if (active) {
            this.tooltipText.setText(tooltipText);
            this.tooltipText.setVisible(true);
            return;
        }
        this.tooltipText.setVisible(false);
    }
    
    updateHudStatValues() {
        this.hudDamageStat.setText(`DMG: ${this.ship.bulletDamage}`);
        this.hudFireRateStat.setText(`FR: ${this.ship.fireRate}`);
        this.hudBulletSpeedStat.setText(`BS: ${this.ship.bulletSpeed}`);
        this.hudHullCollisionDamageStat.setText(`HCD: ${this.ship.hullCollisionDamage}`);
        this.hudFlySpeedStat.setText(`FS: ${this.ship.flySpeed}`);
    }

    shopSlideIn(Attributes, Weapons){
        this.backgroundSpeed = 0.2;
        console.log(Attributes, Weapons)

        //Scale of icons and shop
        const scale = 3;
        
        //Assets
        const attributeAssets = ["EngineUpgrade", "HealthUpgrade", "FireRateUpgrade", "DamageUpgrade"];
        const weaponAssets = ["MissileUpgrade"];

        //shop basics
        this.load.image('shop', "../../assets/images/shop.png");
        this.load.image('shopWindow', "../../assets/images/shopWindow.png");
        this.load.image('LeaveShop', "../../assets/images/LeaveShop.png");
        this.load.image('RepairShip', "../../assets/images/RepairShip.png");

        //Upgrades
        this.load.image('EngineUpgrade', "../../assets/images/EngineUpgrade.png");
        this.load.image('HealthUpgrade', "../../assets/images/HealthUpgrade.png");
        this.load.image('FireRateUpgrade', "../../assets/images/FireRateUpgrade.png");
        this.load.image('DamageUpgrade', "../../assets/images/DamageUpgrade.png");

        //Weapons
        this.load.image('MissileUpgrade', "../../assets/images/MissileUpgrade.png");
        const image = this.add.image(this.game.config.width, this.game.config.height / 2, 'shop');

        //add shop to out of bounds
        image.setOrigin(0, 0.5);

        //play ship slide in animation and open shop window
        this.slideInTween = this.tweens.add({
            targets: image,
            x: this.game.config.width / 1.3, // shop X position
            duration: 1000, // Duration of the tween in milliseconds
            ease: 'Power2', // Easing function
            paused: true, // Pause the tween initially
            onComplete: () => {
                //Shop basics in place
                var shopwindow = this.add.image(0,0, 'shopWindow').setOrigin(0,0);
                var LeaveShopButton = this.add.image(136*scale,68*scale, 'LeaveShop').setOrigin(0).setInteractive();
                var RepairShipButton = this.add.image(163*scale,68*scale, 'RepairShip').setOrigin(0).setInteractive();

                //Upgrades in place
                var Upgrade_1_Button = this.add.image(13*scale,13*scale, attributeAssets[Attributes[0]]).setOrigin(0).setInteractive();
                var Upgrade_2_Button = this.add.image(67*scale,13*scale, attributeAssets[Attributes[1]]).setOrigin(0).setInteractive();
                var Upgrade_3_Button = this.add.image(13*scale,58*scale, attributeAssets[Attributes[2]]).setOrigin(0).setInteractive();
                var Upgrade_4_Button = this.add.image(67*scale,58*scale, attributeAssets[Attributes[3]]).setOrigin(0).setInteractive();

                //Weapons in place
                var WeaponButton = this.add.image(145*scale,15*scale, weaponAssets[Weapons[0]]).setOrigin(0).setInteractive();

                //upgrades scale
                Upgrade_1_Button.setScale(scale);
                Upgrade_2_Button.setScale(scale);
                Upgrade_3_Button.setScale(scale);
                Upgrade_4_Button.setScale(scale);

                //Weapon scale
                WeaponButton.setScale(scale/3);

                //Shop basics scale
                LeaveShopButton.setScale(scale/5);
                RepairShipButton.setScale(scale/5);
                shopwindow.setScale(scale);
        
                var shopContainer = this.add.container(32,70, [shopwindow, Upgrade_1_Button, Upgrade_2_Button, Upgrade_3_Button, Upgrade_4_Button, WeaponButton, LeaveShopButton, RepairShipButton], Phaser.Geom.Rectangle.Contains)
        
                Upgrade_1_Button.on("pointerover", () => {
                    this.displayTooltip("Increase ship health", true);
                });
                Upgrade_1_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[0]]);
                    this.shopUpgradeMeaty.play();
                    this.ship.health += 10;
        
                }, this);
                Upgrade_1_Button.on("pointerout", () => {
                    this.displayTooltip("", false);
                });

                Upgrade_2_Button.on("pointerover", () => {
                    this.displayTooltip("DO SOMETHING", true);
                });
                Upgrade_2_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[1]]);
                    this.shopUpgradeMeaty.play();
        
                }, this);
                Upgrade_2_Button.on("pointerout", () => {
                    this.displayTooltip("", false);
                });

                Upgrade_3_Button.on("pointerover", () => {
                    this.displayTooltip("DO SOMETHING", true);
                });
                Upgrade_3_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[2]]);
                    this.shopUpgradeMeaty.play();
        
                }, this);
                Upgrade_3_Button.on("pointerout", () => {
                    this.displayTooltip("", false);
                });

                Upgrade_4_Button.on("pointerover", () => {
                    this.displayTooltip("DO SOMETHING", true);
                });
                Upgrade_4_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[3]]);
                    this.shopUpgradeMeaty.play();
                }, this);
                Upgrade_4_Button.on("pointerout", () => {
                    this.displayTooltip("", false);
                });
                      
                WeaponButton.on("pointerover", () => {
                    this.displayTooltip("Purchase secondary X", true);
                });
                WeaponButton.on('pointerup', function () {
                    console.log(weaponAssets[Weapons[0]]);        
                }, this);
                WeaponButton.on("pointerout", () => {
                    this.displayTooltip("", false);
                });
                      
                LeaveShopButton.on("pointerover", () => {
                    this.displayTooltip("Leave shop", true);
                });
                LeaveShopButton.on('pointerup', function () {
                    console.log("Leaving shop");
                    this.shopSlideOut(image);
                    this.slideOutTweenButtons(shopwindow, Upgrade_1_Button, Upgrade_2_Button, Upgrade_3_Button, Upgrade_4_Button, WeaponButton, LeaveShopButton, RepairShipButton);
                }, this);
                LeaveShopButton.on("pointerout", () => {
                    this.displayTooltip("", false);
                });
                    
                RepairShipButton.on("pointerover", () => {
                    this.displayTooltip("Repair hull", true);
                });
                RepairShipButton.on('pointerup', function () {
                    console.log("Reapairing");
                    this.repairHammer.play();
                    this.repairDrill.play();
                }, this);
                RepairShipButton.on("pointerout", () => {
                    this.displayTooltip("", false);
                });
            }
        });

        this.slideInTween.play();
        this.shopZap.play();
        
    }

    slideOutTweenButtons(button1, button2, button3, button4, button5, button6, button7, shopwindow) {
        const duration = 2000;
        const targets = [button1, button2, button3, button4, button5, button6, button7, shopwindow];
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            this.tweens.add({
                targets: target,
                x: -5000,
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    target.destroy();
                }
            });
        }
    }

    shopSlideOut(image) {
        this.backgroundSpeed = 3;
        this.slideOutTween = this.tweens.add({
            targets: image,
            x: -1000,
            duration: 5000,
            ease: 'Power2',
            paused: true,
            onComplete: () => {
                image.destroy();
            }
        });
        this.displayTooltip("", false);
        this.slideOutTween.play();
        this.updateHudStatValues();
    }
}
