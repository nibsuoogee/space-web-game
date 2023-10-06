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

        this.fireRate = 0.016;
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
        this.timeSinceShot -= this.fireRate;
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

        if (this.x <= 0 || this.x >= this.scene.game.renderer.width || this.y <= 0 || this.y >= this.scene.game.renderer.height) {
            this.setActive(false);
            this.setVisible(false);
            console.log("laser deleted!")
        }
    }

    laserHitsShip() {
        //this.setVisible(false);
        this.laserHasHit = true;
        this.scene.laserDamage.play();
        this.ship.health -= 10;
    }

    laserHitsEnemy() {
        //this.setVisible(false);
        this.laserHasHit = true;
        this.enemy.health -= 10;
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
            //this.zapGunSound.play();
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
        this.health = 1000;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 500;
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
        this.shipMoveSpeed = 3;
        this.dropLoop = this.scene.get("MENU").data.get("dropLoop");
    }
    preload() {
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/enemy.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
        this.load.spritesheet('ship', 'assets/images/SpriteAnimationFixed.png', {
            frameWidth: 180,
            frameHeight: 70,
        });
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
        this.laserGroupBlue = new LaserGroup(this, this.rocketWeapon, 'laser');
        this.enemyGroup = new EnemyGroup(this)
        this.laserGroupRed = new LaserGroup(this, this.zapGun1, 'laserRed');

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

        this.addEvents();
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
                    //this.rocketWeapon.play();
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

            if (!this.timerStarted) {
                this.timerStarted = true;
                const delay = 2000; // 2 seconds
              
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

            }

            if (!this.timerStarted) {
                this.timerStarted = true;
                const delay = 2_000; // 20sec
                this.time.delayedCall(delay, this.onTimerComplete, [], this);
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
        } else {
            this.ship.anims.play('still', true);
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

    
    shopSlideIn(Attributes, Weapons){
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
        
        
                Upgrade_1_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[0]]);
                    this.shopUpgradeMeaty.play();
                    this.ship.health += 10;
        
                }, this);
                Upgrade_2_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[1]]);
                    this.shopUpgradeMeaty.play();
        
                }, this);
                Upgrade_3_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[2]]);
                    this.shopUpgradeMeaty.play();
        
                }, this);
                Upgrade_4_Button.on('pointerup', function () {
                    console.log(attributeAssets[Attributes[3]]);
                    this.shopUpgradeMeaty.play();
                }, this);
                      
                WeaponButton.on('pointerup', function () {
                    console.log(weaponAssets[Weapons[0]]);

        
                }, this);
                      
                LeaveShopButton.on('pointerup', function () {
                    console.log("Leaving shop");
                    this.shopSlideOut(image);
                    this.slideOutTweenButtons(shopwindow, Upgrade_1_Button, Upgrade_2_Button, Upgrade_3_Button, Upgrade_4_Button, WeaponButton, LeaveShopButton, RepairShipButton);
        
                }, this);
                      
                RepairShipButton.on('pointerup', function () {
                    console.log("Reapairing");
                    this.repairHammer.play();
                    this.repairDrill.play();

        
                }, this);
        
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
    
        this.slideOutTween.play();
    }
}
