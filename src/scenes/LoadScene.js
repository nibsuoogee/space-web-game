// Elias Syyrilä & Matias Tarvainen
import { CST } from "../CST.js";
export class LoadScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.LOAD
        })
    }
    init() {

    }
    preload() {
        this.load.image("star_background", "../../assets/images/star fighter test background.png");
        //this.load.image("star_background", "../../assets/images/starfield.png");
        this.load.image("title_logo", "../../assets/images/star fighter logo.png");
        this.load.image("title_text", "../../assets/images/text/star fighter title.png");
        this.load.image("begin_text", "../../assets/images/text/star fighter begin button.png");
        this.load.image("begin_text_hover", "../../assets/images/text/star fighter begin button red.png");
        this.load.image("game_over_text", "../../assets/images/text/game over.png");
        this.load.image("new_game_plus", "../../assets/images/text/new game plus.png");
        this.load.audio("menu_loop", "../../assets/music/MUSTY-0.2-game-menu-loop.mp3");
        this.load.audio("buildup-bar", "../../assets/music/MUSTY-0.2-game-buildup-bar-filtered.mp3");

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        });

        this.load.on("progress", (percent)=> {
            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
        })

        this.load.on("complete", () => {
            
        })


        this.load.audio("drop-loop", "../../assets/music/MUSTY-0.2-game-drop-loop.mp3");
        this.load.audio("lore-typing", "../../assets/sfx/lore-typing.mp3");

        this.load.image("menu_text", "../../assets/images/text/star fighter menu button.png");
        this.load.image("menu_text_hover", "../../assets/images/text/star fighter menu button red.png");
        this.load.image("credits", "../../assets/images/text/credits.png");


        this.load.audio("zap_gun_1", "../../assets/sfx/star-fighter-zap-gun-03.mp3");
        this.load.audio("laser_damage", "../../assets/sfx/star-fighter-laser-damage-hull.mp3");
        
        this.load.image('laser', "../../assets/images/star fighter laser long blue.png");
        this.load.image('enemy', "../../assets/images/Enemies/enemy.png");
        this.load.image('orangeEnemy', "../../assets/images/Enemies/OrangeEnemy.png");
        this.load.image('blueEnemy', "../../assets/images/Enemies/BlueEnemy.png");
        this.load.image('laserRed', "../../assets/images/star fighter laser long red.png");
        this.load.image('distort', 'assets/images/phaser/noisebig.png');
        this.load.image('blackHoleIcon', 'assets/images/Shop/BlackholeIcon.png');
        this.load.image('laserBeamIcon', 'assets/images/Shop/laserBeamIcon.png');
        this.load.image('rocketIcon', 'assets/images/Shop/RocketIcon.png');
        this.load.image('skullIcon', 'assets/images/skull-icon.png');
        this.load.spritesheet('rocket', '../../assets/images/MissileSprite.png', {
            frameWidth: 35,
            frameHeight: 16,
        });
        this.load.image('beamLaser', "../../assets/images/star fighter max long blue.png");
        this.load.image('beamLaserRed', "../../assets/images/star fighter max long red.png");
        this.load.image('beamLaserGreen', "../../assets/images/star fighter max long green.png");
        this.load.spritesheet('bomb', "../../assets/images/BlackHoleBombSprite.png", {
            frameWidth: 13,
            frameHeight: 13,
        });
        this.load.spritesheet('BlackHole', "../../assets/images/BlackHoleSprite.png", {
            frameWidth: 40,
            frameHeight: 40,
        });
        this.load.spritesheet('ship', 'assets/images/ShipSprite.png', {
            frameWidth: 180,
            frameHeight: 70,
        })
        this.load.spritesheet('rainbowEnemy', 'assets/images/Enemies/GoldenRainbowEnemy.png', {
            frameWidth: 52,
            frameHeight: 59,
        });
        this.load.spritesheet('shop', "../../assets/images/Shop/shop.png",{
            frameWidth: 200,
            frameHeight: 200,
        });

        this.load.spritesheet('Boss', "../../assets/images/Enemies/FinalBoss.png",{
            frameWidth: 438,
            frameHeight: 175,
        });

        this.load.image('scrap', "../../assets/images/scrap.png");
        this.load.image('healthkit', "../../assets/images/Healthkit.png");
        this.load.image('heart', "../../assets/images/HealthIcon.png");
        this.load.image('dodgeIcon', "../../assets/images/dodgeIcon.png");
        this.load.image('asteroid', "../../assets/images/asteroid.png");
        this.load.image('deathFireParticle', "../../assets/images/death-fire-simple.png");
        this.load.image('spawnFlash', "../../assets/images/spawn-flash-simple.png");
        this.damageOverlay = this.add.rectangle(this.game.renderer.width / 2, this.game.renderer.height /2, this.game.renderer.width, this.game.renderer.height, 0xff0000).setVisible(0);
        this.load.bitmapFont('atari-classic', 'assets/images/text/bitmap/atari-classic.png', 'assets/images/text/bitmap/atari-classic.xml');

        this.load.image('EngineUpgrade', "../../assets/images/Shop/EngineIcon.png");
        this.load.image('HealthUpgrade', "../../assets/images/Shop/ShieldIcon.png");
        this.load.image('FireRateUpgrade', "../../assets/images/Shop/FirerateIcon.png");
        this.load.image('DamageUpgrade', "../../assets/images/Shop/BulletDamageIcon.png");
        this.load.image('HullCollisionUpgrade', "../../assets/images/Shop/ThornsIcon1.png");
        this.load.image('BulletSpeedUpgrade', "../../assets/images/Shop/BulletSpeedIcon.png");

        this.load.image('shopWindow', "../../assets/images/Shop/ShopKeeper.png");
        this.load.image('LeaveShop', "../../assets/images/Shop/LeaveShop.png");
        this.load.image('RepairShip', "../../assets/images/Shop/RepairIcon.png");
        this.load.image('QuestGiver', "../../assets/images/QuestGiver.png");
        this.load.image('tutorial', "../../assets/images/tutorial.png");

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
        this.load.audio("insufficient_funds", "../../assets/sfx/insufficient-funds.mp3");

    }
    create() {
        this.scene.start(CST.SCENES.MENU, "Hello from LoadScene!");
    }
}



