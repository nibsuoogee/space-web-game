import { CST } from "../CST.js";
export class MenuScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.MENU
        })
    }
    init(data) {
        console.log(data);
        console.log("I GOT IT!");
    }
    preload() {
        this.load.audio("drop-loop", "../../assets/music/MUSTY-0.2-game-drop-loop.mp3");
        this.load.image("menu_text", "../../assets/images/text/star fighter menu button.png");
        this.load.image("menu_text_hover", "../../assets/images/text/star fighter menu button red.png");

        this.load.audio("zap_gun_1", "../../assets/sfx/star-fighter-zap-gun-03.mp3");
        this.load.audio("laser_damage", "../../assets/sfx/star-fighter-laser-damage-hull.mp3");
        this.load.audio("player_destruction", "../../assets/sfx/star-fighter-ship-booster-dodge.mp3");
        
    }
    create() {
        this.sound.volume = 0.05;
        this.add.tileSprite(0,0, this.game.renderer.width *2, this.game.renderer.height, "star_background").setOrigin(0);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.28, "title_logo").setDepth(1);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.20, "title_text").setDepth(1);
        let playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text").setDepth(1);
        let playButtonHover = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text_hover").setDepth(1).setVisible(0);
        
        this.sound.pauseOnBlur = false;
        let menuLoop = this.sound.add("menu_loop", {
            loop: true,
            volume: 0.5
        })


        menuLoop.play();
        let buildupBar = this.sound.add("buildup-bar", {
            volume: 0.6
        });
        let dropLoop = this.sound.add("drop-loop", {
            loop: true,
            volume: 0.6
        })


        playButton.setInteractive();

        playButton.on("pointerover", () => {
            console.log("hovering");
            playButtonHover.setVisible(1);
        });

        playButton.on("pointerout", () => {
            console.log("off da buttton");
            playButtonHover.setVisible(0);
        });

        playButton.on("pointerup", () => {
            console.log("ENGAGE THEM!");
            menuLoop.stop();
            buildupBar.play();
            buildupBar.on("complete", () => {
                dropLoop.play();
            })
            this.data.set({"dropLoop": dropLoop});
            this.scene.start(CST.SCENES.PLAY, "Hello to Play scene from Menu!");
            //this.scene.start(CST.SCENES.GAME, "Hello to Play scene from Menu!");
        });


    }
}