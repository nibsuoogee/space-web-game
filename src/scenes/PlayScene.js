import { CST } from "../CST.js";
export class PlayScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.PLAY
        })
    }

    init(data) {
        console.log(data);
        console.log("Play scene init!");
        this.backgroundSpeed = 3;
    }
    preload() {

    }
    create() {
        this.background = this.add.tileSprite(0,0, this.game.renderer.width *2, this.game.renderer.height, "star_background").setOrigin(0);
        let menuButton = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text").setDepth(1);
        let menuButtonHover = this.add.image(this.game.renderer.width / 20, this.game.renderer.height * 0.05, "menu_text_hover").setDepth(1).setVisible(0);

        let dropLoop = this.scene.get("MENU").data.get("dropLoop");

        menuButton.setInteractive();

        menuButton.on("pointerover", () => {
            console.log("hovering");
            menuButtonHover.setVisible(1);
        });

        menuButton.on("pointerout", () => {
            console.log("off da buttton");
            menuButtonHover.setVisible(0);
        });

        menuButton.on("pointerup", () => {
            console.log("back to menu pressed");
            dropLoop.stop();
            this.scene.start(CST.SCENES.MENU, "Hello to Menu scene from play!");
        });
    }

    update() {
        this.moveBackground(this.background, this.backgroundSpeed)
    }

    moveBackground(background, speed) {
        background.tilePositionY -= speed;
    }
}