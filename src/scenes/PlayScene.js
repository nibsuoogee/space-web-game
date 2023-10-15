import { CST } from "../CST.js";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this, 0);

        this.scene = scene;
        this.maxHealth = 100;
        this.timeSinceShot = 4;
        this.gunDelay = 4;

        this.fireRate = 0.016;
        this.lastFired = 0;
        this.hullCollisionDamage = 50;
        this.flySpeed = 300;
        this.bulletDamage = 13;
        this.bulletSpeed = 600;

        this.dragValue = 300;
        this.movementDelay = 2;
        this.moveForTime = 1000
        this.timeSinceMovement = 0.5;

        this.flame;
    }
    setHealthDelta(delta) {this.health += delta;}
    getBulletDamage() {return this.bulletDamage;}
    getBulletSpeed() {return this.bulletSpeed;}
    spawn(x, y, ship) {
        this.scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.ship = ship;
        this.health = this.maxHealth;
        this.body.reset(x,y);
        this.displayParticles('spawnFlash');
        this.setDepth(1);
        this.setActive(true);
        this.setVisible(true);
        this.body.setDrag(this.dragValue, this.dragValue)
        this.healthText = this.scene.add.bitmapText(this.x, this.y + 50, 'atari-classic', 'HP', 12).setVisible(true).setDepth(2);
        this.healthText.setTint(0xff0000);
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
        this.checkMovement();
        this.checkHealth();
    }
    checkMovement() {
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
    checkHealth() {
        if (this.health <= 0) {
            this.displayParticles('deathFireParticle');
            this.spawnScrap();
            this.setActive(false);
            this.setVisible(false);
            this.scene.addPlayersPoints(10);
            this.healthText.setVisible(false);
        } else {
            this.healthText.setPosition(this.x - 20, this.y - 50);
            this.healthText.setText(`${Math.round(this.health)}`)
        }
    }
    displayParticles(sprite) {
        if (this.flame === undefined) {
            this.flame = this.scene.add.particles(this.x, this.y, sprite,
                {
                    color: [0xffffff, 0xffffff, 0xfcf9f2, 0xfc2222],
                    colorEase: 'quad.out',
                    lifespan: 100,
                    scale: { start: 1, end: 0, ease: 'sine.out' },
                    speed: 300,
                    advance: 800,
                    frequency: 20,
                    blendMode: 'ADD',
                    duration: 300,
                });
                this.flame.setDepth(1);
                this.flame.postFX.addBloom(0xfcf9f2, 1, 1, 2, 1, 6);
            this.flame.once("complete", () => {
                this.flame.destroy();
                this.flame = undefined;
            })
        }
    }
    shootLaser(angleToShip) {
        const laserSpawnDistance = 70;
        const xOffset = Math.cos(angleToShip) * laserSpawnDistance;
        const yOffset = Math.sin(angleToShip) * laserSpawnDistance;
        this.scene.laserGroupRed.fireLaser(this.x + xOffset, this.y + yOffset, angleToShip, this);
    }
    setRandomDirectionVeloctiy(active) {
        if (active) {
            if (Math.random() < 0.5) {
                this.setAccelerationX(-this.flySpeed + Math.random() * 200);
            } else {
                this.setAccelerationX(this.flySpeed + Math.random() * -200);
            }
            if (Math.random() < 0.5) {
                this.setAccelerationY(-this.flySpeed + Math.random() * 200);
            } else {
                this.setAccelerationY(this.flySpeed + Math.random() * -200);
            }
        } else {
            this.setAccelerationX(0);
            //this.setVelocityX(0);
            this.setAccelerationY(0);
            //this.setVelocityY(0);
        }
    }
    spawnScrap() {
        if (Math.random() < 0.2) {
            this.scene.healthKitGroup.fireLaser(this.x + (Math.random()*200)-100, this.y + (Math.random()*200)-100, 0);
        }
        this.scene.scrapGroup.fireLaser(this.x, this.y, 0);
    }
}

class OrangeEnemy extends Enemy {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.maxHealth = 200;
    }
    shootLaser(angleToShip) {
        const laserSpawnDistance = 70;
        const xOffset = Math.cos(angleToShip) * laserSpawnDistance;
        const yOffset = Math.sin(angleToShip) * laserSpawnDistance;
        this.scene.laserGroupRed.fireLaser(this.x + xOffset, this.y + yOffset, angleToShip+(2*Math.PI/20), this);
        this.scene.laserGroupRed.fireLaser(this.x + xOffset, this.y + yOffset, angleToShip, this);
        this.scene.laserGroupRed.fireLaser(this.x + xOffset, this.y + yOffset, angleToShip-(2*Math.PI/20), this);
    }
}

class BlueEnemy extends Enemy {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.recharge = 0.01;
        this.aimAngle = 0;
        this.maxHealth = 150;
    }
    preUpdate() {
        this.timeSinceShot -= this.recharge;
        const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
        this.angle = Phaser.Math.RadToDeg(this.aimAngle)+90;
        const rotationSpeed = 0.01;
        this.aimAngle += Phaser.Math.Angle.Wrap(angleToShip - this.aimAngle) * rotationSpeed;
        if (this.timeSinceShot <= 2) {
            if (this.scene.checkPlayerAlive()) {
                const offsetX = Math.cos(this.aimAngle) * 1050;
                const offsetY = Math.sin(this.aimAngle) * 1050;
                this.scene.enemyBeamLaser.fire(this.x + offsetX, this.y + offsetY, this.aimAngle, this);
            }
        }
        if (this.timeSinceShot <= 0) {
            this.timeSinceShot = this.gunDelay;
            this.scene.enemyBeamLaser.stopFiring();
        }
        this.checkMovement();
        this.checkHealth();
        if (this.health <= 0) {
            this.scene.enemyBeamLaser.stopFiring();
        }
    }
}

class RainbowEnemy extends Enemy {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.postFX.addBloom(0xfcf9f2, 1, 1, 1.5, 1, 4);
        this.maxHealth = 300
        this.bulletSpeed = 700;
        this.flySpeed = 1200;
        this.bulletDamage = 10;
        this.anims.create({
            key: 'RainbowAnimation',
            frames: this.anims.generateFrameNumbers('rainbowEnemy', {
                start: 0,
                end: 5,
            }),
            frameRate: 6,
            repeat: -1,
        });
    }
    spawn(x, y, ship) {
        super.spawn(x, y, ship);
        this.play('RainbowAnimation');
    }
    spawnScrap() {
        const deathX = this.x;
        const deathY = this.y;
        this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                this.scene.scrapGroup.fireLaser(deathX + (Math.random()*200)-100, deathY + (Math.random()*200)-100, 0);
            },
            callbackScope: this,
            repeat: 5,
        });
    }
}

class EnemyGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, enemySprite, enemyType) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: enemyType,
            frameQuantity: 5,
            active: false,
            visible: false,
            key: enemySprite
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

