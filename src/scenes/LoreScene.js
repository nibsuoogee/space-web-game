import { CST } from "../CST.js";
import { MenuScene } from "./MenuScene.js";

export class LoreScene extends Phaser.Scene {
    constructor() {
        super({
            key: CST.SCENES.LORE
        });
    }

    init() {
        this.fullText = "In the vast expanse of the cosmos, the Galactic Federation is once more in dire need of your unwavering courage and skill. A colossal armada of enemy battleships, have been detected converging perilously close to our critical base of operations. You must stand as our last line of defense, safeguarding the base as we initiate an urgent evacuation of our people. The galaxy's future depends on you.";
        this.currentText = "";
        this.textObject = this.add.text(this.game.renderer.width / 4, this.game.renderer.height * 0.20, "", {
            fontSize: "32px",
            fill: "#fff",
            wordWrap: { width: 800}
        }).setDepth(1);
        this.delayBetweenCharacters = 60;
        this.currentIndex = 0;
    }

    preload() {

    }

    create() {
        this.add.image(250,160, "QuestGiver").setOrigin(0).setInteractive().setScale(2);
        this.timedEvent = this.time.addEvent({
            delay: this.delayBetweenCharacters,
            callback: this.addNextCharacter,
            callbackScope: this,
            repeat: this.fullText.length - 1
        });
    }

    addNextCharacter() {
        this.currentText += this.fullText[this.currentIndex];
        this.textObject.text = this.currentText;
        this.currentIndex++;

        if (this.currentIndex >= this.fullText.length) {
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    this.scene.start(CST.SCENES.MENU, "START");
                },
                callbackScope: this
            });
        }
    }
}
