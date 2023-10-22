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
        console.log(data);
        console.log("I GOT IT!");
        if(data === "START"){
            this.onEvent();
        }
    }
    preload() {

    }
    create() {
        this.sound.volume = 0.05;
        this.add.tileSprite(0,0, this.game.renderer.width *2, this.game.renderer.height, "star_background").setOrigin(0);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.28, "title_logo").setDepth(1);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.20, "title_text").setDepth(1);
        let playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text").setDepth(1);
        let playButtonHover = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text_hover").setDepth(1).setVisible(0);
        
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
            this.scene.start(CST.SCENES.LORE, "Hello to Play scene from Menu!");

        });


    }

    onEvent(){
        console.log("ENGAGE THEM!");
        this.menuLoop.stop();
        this.buildupBar.play();
        this.buildupBar.on("complete", () => {
            this.dropLoop.play();
        })
        this.data.set({"dropLoop": this.dropLoop, "buildupBar": this.buildupBar});
        this.scene.start(CST.SCENES.PLAY, "Hello to Play scene from Menu!");
        //this.scene.start(CST.SCENES.GAME, "Hello to Play scene from Menu!");
    }
}