// Laser class based on CodeCaptain's https://www.youtube.com/watch?v=9wvlAzKseCo&t=510s
class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.scene = scene;
        this.ship = scene.ship;
        this.postFX.addBloom(0xffffff, 1.5, 1.5, 2, 2);
        this.hasHit = false;
    }
    fire(x, y, alpha, shooter) {
        this.hasHit = false;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);
        this.bulletDamage = shooter.getBulletDamage();
        this.bulletSpeed = shooter.getBulletSpeed();
        this.setVelocity(this.bulletSpeed * Math.cos(alpha), this.bulletSpeed * Math.sin(alpha))
        this.angle = Phaser.Math.RadToDeg(alpha);
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.hasHit) {
            this.scene.physics.world.overlap(this, this.ship, this.laserHitsShip, null, this);
            this.iterateOverEnemyTypeGroup(this.scene.enemyGroup);
            this.iterateOverEnemyTypeGroup(this.scene.orangeEnemyGroup);
            this.iterateOverEnemyTypeGroup(this.scene.blueEnemyGroup);
            this.iterateOverEnemyTypeGroup(this.scene.rainbowEnemyGroup);
        }
        if (this.x <= 0 || this.x >= this.scene.game.renderer.width || this.y <= 0 || this.y >= this.scene.game.renderer.height) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
    iterateOverEnemyTypeGroup(group) {
        group.children.iterate((enemy) => {
            this.enemy = enemy;
            if (enemy.active) {
                this.scene.physics.world.overlap(this, enemy, this.laserHitsEnemy, null, this);
            }
        })
    }
    laserHitsShip() {
        if (!this.ship.invincible) {
            this.setVisible(false);
            this.hasHit = true;
            this.scene.laserDamage.play();
            this.ship.setHealthDelta(-this.bulletDamage);
            this.scene.displayTintOverlay('0xff0000');
        }
    }
    laserHitsEnemy() {
        this.setVisible(false);
        this.hasHit = true;
        this.enemy.setHealthDelta(-this.bulletDamage);
    }
}

class Rocket extends Laser {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.projectileSpeed = 900;
        this.dragValue = 1000;
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
    fire(x, y, alpha, shooter) {
        super.fire(x, y, alpha, shooter);
        this.body.setDrag(this.dragValue, this.dragValue)
        this.scene.rocketWeapon.play();
        this.lockedOnEnemy = undefined;
        this.play('rocketAnimation');
    }
    iterateOverEnemyTypeGroup(group) {
        group.children.iterate((enemy) => {
            this.enemy = enemy;
            if (enemy.active) {
                if (this.lockedOnEnemy == undefined) {
                    this.lockedOnEnemy = enemy;
                }
                this.scene.physics.world.overlap(this, enemy, this.laserHitsEnemy, null, this);
                if (this.lockedOnEnemy) {
                    this.homeToEnemy();
                }
            }
        })
    }
    homeToEnemy() {
        const distToEnemy = Phaser.Math.Distance.BetweenPoints(this, this.lockedOnEnemy);
        const angleToEnemy = Phaser.Math.Angle.BetweenPoints(this, this.lockedOnEnemy);
        const angle = angleToEnemy;
        this.angle = Phaser.Math.RadToDeg(angleToEnemy);
        if (distToEnemy > 0) {
            this.setVelocityX((this.projectileSpeed * 100/distToEnemy + 50) * Math.cos(angle))
            this.setVelocityY((this.projectileSpeed * 100/distToEnemy + 50) * Math.sin(angle))
        }
        
    }
    laserHitsShip() {return;}
    laserHitsEnemy() {
        super.laserHitsEnemy();
        this.lockedOnEnemy = undefined;
    }
}

class BeamLaser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, isEnemyLaser) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.scene = scene;
        this.ship = scene.ship;
        this.isEnemyLaser = isEnemyLaser;
        this.rechargeDelay = 5000;
        this.energyPercent = 1;
        this.timer = undefined;
        this.setActive(false);
        this.setVisible(false);
        this.isFiring = false;
        this.hasHitLastSecond = false;
        this.postFX.addBloom(0xffffff, 1, 1, 2, 2, 8);
        const fx = this.postFX.addDisplacement('distort', -0.00, -0.00);
        const shine = this.postFX.addShine(10, .5, 5);
        this.scene.tweens.add({
            targets: fx,
            x: 0.00,
            y: 0.03,
            yoyo: true,
            loop: -1,
            duration: 10,
            ease: 'sine.inout'
        });  
    }
    fire(x, y, alpha, shooter) {
        if (!this.isFiring && this.energyPercent > 0) {
            if (this.timer !== undefined) {
                clearInterval(this.timer);
            }
            if (!this.scene.laserBeamFiring.isPlaying && !this.isEnemyLaser) {
                this.scene.laserBeamFiring.play();
            }
            this.isFiring = true;
            this.body.reset(x, y);
            this.setActive(true);
            this.setVisible(true);
            this.setDepth(1);
            this.bulletDamage = shooter.getBulletDamage();
            this.angle = Phaser.Math.RadToDeg(alpha);
        } else {
            this.body.reset(x, y);
            this.angle = Phaser.Math.RadToDeg(alpha);
        }
    }
    stopFiring() {
        this.setActive(false);
        this.setVisible(false);
        this.isFiring = false;
        if (!this.isEnemyLaser) {  //} && this.energyPercent > 0) {
            this.scene.laserBeamFiring.stop();
            this.scene.laserBeamFiringEnding.play();
        }
        if (this.scene.playerEatinglaserBeam.isPlaying) {
            this.scene.playerEatinglaserBeam.stop(); 
            this.scene.playerEatingLaserBeamEnd.play(); 
        }
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.timer !== undefined) {
                    clearInterval(this.timer);
                }
                if (!this.isFiring) {
                    const incrementInterval = 10;
                    this.timer = setInterval(() => {
                        this.energyPercent += (incrementInterval / this.rechargeDelay);

                        if (this.energyPercent >= 1) {
                            this.energyPercent = 1;
                            clearInterval(this.timer);
                            this.weaponReady = true;
                        }
                        if (!this.isEnemyLaser) {
                            this.scene.setSecondaryPercent(this.energyPercent);
                        }
                    }, incrementInterval);
                }
            },
            callbackScope: this,
            loop: false,
        });  
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.isFiring) {
            if (this.energyPercent > 0) {
                this.energyPercent -= 0.001;
                if (!this.isEnemyLaser) {
                    this.scene.setSecondaryPercent(this.energyPercent);
                }
            } else {
                this.stopFiring();
            }
        }
        this.scene.physics.world.overlap(this, this.ship, this.laserHitsShip, null, this);
        this.iterateOverEnemyTypeGroup(this.scene.enemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.orangeEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.blueEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.rainbowEnemyGroup);
    }

    iterateOverEnemyTypeGroup(group) {
        group.children.iterate((enemy) => {
            if (enemy.active) {
                this.enemy = enemy;
                this.scene.physics.world.overlap(this, enemy, this.laserHitsEnemy, null, this);
            }
        })
    }

    laserHitsEnemy() {
        this.enemy.setHealthDelta(-this.bulletDamage/500);
    }
    laserHitsShip() {
        if (this.isEnemyLaser && !this.ship.getInvincible()) {
            this.ship.setHealthDelta(-this.bulletDamage /500);
            if (!this.scene.playerEatinglaserBeam.isPlaying) {
               this.scene.playerEatinglaserBeam.play(); 
            }
        }
    }
}

