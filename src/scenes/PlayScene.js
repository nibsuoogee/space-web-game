import { CST } from "../CST.js";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this, 0);

        this.ship;
        this.scene = scene;
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

    spawn(x, y, ship) {
        this.scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.ship = ship;
        this.health = 100;
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
            this.scene.scrapGroup.fireLaser(this.x, this.y, 0);
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
    
}

class OrangeEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'orangeEnemy');
        scene.add.existing(this);
        scene.physics.add.existing(this, 0);

        this.ship;
        this.scene = scene;
        this.timeSinceShot = 4;
        this.gunDelay = 4;

        this.fireRate = 0.016;
        this.lastFired = 0;
        this.hullCollisionDamage = 50;
        this.flySpeed = 600;
        this.bulletDamage = 10;
        this.bulletSpeed = 500;

        this.dragValue = 300;
        this.movementDelay = 1;
        this.moveForTime = 1000
        this.timeSinceMovement = 0.5;
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
    constructor(scene, x, y) {
        super(scene, x, y, 'blueEnemy');
        scene.add.existing(this);
        scene.physics.add.existing(this, 0);

        this.ship;
        this.scene = scene;
        this.timeSinceShot = 4;
        this.gunDelay = 6;
        this.recharge = 0.01;
        this.aimAngle = 0;

        this.lastFired = 0;
        this.hullCollisionDamage = 50;
        this.flySpeed = 300;
        this.bulletDamage = 10;
        this.bulletSpeed = 1000;

        this.dragValue = 300;
        this.movementDelay = 2;
        this.moveForTime = 1000
        this.timeSinceMovement = 0.5;
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
    constructor(scene, x, y) {
        super(scene, x, y, 'rainbowEnemy');
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
        this.flySpeed = 1200;
        this.bulletDamage = 10;

        this.dragValue = 300;
        this.movementDelay = 1;
        this.moveForTime = 1000
        this.timeSinceMovement = 0.5;

        this.anims.create({
            key: 'RainbowAnimation',
            frames: this.anims.generateFrameNumbers('rainbowEnemy', {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });

    }

    spawn(x, y, ship) {
        this.scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        this.ship = ship;
        this.health = 100;
        this.body.reset(x,y);
        this.displayParticles('spawnFlash');
        this.setDepth(1);
        this.setActive(true);
        this.setVisible(true);
        this.body.setDrag(this.dragValue, this.dragValue)
        this.healthText = this.scene.add.bitmapText(this.x, this.y + 50, 'atari-classic', 'HP', 12).setVisible(true).setDepth(2);
        this.healthText.setTint(0xff0000);
        this.play('RainbowAnimation');
    }

    checkHealth() {
        if (this.health <= 0) {
            this.displayParticles('deathFireParticle');
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
            this.setActive(false);
            this.setVisible(false);
            this.scene.addPlayersPoints(10);
            this.healthText.setVisible(false);
        } else {
            this.healthText.setPosition(this.x - 20, this.y - 50);
            this.healthText.setText(`${Math.round(this.health)}`)
        }
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

class BeamLaser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, canDamagePlayer) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setActive(false);
        this.setVisible(false);
        this.scene = scene;
        this.ship = scene.ship;
        this.canDamagePlayer = canDamagePlayer;
        this.enemy;
        this.bulletDamage;

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
        if (!this.isFiring) {
            this.isFiring = true;
            this.body.reset(x, y);
            this.setActive(true);
            this.setVisible(true);
            this.setDepth(1);
            this.bulletDamage = shooter.bulletDamage;
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
        if (this.scene.playerEatinglaserBeam.isPlaying) {
            this.scene.playerEatinglaserBeam.stop(); 
            this.scene.playerEatingLaserBeamEnd.play(); 
         }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
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
        this.enemy.health -= this.bulletDamage/500;
    }
    laserHitsShip() {
        if (this.canDamagePlayer && !this.ship.invincible) {
            this.ship.health -= this.bulletDamage /500;
            if (!this.scene.playerEatinglaserBeam.isPlaying) {
               this.scene.playerEatinglaserBeam.play(); 
            }
        }
    }
}

class Rocket extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        //scene.physics.world.enable(this); off so that lasers don't collide and transfer kinetic energy
        this.scene = scene;
        this.ship = scene.ship;
        this.projectileSpeed = 900;
        this.dragValue = 1000;
        this.hasHit = false;
        this.enemy;
        this.lockedOnEnemy = undefined;;

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
        this.body.setDrag(this.dragValue, this.dragValue)
        this.angle = Phaser.Math.RadToDeg(alpha);
        this.play('rocketAnimation');
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.hasHit) {
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
        this.setVisible(false);
        this.scene = scene;
        this.ship = scene.ship;
        this.enemy;

        this.damageRadius = 300;
        this.pullRadius = 800;
        this.pullEnemies = false;
        this.bombFuse = 1000;
        this.blackHoleDuration = 2000;
        this.explosionDuration = 133;
        this.maxRecharge = 10;
        this.recharge = 2;
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

        this.bombIcon = this.scene.add.sprite(46, this.scene.game.renderer.height*0.78, 'BlackHole');
        this.bombIcon.play('BlackHoleExplosionAnimation');
        this.bombIcon.setFrame(36).setDepth(2);
        this.scene.bombRechargeBar = this.scene.add.graphics({fillStyle: {color: 0x111111} });
        this.scene.bombRechargeBar.fillRect(40, this.scene.game.renderer.height*0.8, 10, 100);
        this.scene.bombRechargeBarFill = this.scene.add.graphics();
        this.scene.bombRechargeBarFill.fillStyle(0x4921ad);
        this.scene.bombRechargeBarFill.setDepth(5);
        this.scene.bombRechargeBarFill.postFX.addBloom(0xffffff, 0.5, 0.5, 2, 1, 4);

    }

    fire(x, y, alpha, velocityX, velocityY) {
        if (this.recharge <= 0) {
            this.hasHit = false;
            console.log("dropped a bomb");
            this.recharge = this.maxRecharge;
            this.scene.bombRechargeBarFill.clear();
            this.scene.bombRechargeBarFill.fillStyle(0x4921ad);

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
        this.scene.displayTintOverlay('0xffffff');
        this.setVisible(false);
    }

    preUpdate(time, delta) {
        this.recharge -= 0.005;
        super.preUpdate(time, delta);
        this.iterateOverEnemyTypeGroup(this.scene.enemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.orangeEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.blueEnemyGroup);
        this.iterateOverEnemyTypeGroup(this.scene.rainbowEnemyGroup);

        this.iterateOverEnemyTypeGroup(this.scene.scrapGroup);
        this.iterateOverEnemyTypeGroup(this.scene.asteroidGroup);
        if (this.explosionActive) {
            const distToShip = Phaser.Math.Distance.BetweenPoints(this, this.ship);
            if (distToShip < this.damageRadius) {
                this.hitsShip();
            }
        }
        this.updateRechargeBar();
    }
    updateRechargeBar() {
        if (this.recharge >= 0) {
            this.scene.displayTooltip(`${this.recharge}`, true);
            const fillHeight = 100 * ((this.recharge-this.maxRecharge) / this.maxRecharge);
            this.scene.bombRechargeBarFill.fillRect(40, this.scene.game.renderer.height*0.8+100, 10, fillHeight);
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
                        } else {
                            this.hitsEnemy();
                        }
                    }
                }
            }
        })
    }

    hitsShip() {
        this.ship.health -= this.ship.bulletDamage /10
    }

    hitsEnemy() {
        this.enemy.health -= this.ship.bulletDamage /10
    }
}

