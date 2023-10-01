import { CST } from "../CST.js";
import { MenuScene } from "./MenuScene.js";
export class LoadScene extends Phaser.Scene{
    constructor() {
        super({
            key: CST.SCENES.LOAD
        })
    }
    init() {

    }
    preload() {
        this.load.image("star_background", "../../assets/images/starfield.png");
        this.load.image("title_text", "../../assets/images/text/star fighter title.png");
        this.load.image("begin_text", "../../assets/images/text/star fighter begin button.png");
        this.load.image("begin_text_hover", "../../assets/images/text/star fighter begin button red.png");
        this.load.audio("menu_loop", "../../assets/music/MUSTY-0.2-game-menu-loop.mp3");
        this.load.audio("buildup-bar", "../../assets/music/MUSTY-0.2-game-buildup-bar-filtered.mp3");

        let loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        });

        this.load.on("progress", (percent)=> {
            loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
            //console.log(percent);
        })

        this.load.on("complete", () => {
            console.log("done loading menu!");
        })
    }
    create() {
        this.scene.start(CST.SCENES.MENU, "Hello from LoadScene!");
    }
}