class Bomb extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setActive(true);
        this.setVisible(false);
        this.scene = scene;
        this.ship = scene.ship;
        this.damageRadius = 300;
        this.pullRadius = 800;
        this.pullEnemies = false;
        this.bombFuse = 1000;
        this.blackHoleDuration = 2000;
        this.explosionDuration = 133;
        this.rechargeDelay = 10000;
        this.weaponReady = true;
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
        if (this.weaponReady == true) {
            this.weaponReady = false;
            const incrementInterval = 10;
            let percent = 0;
            const timer = setInterval(() => {
                percent += (incrementInterval / this.rechargeDelay);
                if (percent >= 1) {
                    percent = 1;
                    clearInterval(timer);
                    this.weaponReady = true;
                }
                this.scene.setSecondaryPercent(percent);
            }, incrementInterval);
            this.hasHit = false;
            console.log("dropped a bomb");            
            this.body.reset(x,y);
            this.setScale(5,5)
            this.body.setSize(10,10, 5)
            this.setActive(true);
            this.setVisible(true);
            this.setDepth(5);
            this.setVelocity(velocityX, velocityY)
            this.body.setDrag(this.dragValue, this.dragValue)
            this.scene.blackHoleInterference.play();
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
        this.scene.blackHoleInterference.stop();
        this.scene.blackHoleBomb.play();
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
        this.scene.displayTintOverlay('0xffffff');
        this.setVisible(false);
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.iterateOverEnemyTypeGroup(this.scene.enemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.orangeEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.blueEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.rainbowEnemyGroup);

        this.iterateOverEnemyTypeGroup(this.scene.scrapGroup);
        this.iterateOverEnemyTypeGroup(this.scene.healthKitGroup);
        this.iterateOverEnemyTypeGroup(this.scene.asteroidGroup);
        if (this.explosionActive) {
            const distToShip = Phaser.Math.Distance.BetweenPoints(this, this.ship);
            if (distToShip < this.damageRadius) {
                this.hitsShip();
            }
        }
    }
    iterateOverEnemyTypeGroup(group) {
        group.children.iterate((enemy) => {
            this.enemy = enemy;
            if (enemy.active) {
                const distToEnemy = Phaser.Math.Distance.BetweenPoints(this, enemy);
                if (this.pullEnemies) {
                    const angleToBomb = Phaser.Math.Angle.BetweenPoints(enemy, this);
                    const angle = Phaser.Math.RadToDeg(angleToBomb);
                    if (distToEnemy > 0 && distToEnemy < this.pullRadius) {
                        enemy.setVelocityX(100 + 1/distToEnemy * 50000 * Math.cos(angle))
                        enemy.setVelocityY(100 + 1/distToEnemy * 50000 * Math.sin(angle))
                    }
                }
                if (this.explosionActive) {
                    if (distToEnemy < this.damageRadius) {
                        if (enemy instanceof Asteroid) {
                            enemy.setActive(false);
                            enemy.setVisible(false);
                        } else if (enemy instanceof Scrap) {
                            enemy.setVelocity(0,0);
                        } else if (enemy instanceof HealthKit) {
                            enemy.setVelocity(0,0);
                        } else {
                            this.hitsEnemy();
                        }
                    }
                }
            }
        })
    }
    hitsShip() {
        this.ship.setHealthDelta(-this.ship.bulletDamage /10)
    }
    hitsEnemy() {
        this.enemy.setHealthDelta(-this.ship.bulletDamage/10)
    }
}

class WeaponGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, weaponSprite, weaponType) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: weaponType,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: weaponSprite
        })
    }
    fireLaser(x, y, alpha, shooter) {
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y, alpha, shooter)
        }
    }
}

class RocketGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, weaponSprite, weaponType) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: weaponType,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: weaponSprite
        })
        this.weaponReady = true;
        this.timer;
        this.energyPercent = 1;
        this.rechargeDelay = 5000;
        this.scene = scene;
    }
    fireLaser(x, y, alpha, shooter) {
        if (!this.weaponReady || this.energyPercent < 0.1) {return;}
        const laser = this.getFirstDead(false);
        if (!laser) { return; }
        this.weaponReady = false;
        laser.fire(x, y, alpha, shooter)
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.energyPercent -= 0.1;
        this.scene.setSecondaryPercent(this.energyPercent);
        this.scene.time.addEvent({
            delay: 200,
            callback: () => {
                this.weaponReady = true;
                 
            },
            callbackScope: this,
            loop: false,
        });
        this.scene.time.addEvent({
            delay: 4000,
            callback: () => {
                if (this.timer !== undefined) {
                    clearInterval(this.timer);
                }
                const incrementInterval = 10;
                this.timer = setInterval(() => {
                    this.energyPercent += (incrementInterval / this.rechargeDelay);
                    if (this.energyPercent >= 1) {
                        this.energyPercent = 1;
                        clearInterval(this.timer);
                    }
                    if (!this.isEnemyLaser) {
                        this.scene.setSecondaryPercent(this.energyPercent);
                    }
                }, incrementInterval);
            },
            callbackScope: this,
            loop: false,
        }); 
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
}

class Scrap extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.scene = scene;
        this.ship = scene.ship;
        this.postFX.addBloom(0xffff88, 1, 1, 1.5, 0.5);
        this.scrapValue = 25;
        this.dragValue = 300;
    }
    fire(x, y, alpha) {
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);
        this.body.setDrag(this.dragValue, this.dragValue)
        const endScale = 1.4;
        const duration = 1500;
        this.scene.tweens.add({
            targets: this,
            scaleX: endScale,
            scaleY: endScale,
            duration: duration,
            yoyo: true,
            repeat: -1
        });
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.homeToPlayer();
    }
    homeToPlayer() {
        const distToShip = Phaser.Math.Distance.BetweenPoints(this, this.ship);
        const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
        const angle = angleToShip//Phaser.Math.RadToDeg(angleToEnemy);
        if (distToShip > 0 && distToShip < 300) {
            this.setVelocityX((30000/distToShip) * Math.cos(angle))
            this.setVelocityY((30000/distToShip) * Math.sin(angle))
        }   
        if (distToShip < 20) {
            this.AbsorbIntoPlayer();
        }
    }
    AbsorbIntoPlayer() {
        this.scene.addPlayersScrap(this.scrapValue);
        this.setActive(false);
        this.setVisible(false);
    }
}

class HealthKit extends Scrap {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        this.healthValue = 100;
    }
    AbsorbIntoPlayer() {
        this.ship.setHealthDelta(this.healthValue);
        this.setActive(false);
        this.setVisible(false);
    }
}

