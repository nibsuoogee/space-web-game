/** @type {import("../typings/phaser")} */
//import Phaser from 'phaser';
import {LoadScene} from "./scenes/LoadScene.js";
import {MenuScene} from "./scenes/MenuScene.js";
import {PlayScene} from "./scenes/PlayScene.js";
import {GameScene} from "./scenes/GameScene.js";
let game = new Phaser.Game({
    width: 1920*0.75, 
    height: 1080*0.75, 
    AUTO: 1,
    autoCenter: true,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene:[
        LoadScene, MenuScene, PlayScene, GameScene
    ]
});

let GameState = {
    preload: function() {

    },
    create: function() {

    },
    update: function() { // 60 fps/ 16ms

    }
};

document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
/*
game.state.add('GameState', GameState);
game.state.start('GameState');
*/