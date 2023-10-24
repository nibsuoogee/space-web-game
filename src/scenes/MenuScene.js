import { CST } from "../CST.js";
export class MenuScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.MENU
        })

        this.menuLoop;
        this.buildupBar;
        this.dropLoop;

    }
    init(data) {
        
    }
    preload() {

    }
    create() {
        this.sound.volume = 0.05;
        this.add.tileSprite(0,0, this.game.renderer.width *2, this.game.renderer.height, "star_background").setOrigin(0);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.28, "title_logo").setDepth(1);
        this.titleText = this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.20, "title_text").setDepth(1);
        this.titleText.preFX.addShadow(-0.2, -1.2, 0.02, 5, 0x000000, 8);

        this.playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text").setDepth(1);
        this.playButton.preFX.addShadow(-0.2, -1.2, 0.02, 5, 0x000000, 8);
        let playButtonHover = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text_hover").setDepth(1).setVisible(0);
        
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.7, "credits").setDepth(1);

        this.sound.pauseOnBlur = false;        
        this.menuLoop = this.sound.add("menu_loop", {
            loop: true,
            volume: 0.5
        });

        this.menuLoop.play();

        this.buildupBar = this.sound.add("buildup-bar", {
            volume: 0.6
        });

        this.dropLoop = this.sound.add("drop-loop", {
            loop: true,
            volume: 0.6
        });


        this.playButton.setInteractive();

        this.playButton.on("pointerover", () => {
            playButtonHover.setVisible(1);
        });

        this.playButton.on("pointerout", () => {
            playButtonHover.setVisible(0);
        });

        this.playButton.on("pointerup", () => {
            this.data.set({"dropLoop": this.dropLoop, "buildupBar": this.buildupBar, "menuLoop":this.menuLoop});
            this.scene.start(CST.SCENES.LORE, "Hello to Play scene from Menu!");
            //this.scene.start(CST.SCENES.GAME, "Hello to Play scene from Menu!");
        });
    }
}