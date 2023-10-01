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
    }
    create() {
        this.add.image(0,0, "star_background"); //.setOrigin(0);
        this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.20, "title_text").setDepth(1);
        let playButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text").setDepth(1);
        let playButtonHover = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, "begin_text_hover").setDepth(1).setVisible(0);
        

        this.sound.pauseOnBlur = false;
        let menuLoop = this.sound.add("menu_loop", {
            loop: true
        })
        menuLoop.play();
        let buildupBar = this.sound.add("buildup-bar", {});
        let dropLoop = this.sound.add("drop-loop", {
            loop: true
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
        });


    }
}