// Laser physics classes by CodeCaptain https://www.youtube.com/watch?v=9wvlAzKseCo&t=510s
class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, laserColour) {
        super(scene, x, y, laserColour);
        scene.add.existing(this);
        //scene.physics.world.enable(this); off so that lasers don't collide and transfer kinetic energy
        this.scene = scene;
        this.ship = scene.ship;
        this.postFX.addBloom(0xffffff, 1.5, 1.5, 2, 2);
        this.laserHasHit = false;
        this.enemy;
        this.enemyBulletDamage;
        this.bulletDamage;
        this.bulletSpeed;
    }

    fire(x, y, alpha, shooter) {
        this.laserHasHit = false;
        this.body.reset(x,y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(1);
        this.bulletDamage = shooter.bulletDamage;
        this.bulletSpeed = shooter.bulletSpeed;
        this.setVelocity(this.bulletSpeed * Math.cos(alpha), this.bulletSpeed * Math.sin(alpha))
        this.angle = Phaser.Math.RadToDeg(alpha);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.laserHasHit) {
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
            this.laserHasHit = true;
            this.scene.laserDamage.play();
            this.ship.health -= this.bulletDamage;
            this.scene.displayTintOverlay('0xff0000');
        }
    }

    laserHitsEnemy() {
        this.setVisible(false);
        this.laserHasHit = true;
        this.enemy.health -= this.bulletDamage;
    }
}

class WeaponGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene, weaponSound, weaponSprite, weaponType) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: weaponType,//Laser,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: weaponSprite
        })
        this.zapGunSound = weaponSound;
    }

    fireLaser(x, y, alpha, shooter) {
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y, alpha, shooter)
            //this.zapGunSound.play(); enemy laser sound
        }
    }
}

class Scrap extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        //scene.physics.world.enable(this); off so that lasers don't collide and transfer kinetic energy
        // kinetic damage could be fun for certain weapon types (rocket?)
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
        if (!this.ship.invincible && !this.hasHitShip) {
            this.hasHitShip = true;
            this.ship.immobilised = true;
            const angleToShip = Phaser.Math.Angle.BetweenPoints(this, this.ship);
            const bounceAngle = Phaser.Math.RadToDeg(angleToShip)
            this.ship.setVelocity(Math.cos(bounceAngle) * 1000, Math.sin(bounceAngle) * 1000);
            this.scene.time.addEvent({
                delay: 300,
                callback: () => {
                    this.ship.immobilised = false;
                    this.hasHitShip = false;
                },
                callbackScope: this,
                loop: false,
            });
            
            const damage = this.kineticDamage - this.ship.hullCollisionDamage;
            if (damage > 0) {
                this.scene.laserDamage.play();
                this.ship.health -= damage;
                this.scene.displayTintOverlay('0xff0000');
            }
            this.scene.hullCollision.play();
        }
    }
}

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ship');
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
    }
    
    setInvincible(active) {
        this.invincible = active;
    }

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
            this.enemy.health -= this.hullCollisionDamage;
            this.scene.hullCollision.play();
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
        this.playerDeathHasPlayed = false;
    }

    init(data) {
        console.log(data);
        this.backgroundSpeed = 3;
        this.timeTillGunReady = 2;
        this.dropLoop = this.scene.get("MENU").data.get("dropLoop");
    }
    preload() {
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/enemy.png");
        this.load.image('orangeEnemy', "../../assets/images/OrangeEnemy.png");
        this.load.image('blueEnemy', "../../assets/images/BlueEnemy.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
        this.load.image('distort', 'assets/images/phaser/noisebig.png');
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
        this.load.spritesheet('rainbowEnemy', 'assets/images/RainbowEnemySprite.png', {
            frameWidth: 51,
            frameHeight: 58,
        });
        this.load.image('scrap', "../../assets/images/scrap-simple.png");
        this.load.image('heart', "../../assets/images/heart.png");
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

        this.laserGroupBlue = new WeaponGroup(this, this.zapGun1, 'laser', Laser);
        this.laserGroupRed = new WeaponGroup(this, this.zapGun1, 'laserRed', Laser);
        this.rocketGroup = new WeaponGroup(this, this.rocketWeapon, 'rocket', Rocket)
        this.beamLaser = new BeamLaser(this, 0, 0, 'beamLaser', false);
        this.enemyBeamLaser = new BeamLaser(this, 0, 0, 'beamLaserRed', true);
        this.bomb = new Bomb(this, 0, 0, 'bomb');
        this.enemyGroup = new EnemyGroup(this, 'enemy', Enemy);
        this.orangeEnemyGroup = new EnemyGroup(this, 'orangeEnemy', OrangeEnemy);
        this.blueEnemyGroup = new EnemyGroup(this, 'blueEnemy', BlueEnemy);
        this.rainbowEnemyGroup = new EnemyGroup(this, 'rainbowEnemy', RainbowEnemy);

        this.scrapGroup = new WeaponGroup(this, 0, 'scrap', Scrap);
        this.asteroidGroup = new WeaponGroup(this, 0, 'asteroid', Asteroid);


        this.sound.volume = 0.05;
        this.background = this.add.tileSprite(0,0, this.game.renderer.width, this.game.renderer.height, "star_background").setOrigin(0).setDepth(-1);
        this.background.preFX.addBarrel(0.5);

        this.physics.add.existing(this.ship, 0);
        this.ship.body.collideWorldBounds = true;

        let menuButton = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text").setDepth(1);
        let menuButtonHover = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text_hover").setDepth(1).setVisible(0);

        this.healthHeart = this.add.image(24, this.game.renderer.height * 0.962, "heart").setDepth(2);
        this.healthPercent = this.add.bitmapText(40, this.game.renderer.height * 0.95, 'atari-classic', 'init', 20);

        this.scoreCounter = this.add.bitmapText(this.game.renderer.width -300, this.game.renderer.height * 0.95, 'atari-classic', '0 pts', 20);
        this.scrapCounter = this.add.bitmapText(this.game.renderer.width -500, this.game.renderer.height * 0.95, 'atari-classic', '0', 20);
        this.scrapIcon = this.add.image(this.game.renderer.width -530, this.game.renderer.height * 0.96, "scrap").setDepth(1);
        this.tooltipText = this.add.bitmapText(this.game.renderer.width / 4, this.game.renderer.height * 0.875, 'atari-classic', 'Tooltip', 20).setVisible(false);

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
        this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);


        this.addEvents();
    }

    update() {
        this.moveBackground(this.background, this.backgroundSpeed);
        if (this.checkPlayerAlive()) {
            this.playerMove();
            const shipAngleRad = Phaser.Math.DegToRad(this.ship.angle)
            //this.gunReadyTimeText.setText(`${Phaser.Math.RoundTo(this.timeTillGunReady, 0)} s`)
            if (this.keyE.isDown) {
                const offsetX = Math.cos(shipAngleRad) * 1080;
                const offsetY = Math.sin(shipAngleRad) * 1080;
                this.beamLaser.fire(this.ship.x + offsetX, this.ship.y + offsetY, shipAngleRad, this.ship);
                if (!this.laserBeamFiring.isPlaying) {
                    this.laserBeamFiring.play();
                }
            }
            if (Phaser.Input.Keyboard.JustUp(this.keyE)) {
                console.log("E released")
                this.beamLaser.stopFiring();
                this.laserBeamFiring.stop();
                this.laserBeamFiringEnding.play();
            }
            if (this.keyShift.isDown) {
                if (this.ship.dodgeReady) {
                    this.ship.dodgeReady = false;
                    this.dodgeRoll();
                }
            }

            if (this.timeTillGunReady <= 0) {
                //this.gunReadyText.setVisible(1);
                if (this.keySpace.isDown) {
                    this.zapGun1.play();
                    this.timeTillGunReady = 125/this.ship.fireRate;
                    this.shootWeaponByGroup(this.laserGroupBlue);
                }
                if (this.keyR.isDown) {
                    this.rocketWeapon.play();
                    this.timeTillGunReady = 125/this.ship.fireRate;
                    this.shootWeaponByGroup(this.rocketGroup);
                }
                if (this.keyF.isDown) {
                    this.timeTillGunReady = 125/this.ship.fireRate;
                    this.bomb.fire(this.ship.x, this.ship.y, shipAngleRad, this.ship.body.velocity.x, this.ship.body.velocity.y);
                }
            } else {
                this.timeTillGunReady -= 0.016;
                //this.gunReadyText.setVisible(0);
            }

            if (!this.timerStarted) {
                this.timerStarted = true;
                const delay = 2000;
                const ShopDelay = 2000;

                this.time.addEvent({
                    delay: delay,
                    callback: () => {
                        const randomEnemy = Math.random();
                        this.asteroidGroup.fireLaser();
                        if (randomEnemy < 0.3) {
                            this.spawnEnemySomewhere(this.enemyGroup);
                        } else if (randomEnemy < 0.6) {
                            this.spawnEnemySomewhere(this.orangeEnemyGroup);
                        } else if (randomEnemy < 0.9) {
                            this.spawnEnemySomewhere(this.blueEnemyGroup);
                        } else if (randomEnemy < 1) {
                            this.spawnEnemySomewhere(this.rainbowEnemyGroup);
                        } 
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
            if (!this.thruster.isPlaying) {
                this.thruster.play();
            }
            if (!this.ship.immobilised) {
                if (this.keyW.isDown) {
                    this.ship.setVelocityY(-this.ship.flySpeed)
                } 
                if (this.keyS.isDown) {
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
            }
        } else {
            this.ship.anims.play('still', true);
            if (this.thruster.isPlaying) {
                this.thruster.stop();
            }
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
        this.healthPercent.setText(`${Math.round(this.ship.health)}%`);
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

    addPlayersScrap(scrap) {
        this.ship.scrap += scrap;
        this.scrapCounter.setText(`${this.ship.scrap}`);
        this.scrapSound.play();
    }

    playerDeath() {
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
        this.time.addEvent({
            delay: this.ship.dodgeDelay,
            callback: () => {
            this.ship.dodgeReady = true;
            },
            callbackScope: this,
            loop: false,
        });

        const angle = Phaser.Math.DegToRad(this.ship.angle);
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

    //delete shop buttons after leave shop has been pressed
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
