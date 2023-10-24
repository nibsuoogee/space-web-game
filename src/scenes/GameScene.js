import { CST } from "../CST.js";

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);

        this.keys = scene.input.keyboard.addKeys("W,A,S,D");
        this.isShooting = false;
        this.shootFromFirstPosition = true;

        this.fireRate = 250;
        this.lastFired = 0;
        this.health = 100;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 500;
        this.bulletDamage = 50;
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.world.enable(this);


        this.fireRate = 250;
        this.lastFired = 0;
        this.health = 100;
        this.hullCollisionDamage = 50;
        this.bulletSpeed = 1000;
        this.flySpeed = 500;
        this.bulletDamage = 10;
    }
}

export class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.GAME
        });
    }
    preload() {
        //this.load.image('sky', 'assets/sky.png');
        this.load.spritesheet('player', 'assets/images/ShipSprite.png', {
            frameWidth: 180,
            frameHeight: 70,
        });
        /*
        this.load.image('projectile', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/enemy.png");
        this.load.image('enemyProjectile', "../../assets/images/star fighter laser long red.png");

        this.load.image('shop', "../../assets/images/shop.png");
        this.load.image('EngineUpgrade', "../../assets/images/EngineUpgrade.png");
        this.load.image('HealthUpgrade', "../../assets/images/HealthUpgrade.png");
        this.load.image('FireRateUpgrade', "../../assets/images/FireRateUpgrade.png");
        this.load.image('DamageUpgrade', "../../assets/images/DamageUpgrade.png");
        this.load.image('shopWindow', "../../assets/images/shopWindow.png");
        this.load.image('LeaveShop', "../../assets/images/LeaveShop.png");
        this.load.image('MissileUpgrade', "../../assets/images/MissileUpgrade.png");
        this.load.image('RepairShip', "../../assets/images/RepairShip.png");
        */
    }
    create() {
        this.keys = this.input.keyboard.addKeys("W,A,S,D");
        this.player = new Player(this, (window.innerWidth - 100) / 2, (window.innerHeight - 300) / 2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'thrustersOn',
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 4,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'still',
            frames: [{
                key: 'player',
                frame: 5,
            }],
            frameRate: 40,
        });
        /*
        this.enemies = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();
        this.physics.world.enable(this.enemies);



        this.projectiles = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite, // Use a custom class for projectiles if needed
            allowGravity: false,
            collideWorldBounds: false, // Disable collision with world bounds
        });

        this.isShooting = false;
        this.fireRate = 250;
        this.lastFired = 0;
        this.shootFromFirstPosition = true;

        this.input.on('pointerdown', () => this.isShooting = true);
        this.input.on('pointerup', () => this.isShooting = false);

        this.enemySpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: () => this.spawnEnemy(200,200, this.player),
            callbackScope: this,
            loop: true,
        });
        */
    }
    update(time) {
        //this.closePopup;

        this.player.setVelocity(0, 0);

        const angle = Phaser.Math.Angle.BetweenPoints(this.player, this.input.mousePointer);
        this.player.rotation = angle;

        if (this.keys.A.isDown || this.keys.D.isDown || this.keys.W.isDown || this.keys.S.isDown) {
            this.player.anims.play('thrustersOn', true);
            if (this.keys.A.isDown) {
                this.player.setVelocityX(-500);
            }
            if (this.keys.D.isDown) {
                this.player.setVelocityX(500);
            }
            if (this.keys.W.isDown) {
                this.player.setVelocityY(-500);
            }
            if (this.keys.S.isDown) {
                this.player.setVelocityY(500);
            }
        } else {
            this.player.setVelocity(0, 0);
            this.player.anims.play('still', true);
        }
        /*
        if (this.isShooting && time - this.lastFired > this.fireRate) {
            this.shootProjectile();
            this.lastFired = time;
        }

        this.enemies.getChildren().forEach(enemy => {
            const speed = 100;
            const timeBetweenShots = 2000;

            const angleToPlayer = Phaser.Math.Angle.BetweenPoints(enemy, this.player);

            enemy.setVelocity(Math.cos(angleToPlayer) * speed, Math.sin(angleToPlayer) * speed);

            if (time - (enemy.lastShotTime || 0) > timeBetweenShots) {
                this.enemyShootProjectile(enemy,this.player);
                enemy.lastShotTime = time;
            }
        });


        this.physics.world.enable([this.projectiles, this.enemies]);

        this.physics.world.collide(this.player, this.enemies, this.playerEnemyCollision, null, this);
        var enemyKilled = this.physics.world.collide(this.projectiles, this.enemies, this.projectileEnemyCollision, null, this);
        this.physics.world.collide(this.enemyProjectiles, this.player, this.projectilePlayerCollision, null, this);

        if (enemyKilled) {
            console.log("Enemy spawn timer removed");
            this.enemySpawnTimer.remove();
            this.shopSlideIn();
            enemyKilled = 0;

        }
        */
    }
    shopSlideIn(){

        this.load.image('shop', "../../assets/images/shop.png");
        this.load.image('EngineUpgrade', "../../assets/images/EngineUpgrade.png");
        this.load.image('HealthUpgrade', "../../assets/images/HealthUpgrade.png");
        this.load.image('FireRateUpgrade', "../../assets/images/FireRateUpgrade.png");
        this.load.image('DamageUpgrade', "../../assets/images/DamageUpgrade.png");
        this.load.image('shopWindow', "../../assets/images/shopWindow.png");
        this.load.image('LeaveShop', "../../assets/images/LeaveShop.png");
        this.load.image('MissileUpgrade', "../../assets/images/MissileUpgrade.png");
        this.load.image('RepairShip', "../../assets/images/RepairShip.png");

        const image = this.add.image(this.game.config.width, this.game.config.height / 2, 'shop');
        image.setOrigin(0, 0.5);
        console.log("shop slide in playeds")
        this.slideInTween = this.tweens.add({
            targets: image,
            x: this.game.config.width / 1.3, // Target X position (center of the screen)
            duration: 1000, // Duration of the tween in milliseconds
            ease: 'Power2', // Easing function (adjust as needed)
            paused: true, // Pause the tween initially
            onComplete: () => {
                // Code to run when the tween is complete (optional)
                var shopwindow = this.add.image(0,0, 'shopWindow').setOrigin(0,0);
                var button1 = this.add.image(91,91, 'EngineUpgrade').setOrigin(0).setInteractive();
                var button2 = this.add.image(470,91, 'HealthUpgrade').setOrigin(0).setInteractive();
                var button3 = this.add.image(91,406, 'DamageUpgrade').setOrigin(0).setInteractive();
                var button4 = this.add.image(470,406, 'FireRateUpgrade').setOrigin(0).setInteractive();
                var button5 = this.add.image(1150,465, 'LeaveShop').setOrigin(0).setInteractive();
                var button6 = this.add.image(960,465, 'RepairShip').setOrigin(0).setInteractive();
                var button7 = this.add.image(1030,110, 'MissileUpgrade').setOrigin(0).setInteractive();
                button1.setScale(7);
                button2.setScale(7);
                button3.setScale(7);
                button4.setScale(7);

                button5.setScale(1.5);
                button6.setScale(1.5);
                button7.setScale(2);
                shopwindow.setScale(7);
        
                var shopContainer = this.add.container(32,70, [shopwindow, button1, button2, button3, button4, button5, button6, button7], Phaser.Geom.Rectangle.Contains)
        
        
                button1.on('pointerup', function () {
                    console.log("you pressed a button1");

        
                }, this);
                button2.on('pointerup', function () {
                    console.log("you pressed a button2");

        
                }, this);
                button3.on('pointerup', function () {
                    console.log("you pressed a button3");

        
                }, this);
                button4.on('pointerup', function () {
                    console.log("you pressed a button4");

                }, this);
                      
                button5.on('pointerup', function () {
                    console.log("you pressed a button1");
                    this.shopSlideOut(image);
                    this.slideOutTweenButtons(button1, button2, button3, button4, button5, button6, button7, shopwindow);

        
                }, this);
                      
                button6.on('pointerup', function () {
                    console.log("you pressed a button1");

        
                }, this);
                      
                button7.on('pointerup', function () {
                    console.log("you pressed a button1");

        
                }, this);
        
            }
        });

        this.slideInTween.play();
        
        
    }
    // Function to slide out buttons and shop window
    slideOutTweenButtons(button1, button2, button3, button4, button5, button6, button7, shopwindow) {
        // Create tweens to slide out buttons and shop window
        const duration = 2000;
        const targets = [button1, button2, button3, button4, button5, button6, button7, shopwindow];
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            this.tweens.add({
                targets: target,
                x: -5000, // Slide out to the left
                duration: duration,
                ease: 'Power2',
                onComplete: () => {
                    // Destroy the button or shop window after sliding out
                    target.destroy();
                }
            });
        }
    }
    shopSlideOut(image) {
        this.slideOutTween = this.tweens.add({
            targets: image,
            x: -1000, // Slide out to the left by setting x to a value less than 0
            duration: 5000,
            ease: 'Power2',
            paused: true,
            onComplete: () => {
                // Code to run when the tween is complete (optional)
                image.destroy(); // Optionally destroy the image after sliding out
            }
        });
    
        this.slideOutTween.play();
    }
    shootProjectile() {
        const xOffset1 = 110;
        const yOffset1 = -7;
        const xOffset2 = 110;
        const yOffset2 = 7;


        let startX, startY;
    
        // Calculate the angle between the player and the mouse pointer
        const angle = Phaser.Math.Angle.BetweenPoints(this.player, this.input.mousePointer);
        this.player.rotation = angle;
    
        if (this.shootFromFirstPosition) {
            startX = this.player.x + xOffset1 * Math.cos(angle) - yOffset1 * Math.sin(angle);
            startY = this.player.y + xOffset1 * Math.sin(angle) + yOffset1 * Math.cos(angle);
        } else {
            startX = this.player.x + xOffset2 * Math.cos(angle) - yOffset2 * Math.sin(angle);
            startY = this.player.y + xOffset2 * Math.sin(angle) + yOffset2 * Math.cos(angle);
        }
    
        // Create a projectile at the calculated position
        const projectile = this.projectiles.create(startX, startY, 'projectile');
        projectile.setRotation(angle);
        projectile.setVelocity(Math.cos(angle) * this.player.bulletSpeed, Math.sin(angle) * this.player.bulletSpeed);
    
        // Toggle between shooting positions for the next shot
        this.shootFromFirstPosition = !this.shootFromFirstPosition;
    }

    enemyShootProjectile(enemy, player) {
        const xOffset1 = 110;
        const yOffset1 = -7;
        const xOffset2 = 110;
        const yOffset2 = 7;
    
        // Calculate the angle between the enemy and the player
        const angleToPlayer = Phaser.Math.Angle.BetweenPoints(enemy, player);
    
        let startX, startY;
    
        if (enemy.shootFromFirstPosition) {
            startX = enemy.x + xOffset1 * Math.cos(angleToPlayer) - yOffset1 * Math.sin(angleToPlayer);
            startY = enemy.y + xOffset1 * Math.sin(angleToPlayer) + yOffset1 * Math.cos(angleToPlayer);
        } else {
            startX = enemy.x + xOffset2 * Math.cos(angleToPlayer) - yOffset2 * Math.sin(angleToPlayer);
            startY = enemy.y + xOffset2 * Math.sin(angleToPlayer) + yOffset2 * Math.cos(angleToPlayer);
        }
    
        // Create an enemy projectile as a simple sprite
        const enemyProjectile = this.physics.add.sprite(startX, startY, 'enemyProjectile');
        enemyProjectile.setRotation(angleToPlayer);
        enemyProjectile.setVelocity(
            Math.cos(angleToPlayer) * enemy.bulletSpeed,
            Math.sin(angleToPlayer) * enemy.bulletSpeed
        );
        
        // Define additional properties if needed
        enemyProjectile.damage = 10; // You can customize the damage
    
        // Add the enemy projectile to a group or container if needed
        this.enemyProjectiles.add(enemyProjectile);
    
        // Toggle between shooting positions for the next shot
        enemy.shootFromFirstPosition = !enemy.shootFromFirstPosition;
    }

    projectileEnemyCollision(projectile, enemy) {
        console.log('Projectile hit enemy');
        const damage = projectile.damage || 50;
        enemy.health -= damage;
    
        if (enemy.health <= 0) {
            enemy.destroy();
            return true;
        }
    
        projectile.destroy();
    
    }

    projectilePlayerCollision(projectile, player) {
        console.log('Projectile hit ship');
        const damage = projectile.damage || 10;
        player.health -= damage;
    
        if (player.health <= 0) {
            player.destroy();
        }

    
        projectile.destroy();
    
    }

    playerEnemyCollision(player, enemy) {
        enemy.health -= player.hullCollisionDamage;
        player.health -= enemy.hullCollisionDamage;

        if (enemy.health <= 0) {
            enemy.destroy();
        }
        if (player.health <= 0) {
            player.destroy();
        }
    }

    spawnEnemy(x, y) {
        const enemy = new Enemy(this, x, y);
        this.enemies.add(enemy);
        return enemy;
    }
}