class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.scene = scene;
        this.ship = scene.ship;
        this.kineticDamage = 50;
        this.body.setMass(20)
        this.postFX.addBloom(0xffffff, 1, 1, 1, 1);
    }
    fire(x, y, alpha) {
        // spawn at at random y to right of screen
        this.body.reset(this.scene.game.renderer.width*1.1, Math.random()*this.scene.game.renderer.height);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);
        this.hasHitShip = false;
        this.setVelocity(-100 + Math.random()*50, Math.random()*20)
        this.rotationSpeed = Math.random()*0.4-0.2;
    }
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.angle += this.rotationSpeed
        this.scene.physics.world.overlap(this, this.ship, this.HitsShip, null, this);
        if (this.x <= 0 || this.x >= this.scene.game.renderer.width*1.5 || this.y <= 0 || this.y >= this.scene.game.renderer.height) {
            this.setActive(false);
            this.setVisible(false);
            console.log("asteroid deleted!")
        }
    }
    HitsShip() {
        if (!this.ship.getInvincible() && !this.hasHitShip) {
            this.hasHitShip = true;
            this.ship.setImmobilised(true);
            const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
            const bounceAngle = Phaser.Math.RadToDeg(angleToShip)
            this.ship.setVelocity(Math.cos(bounceAngle) * 1000, Math.sin(bounceAngle) * 1000);
            this.scene.time.addEvent({
                delay: 300,
                callback: () => {
                    this.ship.setImmobilised(false);
                    this.hasHitShip = false;
                },
                callbackScope: this,
                loop: false,
            });
            const damage = this.kineticDamage - this.ship.getHullCollisionDamage();
            if (damage > 0) {
                this.scene.laserDamage.play();
                this.ship.setHealthDelta(-damage);
                this.scene.displayTintOverlay('0xff0000');
            }
            this.scene.hullCollision.play();
        }
    }
}

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setDepth(2);
        this.setCollideWorldBounds(true);
        this.body.setMass(10)
        this.dragValue = 800;
        this.body.setDrag(this.dragValue, this.dragValue)

        this.isShooting = false;
        this.shootFromFirstPosition = true;

        this.lastFired = 0;
        this.maxHealth = 1000;
        this.health = 1000;
        this.flySpeed = 400;
        this.bulletDamage = 50;
        this.bulletSpeed = 900;
        this.fireRate = 250;

        this.hullCollisionDamage = 20;
        this.hasHitEnemy = false;
    
        this.points = 0;
        this.scrap = 0;
        this.energy = 100;
        this.energyGeneration = 10;
        this.energyUsage = 1;
        this.dodgeDelay = 3000;
        this.dodgeReady = true;
        this.invincible = false;
        this.immobilised = false;

        this.secondary = '';

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
    }
    setSecondary(secondary) {this.secondary = secondary;}
    setInvincible(active) {this.invincible = active;}
    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.scene.healthRechargeBar.setPercent(healthPercent);
    }
    setMaxHealthDelta(delta) {
        this.maxHealth += delta;
        this.health += delta;
        this.updateHealthBar();
    }
    getMaxHealth() {return this.maxHealth;}
    setHealthDelta(delta) {
        if (this.health + delta > this.maxHealth) {
            this.health = this.maxHealth;
        } else {
            this.health += delta; 
        }
        this.updateHealthBar();
    }
    setHealth(delta) {
        this.health += delta;
        this.updateHealthBar();
    }
    resetHealth() {
        this.health = this.maxHealth;
        this.updateHealthBar();
    }
    getHealth() {return this.health;}
    getScrap() {return this.scrap;}
    setScrapDelta(delta) {this.scrap += delta;}
    getPoints() {return this.points;}
    setPointsDelta(delta) {this.points += delta;}
    getBulletDamage() {return this.bulletDamage;}
    setBulletDamageDelta(delta) {this.bulletDamage += delta;}
    getBulletSpeed() {return this.bulletSpeed;}
    getFireRate() {return this.fireRate;}
    setFireRateDelta(delta) {this.fireRate += delta;}
    getInvincible() {return this.invincible;}
    setImmobilised(active) {this.immobilised = active;}
    getHullCollisionDamage() {return this.hullCollisionDamage;}
    getAngle() {return this.angle;}
    setAngle(angle) {this.angle = angle;}
    getSecondary() {return this.secondary;}
    getDodgeReady() {return this.dodgeReady;}
    setDodgeReady(active) {this.dodgeReady = active;}
    getDodgeDelay() {return this.dodgeDelay;}
    getFlySpeed() {return this.flySpeed;}
    setFlySpeedDelta(delta) {this.flySpeed += delta;}
    preUpdate() {
        this.iterateOverEnemyTypeGroup(this.scene.enemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.orangeEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.blueEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.rainbowEnemyGroup);
    }
    iterateOverEnemyTypeGroup(group) {
        group.children.iterate((enemy) => {
            this.enemy = enemy;
            if (enemy.active) {
                this.scene.physics.world.overlap(this, enemy, this.hitsEnemy, null, this);
            }
        })
    }
    hitsEnemy() {
        if (!this.hasHitEnemy) {
            this.hasHitEnemy = true;
            const angleToEnemy = Phaser.Math.Angle.BetweenPoints(this, this.enemy);
            const bounceAngle = Phaser.Math.RadToDeg(angleToEnemy)
            this.enemy.setVelocity(Math.cos(bounceAngle) * 500, Math.sin(bounceAngle) * 500);
            this.scene.time.addEvent({
                delay: 300,
                callback: () => {
                    this.hasHitEnemy = false;
                },
                callbackScope: this,
                loop: false,
            });
            this.enemy.setHealthDelta(-this.hullCollisionDamage);
            this.scene.hullCollision.play();
        }
        
    }
}

class RechargeBar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, icon, colour) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setActive(true);
        this.setVisible(true);
        this.percent = 1;
        this.icon = this.scene.add.sprite(x+5, y - 20, icon).setDepth(2);;
        this.colour = colour;
        this.rechargeBar = this.scene.add.graphics({fillStyle: {color: 0x111111} });
        this.rechargeBar.fillRect(x, y, 10, 100);
        this.rechargeBarFill = this.scene.add.graphics();
        this.rechargeBarFill.fillStyle(colour);
        this.rechargeBarFill.setDepth(5);
        this.rechargeBarFill.postFX.addBloom(0xffffff, 0.5, 0.5, 2, 1, 4);
        this.setPercent(this.percent);
    }
    setPercent(percent) {
        this.rechargeBarFill.clear();
        this.rechargeBarFill.fillStyle(this.colour);
        const fillHeight = 100 * percent;
        this.rechargeBarFill.fillRect(this.x, this.y+100, 10, -fillHeight);
    }
    destroy() {
        this.icon.destroy();
        this.rechargeBar.destroy();
        this.rechargeBarFill.destroy();
    }
}

class StageManager {
    constructor(scene) {
        this.scene = scene;
        this.readyForNextStage = true;
        // this.stageX = [default, orange, blue, rainbow, asteroid] enemy types
        this.stage1 = [1, 0, 0, 0, 0];
        //this.stage1 = [5, 2, 0, 0, 5];
        this.stage2 = [10, 6, 5, 1, 20];
        this.stages = [this.stage1, this.stage2]
        this.currentStage = 0;
    }
    setReadyForNextStage(active) {
        this.readyForNextStage = active;
        this.backgroundfx = this.scene.background.preFX.addColorMatrix();
        this.backgroundfx.hue(Math.random()*360);
        this.backgroundfx2 = this.scene.background.preFX.addColorMatrix();
        this.backgroundfx2.brightness(0.9);
    }
    stageAction() {
        if (this.currentStage == this.stages.length) {
            this.scene.displayTooltip(`PREPARE FOR BOSS...`, true);
            return;
        }
        if (!this.readyForNextStage) {return;}
        this.scene.displayTooltip(`stage ${this.currentStage + 1} begin!`, true);
        const sum = this.stages[this.currentStage].reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        if (sum < 1) {
            if (!this.checkActiveEnemies()) {
                this.scene.displayTooltip("stage win!", true);
                this.readyForNextStage = false;
                this.scene.onTimerComplete();
                this.currentStage += 1;
                return;
            }  
        }
        const lottery = Math.random();
        let combinedTickets = 0;
        for (let i=0; i<5; i++) {
            let currentRoundTickets = this.stages[this.currentStage][i]/sum;
            combinedTickets += currentRoundTickets;
            if (lottery <= combinedTickets) {
                this.spawnByIndex(i);
                this.stages[this.currentStage][i] -= 1;
                break;
            }
        }
    }
    spawnByIndex(index) {
        if (index == 0) {
            this.scene.spawnEnemySomewhere(this.scene.enemyGroup);
        } else if (index == 1) {
            this.scene.spawnEnemySomewhere(this.scene.orangeEnemyGroup);
        } else if (index == 2) {
            this.scene.spawnEnemySomewhere(this.scene.blueEnemyGroup);
        } else if (index == 3) {
            this.scene.spawnEnemySomewhere(this.scene.rainbowEnemyGroup);
        } else if (index == 4) {
            this.scene.asteroidGroup.fireLaser();
        } 
    }
    checkActiveEnemies() {
        if (this.iterateOverEnemyTypeGroup(this.scene.enemyGroup)) {return true;}
        if (this.iterateOverEnemyTypeGroup(this.scene.orangeEnemyGroup)) {return true;}
        if (this.iterateOverEnemyTypeGroup(this.scene.blueEnemyGroup)) {return true;}
        if (this.iterateOverEnemyTypeGroup(this.scene.rainbowEnemyGroup)) {return true;}
        return false;
    }
    iterateOverEnemyTypeGroup(group) {
        let anyActive = false;
        group.children.iterate((enemy) => {
            if (enemy.active) {
                anyActive = true;   
            }
        });
        return anyActive;
    }
}

