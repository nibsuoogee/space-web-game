/** @type {import("../typings/phaser")} */
import {LoadScene} from "./scenes/LoadScene.js";
import {MenuScene} from "./scenes/MenuScene.js";
let game = new Phaser.Game({
    //width: 1920, 
    //height: 1080, 
    width: 960, 
    height: 540, 
    AUTO: 1,
    autoCenter: true,
    scene:[
        LoadScene, MenuScene
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

/*
game.state.add('GameState', GameState);
game.state.start('GameState');
*/