export class PlayScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.PLAY
        })
        this.playerDeathHasPlayed = false;
        this.stageActionReady = true;
    }

    init(data) {
        console.log(data);
        this.backgroundSpeed = 3;
        this.timeTillGunReady = 2;
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouse1down = false;
        this.mouse2down = false;
        this.dropLoop = this.scene.get("MENU").data.get("dropLoop");
        this.buildupBar = this.scene.get("MENU").data.get("buildupBar");
    }

    preload() {
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/enemy.png");
        this.load.image('orangeEnemy', "../../assets/images/OrangeEnemy.png");
        this.load.image('blueEnemy', "../../assets/images/BlueEnemy.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
        this.load.image('distort', 'assets/images/phaser/noisebig.png');
        this.load.image('blackHoleIcon', 'assets/images/black-hole-icon.png');
        this.load.image('laserBeamIcon', 'assets/images/laser-beam-icon.png');
        this.load.spritesheet('rocket', '../../assets/images/MissileSprite.png', {
            frameWidth: 35,
            frameHeight: 16,
        });
        this.load.image('beamLaser', "../../assets/images/star fighter max long blue.png");
        this.load.image('beamLaserRed', "../../assets/images/star fighter max long red.png");
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
        this.load.spritesheet('rainbowEnemy', 'assets/images/GoldenRainbowEnemy.png', {
            frameWidth: 52,
            frameHeight: 59,
        });
        this.load.image('scrap', "../../assets/images/scrap-simple.png");
        this.load.image('healthkit', "../../assets/images/health-kit-simple.png");
        this.load.image('heart', "../../assets/images/heart.png");
        this.load.image('dodgeIcon', "../../assets/images/dodge-icon.png");
        this.load.image('asteroid', "../../assets/images/asteroid-simple.png");
        this.load.image('deathFireParticle', "../../assets/images/death-fire-simple.png");
        this.load.image('spawnFlash', "../../assets/images/spawn-flash-simple.png");
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
        this.load.audio("scrap_pick_up", "../../assets/sfx/scrap-pick-up-01.mp3");
        this.load.audio("enemy_explosion", "../../assets/sfx/enemy-ship-exploding.mp3");
        this.load.audio("dodge_sound", "../../assets/sfx/star-fighter-ship-booster-dodge.mp3");
        this.load.audio("thruster", "../../assets/sfx/player-ship-thruster.mp3");
        this.load.audio("laser_beam_firing", "../../assets/sfx/laser-beam-firing.mp3");
        this.load.audio("laser_beam_firing_end", "../../assets/sfx/laser-beam-firing-ending.mp3");
        this.load.audio("player_eating_laser", "../../assets/sfx/player-eating-laser-beam.mp3");
        this.load.audio("player_eating_laser_end", "../../assets/sfx/player-eating-laser-beam-end.mp3");
        this.load.audio("digitalInterference", "../../assets/sfx/digital-interference.mp3");
        this.load.audio("blackHoleImplosion", "../../assets/sfx/black-hole-implosion.mp3");
        this.load.audio("shop_intro", "../../assets/music/shop-theme-fratellis-cover-intro.mp3");
        this.load.audio("shop_loop", "../../assets/music/shop-theme-fratellis-cover-loop.mp3");
        this.load.audio("shop_purchase", "../../assets/sfx/scrap-pick-up-03.mp3");

    }

    create() {
        this.addShip();

        this.zapGun1 = this.sound.add("zap_gun_1", {volume: 0.6})
        this.laserDamage = this.sound.add("laser_damage", {volume: 0.5})
        this.shopZap = this.sound.add("shop_zap")
        this.shopUpgradeMeaty = this.sound.add("shop_upgrade_meaty")
        this.repairHammer = this.sound.add("repair_hammering");
        this.repairDrill = this.sound.add("repair_drill");
        this.rocketWeapon = this.sound.add("rocket_weapon");
        this.scrapSound = this.sound.add("scrap_pick_up");
        this.hullCollision = this.sound.add("enemy_explosion");
        this.dodgeSound = this.sound.add("dodge_sound");
        this.thruster = this.sound.add("thruster", {volume: 0.3});
        this.laserBeamFiring = this.sound.add("laser_beam_firing", {volume: 1});
        this.laserBeamFiringEnding = this.sound.add("laser_beam_firing_end", {volume: 1});
        this.playerEatinglaserBeam = this.sound.add("player_eating_laser", {volume: 1});
        this.playerEatingLaserBeamEnd = this.sound.add("player_eating_laser_end", {volume: 1});
        this.blackHoleInterference = this.sound.add("digitalInterference", {volume: 1})
        this.blackHoleBomb = this.sound.add("blackHoleImplosion", {volume: 1})
        this.shopIntro = this.sound.add("shop_intro", {volume: 1})
        this.shopLoop = this.sound.add("shop_loop", {volume: 1, loop: true})
        this.shopPurchase = this.sound.add("shop_purchase", {volume: 1})

        this.laserGroupBlue = new WeaponGroup(this, 'laser', Laser);
        this.laserGroupRed = new WeaponGroup(this, 'laserRed', Laser);
        this.rocketGroup = new RocketGroup(this, 'rocket', Rocket)
        this.beamLaser = new BeamLaser(this, 0, 0, 'beamLaser', false);
        this.enemyBeamLaser = new BeamLaser(this, 0, 0, 'beamLaserRed', true);
        this.bomb = new Bomb(this, 0, 0, 'bomb');
        this.enemyGroup = new EnemyGroup(this, 'enemy', Enemy);
        this.orangeEnemyGroup = new EnemyGroup(this, 'orangeEnemy', OrangeEnemy);
        this.blueEnemyGroup = new EnemyGroup(this, 'blueEnemy', BlueEnemy);
        this.rainbowEnemyGroup = new EnemyGroup(this, 'rainbowEnemy', RainbowEnemy);

        this.healthPercent = this.add.bitmapText(40, this.game.renderer.height * 0.95, 'atari-classic', 'init', 20).setDepth(2).setTint('0xff0024');
        this.healthPercent.postFX.addBloom(0xffffff, 0.5, 0.5, 2, 1, 4);
        this.healthRechargeBar = new RechargeBar(this, 80, this.game.renderer.height*0.8, 'heart', '0xff0024');
        this.dodgeRechargeBar = new RechargeBar(this, 120, this.game.renderer.height*0.8, 'dodgeIcon', '0xccccff');

        this.scrapGroup = new WeaponGroup(this, 'scrap', Scrap);
        this.healthKitGroup = new WeaponGroup(this, 'healthkit', HealthKit);
        this.asteroidGroup = new WeaponGroup(this, 'asteroid', Asteroid);

        this.sound.volume = 0.05;
        this.background = this.add.tileSprite(0,0, this.game.renderer.width, this.game.renderer.height, "star_background").setOrigin(0).setDepth(-1);
        this.background.preFX.addBarrel(0.5);

        this.physics.add.existing(this.ship, 0);
        this.ship.body.collideWorldBounds = true;

        let menuButton = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text").setDepth(2);
        let menuButtonHover = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text_hover").setDepth(2).setVisible(0);

        this.scoreCounter = this.add.bitmapText(this.game.renderer.width -300, this.game.renderer.height * 0.95, 'atari-classic', '0 pts', 20).setDepth(2);
        this.scrapCounter = this.add.bitmapText(this.game.renderer.width -600, this.game.renderer.height * 0.95, 'atari-classic', '0', 20).setDepth(2);
        this.scrapIcon = this.add.image(this.game.renderer.width -630, this.game.renderer.height * 0.96, "scrap").setDepth(2);
        this.tooltipText = this.add.bitmapText(100, this.game.renderer.height * 0.5, 'atari-classic', 'Tooltip', 20).setVisible(false).setDepth(2);

        this.hudDamageStat = this.add.bitmapText(this.game.renderer.width - 200, this.game.renderer.height /2 - 40, 'atari-classic', 'DMG', 15).setVisible(true).setDepth(2);
        this.hudFireRateStat = this.add.bitmapText(this.game.renderer.width - 200, this.game.renderer.height /2 - 20, 'atari-classic', 'FR', 15).setVisible(true).setDepth(2);
        this.hudBulletSpeedStat = this.add.bitmapText(this.game.renderer.width - 200, this.game.renderer.height /2, 'atari-classic', 'FR', 15).setVisible(true).setDepth(2);
        this.hudHullCollisionDamageStat = this.add.bitmapText(this.game.renderer.width - 200, this.game.renderer.height /2 + 20, 'atari-classic', 'HCD', 15).setVisible(true).setDepth(2);
        this.hudFlySpeedStat = this.add.bitmapText(this.game.renderer.width - 200, this.game.renderer.height /2 + 40, 'atari-classic', 'FS', 15).setVisible(true).setDepth(2);
        
        this.greenUpgradeStat = this.add.bitmapText(this.game.renderer.width - 60, this.game.renderer.height /2 - 40, 'atari-classic', '+10', 15).setVisible(false).setDepth(2).setTint('0x00ff00');
        this.greenUpgradeStat.postFX.addBloom(0xffffff, 0.25, 0.25, 1, 1, 4);

        this.redUpgradeCost = this.add.bitmapText(this.game.renderer.width -600, this.game.renderer.height * 0.91, 'atari-classic', '+10', 18).setVisible(false).setDepth(2).setTint('0xff0000');
        this.redUpgradeCost.postFX.addBloom(0xffffff, 0.25, 0.25, 1, 1, 4);

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

        this.input.on('pointermove', pointer => {
            this.mouseX = pointer.x;
            this.mouseY = pointer.y;
        })

        this.input.on('pointerdown', (pointer) => {
            if (pointer.button == 0) {
                this.mouse1down = true;
            } else if (pointer.button == 2) {
                this.mouse2down = true;
            }
        })
        this.input.on('pointerup', (pointer) => {
            if (pointer.button == 0) {
                this.mouse1down = false;
            } else if (pointer.button == 2) {
                this.mouse2down = false;
                if (this.ship.getSecondary() == 'laserBeam') {
                    this.beamLaser.stopFiring();
                }
            }
        })

        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.stageManager = new StageManager(this);
    }

    update() {
        if (this.stageActionReady) {
            this.stageActionReady = false;
            this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.stageManager.stageAction();
                this.stageActionReady = true;
            },
            callbackScope: this,
            loop: false,
        });
        }
        this.angleShipToMouse();
        this.moveBackground(this.background, this.backgroundSpeed);
        if (this.checkPlayerAlive()) {
            this.playerMove();
            const shipAngleRad = Phaser.Math.DegToRad(this.ship.getAngle());
            const shipSecondary = this.ship.getSecondary();
            if (this.mouse2down || this.keyE.isDown) {
                if (shipSecondary == 'bomb') {
                    this.bomb.fire(this.ship.x, this.ship.y, shipAngleRad, this.ship.body.velocity.x, this.ship.body.velocity.y);
                } else if (shipSecondary == 'laserBeam') {
                    const offsetX = Math.cos(shipAngleRad) * 1080;
                    const offsetY = Math.sin(shipAngleRad) * 1080;
                    this.beamLaser.fire(this.ship.x + offsetX, this.ship.y + offsetY, shipAngleRad, this.ship);
                } else if (shipSecondary == 'rocket') {
                    this.shootWeaponByGroup(this.rocketGroup);
                }
            }
            if (Phaser.Input.Keyboard.JustUp(this.keyE)) {
                if (shipSecondary == 'laserBeam') {
                    this.beamLaser.stopFiring();
                }
            }
            if (this.keySpace.isDown || this.keyShift.isDown) {
                if (this.ship.getDodgeReady()) {
                    this.ship.setDodgeReady(false);
                    this.dodgeRoll();
                }
            }
            if (this.timeTillGunReady <= 0) {
                if (this.mouse1down) {
                    this.zapGun1.play();
                    this.timeTillGunReady = 125/this.ship.getFireRate();
                    this.shootWeaponByGroup(this.laserGroupBlue);
                }   
            } else {
                this.timeTillGunReady -= 0.016;
            }
        };
    }
    
    changeSecondary(secondary) {
        this.ship.setSecondary(secondary);
        let icon = '';
        let colour = '';
        if (secondary == "bomb") {
            icon = 'blackHoleIcon';
            colour = '0x4921ad';
        } else if (secondary == "rocket") {
            icon = "rocket";
            colour = "0xff0000";
        } else if (secondary == "laserBeam") {
            icon = "laserBeamIcon";
            colour = "0x2600ff";
        }
        if (this.secondaryRechargeBar) {
            this.secondaryRechargeBar.destroy();
        }
        this.secondaryRechargeBar = new RechargeBar(this, 160, this.game.renderer.height*0.8, icon, colour);
        this.shopPurchase.play();
    }

    setSecondaryPercent(percent) {
        this.secondaryRechargeBar.setPercent(percent);
    }

    playerMove() {
        if (this.keyW.isDown || this.keyS.isDown || this.keyA.isDown || this.keyD.isDown) {
            if (!this.thruster.isPlaying) {
                this.thruster.play();
                this.ship.play('thrustersOn');
            } 
            if (!this.ship.immobilised) {
                if (this.keyW.isDown) {
                    this.ship.setVelocityY(-this.ship.flySpeed)
                } 
                if (this.keyS.isDown) {
                    this.ship.setVelocityY(this.ship.flySpeed)
                } 
                if (this.keyA.isDown) {
                    this.ship.setVelocityX(-this.ship.flySpeed)
                } 
                if (this.keyD.isDown) {
                    this.ship.setVelocityX(this.ship.flySpeed)
                } 
            }
        } else {
            if (this.thruster.isPlaying) {
                this.thruster.stop();
            } else {
                this.ship.play('still');
            }
        }
        
    }

    angleShipToMouse() {
        const angleToMouse = Phaser.Math.Angle.Between(this.mouseX, this.mouseY, this.ship.x, this.ship.y);
        this.ship.angle = Phaser.Math.RadToDeg(angleToMouse) + 180;
    }

    moveBackground(background, speed) {
        background.tilePositionX += speed;
    }

    displayTintOverlay(colour) {
        this.damageOverlay.setVisible(1);
        this.damageOverlay.setFillStyle(colour, 1);
        this.damageOverlay.setAlpha(0);
        this.damageOverlay.setDepth(9999);
        const duration = 200;
        this.tweens.add({
            targets: this.damageOverlay,
            alpha: 0.5,
            duration: duration / 2,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.damageOverlay.setVisible(0);
            }
        });
    }

    checkPlayerAlive() {
        const health = this.ship.getHealth();
        this.healthPercent.setText(`${Math.round(health)}%`);
        if (health <= 0) {
            if (!this.playerDeathHasPlayed) {
                this.playerDeath();
                this.playerDeathHasPlayed = true;
            }
            return(false);
        }
        return(true);
    }

    addPlayersPoints(points) {
        this.ship.setPointsDelta(points);
        this.scoreCounter.setText(`${this.ship.getPoints()} pts`);
    }

    addPlayersScrap(scrap) {
        this.ship.setScrapDelta(scrap);
        this.scrapCounter.setText(`${this.ship.getScrap()}`);
        this.scrapSound.play();
    }

    subtractPlayerScrap(cost){
        this.ship.setScrapDelta(-cost);
        this.scrapCounter.setText(`${this.ship.getScrap()}`);
    }

    playerDeath() {
        console.log("YOU DIED!");
        this.dropLoop.stop();
    }

    shootWeaponByGroup(weaponGroup) {
        const laserSpawnDistance = 150;
        const shipAngleRad = Phaser.Math.DegToRad(this.ship.getAngle())
        const xOffset = Math.cos(shipAngleRad) * laserSpawnDistance;
        const yOffset = Math.sin(shipAngleRad) * laserSpawnDistance;
        weaponGroup.fireLaser(this.ship.x+ xOffset, this.ship.y + yOffset, shipAngleRad, this.ship);
    }

    spawnEnemy() {
        this.enemyGroup.spawnEnemy(this.ship.x, this.ship.y);
    }

    spawnEnemySomewhere(enemyType) {
        const randomX = Math.random() * (this.game.config.width - 0);
        const randomY = Math.random() * (this.game.config.height - 0);  
        enemyType.spawnEnemy(randomX, randomY);
    }

    addShip() {
        const centerX = this.game.renderer.width / 2;
        const centerY = this.game.renderer.height / 2;
        this.ship = new Player(this, centerX, centerY);
        this.ship.setCollideWorldBounds(true);
    }

    dodgeRoll() {
        this.dodgeSound.play();
        this.displayDodgeSmokeParticles();
        this.ship.setInvincible(true); 
        
        const incrementInterval = 10;
        let percent = 0;
        const timer = setInterval(() => {
            percent += (incrementInterval / this.ship.getDodgeDelay());

            if (percent >= 1) {
                percent = 1;
                clearInterval(timer);
                this.ship.setDodgeReady(true);
            }
            this.dodgeRechargeBar.setPercent(percent);
        }, incrementInterval);

        const angle = Phaser.Math.DegToRad(this.ship.getAngle());
        const XtoWarpTo = this.ship.x + 300*Math.cos(angle);
        const YtoWarpTo = this.ship.y + 300*Math.sin(angle);
        this.ship.body.reset(XtoWarpTo, YtoWarpTo)

        this.ship.setTint('0x8b8b8b');
        const duration = 1500;
        this.tweens.add({
            targets: this.ship,
            alpha: 0.5,
            duration: duration / 4,
            yoyo: true,
            repeat: 0,
            onComplete: () => {
                this.ship.clearTint();
                this.ship.setInvincible(false); 
            }
        });
    }

    displayDodgeSmokeParticles() {
        //if (this.flame === undefined) {
            this.smoke = this.add.particles(this.ship.x, this.ship.y, 'distort',
                {
                    color: [0xffffff, 0xffffff, 0xffffff, 0xffffff],
                    colorEase: 'quad.out',
                    lifespan: 300,
                    scale: { start: 0.01, end: 0, ease: 'sine.out' },
                    speed: 100,
                    advance: 300,
                    frequency: 3,
                    blendMode: 'ADD',
                    duration: 100,
                });
            this.smoke.setDepth(1);
            this.smoke.postFX.addBloom(0xffffff, 1, 1, 2, 1, 6);
            this.smoke.once("complete", () => {
                this.smoke.destroy();
            })
        //}
    }

    displayTooltip(tooltipText, active) {
        if (active) {
            this.tooltipText.setText(tooltipText);
            this.tooltipText.setVisible(true);
            return;
        }
        this.tooltipText.setVisible(false);
    }

    displayUpgradeStatTooltip(item, active) {
        this.greenUpgradeStat.setText(`+${10}`);
        this.redUpgradeCost.setText(`-${150}`);
        if (item == "EngineUpgrade") {
            this.greenUpgradeStat.y = this.game.renderer.height /2 + 40
            this.greenUpgradeStat.x = this.game.renderer.width - 60;
        } else if (item == "HealthUpgrade") {
            this.greenUpgradeStat.y = this.game.renderer.height * 0.955;
            this.greenUpgradeStat.x = 160;
        } else if (item == "FireRateUpgrade") {
            this.greenUpgradeStat.y = this.game.renderer.height /2 - 20;
            this.greenUpgradeStat.x = this.game.renderer.width - 60;
        } else if (item == "DamageUpgrade") {
            this.greenUpgradeStat.y = this.game.renderer.height /2 - 40;
            this.greenUpgradeStat.x = this.game.renderer.width - 60;
        } else if (item == "Repair") {
            this.greenUpgradeStat.y = this.game.renderer.height * 0.955;
            this.greenUpgradeStat.x = 160;
            const healthDelta = this.ship.getMaxHealth() - this.ship.getHealth();
            this.greenUpgradeStat.setText(`+${healthDelta}%`);
            this.redUpgradeCost.setText(`-${Math.round(healthDelta * 0.2)}`);
        } else if (item == "Exit") {
            this.greenUpgradeStat.setText("");
            this.redUpgradeCost.setText("");
        } else {
            this.redUpgradeCost.setText(`-${1000}`);
        }
        this.greenUpgradeStat.setVisible(active);
        this.redUpgradeCost.setVisible(active);
    }
    
    updateHudStatValues() {
        this.hudDamageStat.setText(`DMG: ${this.ship.getBulletDamage()}`);
        this.hudFireRateStat.setText(`FR: ${this.ship.getFireRate()}`);
        this.hudBulletSpeedStat.setText(`BS: ${this.ship.getBulletSpeed()}`);
        this.hudHullCollisionDamageStat.setText(`HCD: ${this.ship.getHullCollisionDamage()}`);
        this.hudFlySpeedStat.setText(`FS: ${this.ship.getFlySpeed()}`);
    }

    onTimerComplete() {
        var upgrades = [0,1,2,3],
        selectedAttributes = [],
        i = upgrades.length,
        j = 0;
    
        while (i--) {
            j = Math.floor(Math.random() * (i+1));
            selectedAttributes.push(upgrades[j]);
            upgrades.splice(j,1);
        }
        let randomWeapon = 0;
        const lottery = Math.random();
        if (lottery < 0.33) {
            randomWeapon = 0;
        } else if (lottery < 0.66) {
            randomWeapon = 1;
        } else {
            randomWeapon = 2;
        }
        this.shopSlideIn(selectedAttributes, randomWeapon);
    }

    shopBuyItem(purchase){
        if(purchase == "EngineUpgrade"){
            this.ship.setFlySpeedDelta(10);
            this.subtractPlayerScrap(150);
            this.shopUpgradeMeaty.play();
        } else if(purchase == "HealthUpgrade"){
            this.ship.setMaxHealthDelta(10);
            this.subtractPlayerScrap(150);
            this.shopUpgradeMeaty.play();
        } else if(purchase == "FireRateUpgrade"){
            this.ship.setFireRateDelta(10);
            this.subtractPlayerScrap(150);
            this.shopUpgradeMeaty.play();
        } else if(purchase == "DamageUpgrade"){
            this.ship.setBulletDamageDelta(10);
            this.subtractPlayerScrap(150);
            this.shopUpgradeMeaty.play();
        } else if(purchase == "Repair") {
            console.log("Repairing");
            const cost = this.ship.getMaxHealth() - this.ship.getHealth();
            this.subtractPlayerScrap(Math.round(cost * 0.2));
            this.ship.resetHealth();
            this.repairHammer.play();
            this.repairDrill.play();
        } else if (purchase == "Exit") {
            this.shopSlideOut(this.shopImage);
            this.slideOutTweenButtons(this.buttons);
            this.stageManager.setReadyForNextStage(true);
        } else if (purchase == "rocket") {
            this.subtractPlayerScrap(1000);
            this.changeSecondary("rocket");
        } else if (purchase == "blackHoleIcon") {
            this.subtractPlayerScrap(1000);
            this.changeSecondary("bomb");
        } else if (purchase == "laserBeamIcon") {
            this.subtractPlayerScrap(1000);
            this.changeSecondary("laserBeam");
        } 
        this.updateHudStatValues();
    }

    shopItemDescription(item){
        if(item == "EngineUpgrade"){
            return "Upgrades ship speed";
        } else if(item == "HealthUpgrade"){
            return "Upgrades hull health";
        } else if(item == "FireRateUpgrade"){
            return "Upgrades ship firerate";
        } else if(item == "DamageUpgrade"){
            return "Upgrades ship damage";
        } else if(item == "Repair") {
            return "Repair ship hull";
        } else if(item == "Exit") {
            return "Leave shop and begin next stage";
        } else if(item == "rocket") {
            return "Homing rocket secondary";
        } else if(item == "blackHoleIcon") {
            return "Black hole bomb secondary";
        } else if(item == "laserBeamIcon") {
            return "Laser beam secondary";
        }
    }

    shopSlideIn(Attributes, randomWeapon){
        this.backgroundSpeed = 0.2;
        this.dropLoop.stop();
        this.shopIntro.play();
        this.shopIntro.on('complete', () => {
            this.shopLoop.play();
        });
        const scale = 3;
        const attributeAssets = ["EngineUpgrade", "HealthUpgrade", "FireRateUpgrade", "DamageUpgrade"];
        const weaponAssets = ["rocket", "blackHoleIcon", "laserBeamIcon"];

        this.load.image('shop', "../../assets/images/shop.png");
        this.load.image('shopWindow', "../../assets/images/shopWindow.png");
        this.load.image('LeaveShop', "../../assets/images/LeaveShop.png");
        this.load.image('RepairShip', "../../assets/images/RepairShip.png");

        this.load.image('EngineUpgrade', "../../assets/images/EngineUpgrade.png");
        this.load.image('HealthUpgrade', "../../assets/images/HealthUpgrade.png");
        this.load.image('FireRateUpgrade', "../../assets/images/FireRateUpgrade.png");
        this.load.image('DamageUpgrade', "../../assets/images/DamageUpgrade.png");

        //this.load.image('MissileUpgrade', "../../assets/images/MissileUpgrade.png");
        this.shopImage = this.add.image(this.game.config.width, this.game.config.height / 2, 'shop');

        this.shopImage.setOrigin(0, 0.5);

        this.slideInTween = this.tweens.add({
            targets: this.shopImage,
            x: this.game.config.width / 1.3,
            duration: 1000,
            ease: 'Power2',
            paused: true,
            onComplete: () => {
                var shopwindow = this.add.image(0,0, 'shopWindow').setOrigin(0,0);
                var LeaveShopButton = this.add.image(136*scale,68*scale, 'LeaveShop').setOrigin(0).setInteractive();
                var RepairShipButton = this.add.image(163*scale,68*scale, 'RepairShip').setOrigin(0).setInteractive();
                var Upgrade_1_Button = this.add.image(13*scale,13*scale, attributeAssets[Attributes[0]]).setOrigin(0).setInteractive();
                var Upgrade_2_Button = this.add.image(67*scale,13*scale, attributeAssets[Attributes[1]]).setOrigin(0).setInteractive();
                var Upgrade_3_Button = this.add.image(13*scale,58*scale, attributeAssets[Attributes[2]]).setOrigin(0).setInteractive();
                var Upgrade_4_Button = this.add.image(67*scale,58*scale, attributeAssets[Attributes[3]]).setOrigin(0).setInteractive();
                var WeaponButton = this.add.image(140*scale,20*scale, weaponAssets[randomWeapon]).setOrigin(0).setInteractive()

                this.buttons = [shopwindow, LeaveShopButton, RepairShipButton, Upgrade_1_Button, Upgrade_2_Button, Upgrade_3_Button, Upgrade_4_Button, WeaponButton];
                //upgrades scale
                Upgrade_1_Button.setScale(scale);
                Upgrade_2_Button.setScale(scale);
                Upgrade_3_Button.setScale(scale);
                Upgrade_4_Button.setScale(scale);

                //Weapon scale
                WeaponButton.setScale(scale);

                //Shop basics scale
                LeaveShopButton.setScale(scale/5);
                RepairShipButton.setScale(scale/5);
                shopwindow.setScale(scale);
        
                var shopContainer = this.add.container(32,70, this.buttons, Phaser.Geom.Rectangle.Contains)
                
                this.interactiveShopButton(Upgrade_1_Button, attributeAssets[Attributes[0]]);
                this.interactiveShopButton(Upgrade_2_Button, attributeAssets[Attributes[1]]);
                this.interactiveShopButton(Upgrade_3_Button, attributeAssets[Attributes[2]]);
                this.interactiveShopButton(Upgrade_4_Button, attributeAssets[Attributes[3]]);
                this.interactiveShopButton(RepairShipButton, "Repair");
                this.interactiveShopButton(LeaveShopButton, "Exit");
                this.interactiveShopButton(WeaponButton, weaponAssets[randomWeapon]);
            }
        });
        this.slideInTween.play();
        this.shopZap.play();
    }

    slideOutTweenButtons(targets) {
        const duration = 2000;
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
        this.shopLoop.stop();
        this.buildupBar.play();
        this.buildupBar.on('complete', () => {
            this.dropLoop.play();
        });

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

    interactiveShopButton(button, item) {
        button.on("pointerover", () => {
            this.displayTooltip(this.shopItemDescription(item), true);
            this.displayUpgradeStatTooltip(item, true);
        });
        button.on('pointerup', function () {
            this.shopBuyItem(item);
        }, this);
        button.on("pointerout", () => {
            this.displayTooltip("", false);
            this.displayUpgradeStatTooltip("", false);
        });
    }
}
