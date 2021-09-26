// const pf = require('./pathfinding');
const PF = require('./pathfinding');
const EasyStar = require('easystarjs')
const easystar = new EasyStar.js()


class Node {
    x = 0;
    y = 0;
    openPaths = []
}

class Bot {

    map = {
        original: [[]],
        floorPlan: [[]],
        width: 0,
        height: 0
    }


    // startPos = [-1, -1];
    startPos = [1, 13];
    currPos = [-1, -1];
    nodes = [[]];
    startNode = {};
    movSpeed = 200;
    cleaningSpeed = 200;

    constructor() {

    }
}
async function loadMap(inputMap, bot){
    let currLine = 0;

    ([...inputMap]).forEach((tileChar, ind) => {
        // console.log(tile)
        let tile = 0;
        if (tileChar == '#') tile = 1
        // if(tileChar == ' ') tile = 0
        tileChar == '\n' ?
            function () {
                currLine += 1; bot.map.floorPlan[currLine] = []; bot.map.original[currLine] = []
            }()
            :
            function () {
                bot.map.floorPlan[currLine].push(tile);
                bot.map.original[currLine].push(tile);
            }()

        if (bot.startPos[0] < 0) {
            tile == 0 ? bot.startPos = [currLine, bot.map.floorPlan.length - 1] : null;
        }
    });

    bot.map.width = bot.map.floorPlan[0].length;
    bot.map.height = bot.map.floorPlan.length;

    // bot.map.original = bot.map.floorPlan.slice()

    // console.log(map.floorPlan[0].join(''))

    bot.currPos = bot.startPos;

    console.log(bot.map)
    console.log(bot)


    console.log('---------------')
    

    setNextGoal(bot)
    // console.log(PF(bot.startPos, bot.map.floorPlan))

}


function printMap(map) {
    console.log('\n-----------------')
    map.forEach(line => {
        console.log(line.join(''))
    })
    console.log('\n-----------------')

}

function isValid(tile) {
    return tile != '#';
}


function isClean(tile) {
    return tile == 'c';
}

function vec2Sum(arr1, arr2) {
    return [arr1[0] + arr2[0], arr1[1] + arr2[1]]
}

function walk(positions, bot) {
    console.log(positions)
    const nextPos = positions.shift()
    
    bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = '@'

    printMap(bot.map.floorPlan)
    

    bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 2


    bot.currPos[0] = nextPos.y
    bot.currPos[1] = nextPos.x




    setTimeout(() => {
        if (positions.length > 0) {
            walk(positions,bot)

        } else {
        setNextGoal(bot)
        }
    }, 5)


}

function getNextFrees(i, j) {
    const result = [];

    if (bot.map.floorPlan[j + 1][i] == ' ') result.push([j + 1, i])
    if (bot.map.floorPlan[j - 1][i] == ' ') result.push([j - 1, i])
    if (bot.map.floorPlan[j][i + 1] == ' ') result.push([j, i + 1])
    if (bot.map.floorPlan[j][i - 1] == ' ') result.push([j, i - 1])

    return result;
}

async function setNextGoal(bot){
    // junkRemoval(bot)
    bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 'x'

    easystar.setGrid(bot.map.floorPlan)
    easystar.setAcceptableTiles([0,2]);

    wLoop:
    for (let j = 0; j < bot.map.height; j++) {
        hLoop:
        
        for (let i = 0; i < bot.map.width; i++) {
            
            if (bot.map.floorPlan[j][i] == 0) {
                
                // console.log(`${bot.map.floorPlan[j][i]} [${j}][${i}] is valid`)
                // bot.map.floorPlan[j][i] = 9
                console.log(`next goal: [${j}][${i}]`)
                
                
                console.log('walking')
                printMap(bot.map.floorPlan)

                // await walk(PF(bot.currPos, bot.map.floorPlan.slice(), [j,i]), bot)
                easystar.findPath(bot.currPos[1], bot.currPos[0], i, j, function( path ) {
                    if (path === null) {
                        alert("Path was not found.");
                    } else {
                        // alert("Path was found. The first Point is " + path[0].x + " " + path[0].y);
                        console.table(path)
                        walk(path, bot)
                    }
                });

                break wLoop;
                
                
            }

            if ( i  >= bot.map.width -1 && j >= bot.map.height -1 ){

                console.log('finished')

                printMap(bot.map.floorPlan)
                return 0
            }
        }
    }

    easystar.calculate()

}

function junkRemoval(bot){
    for (let i = 0; i < bot.map.width; i++) {
        for (let j = 0; j < bot.map.height; j++) {


            if (bot.map.floorPlan[j][i] == 9) {
                bot.map.floorPlan[j][i] = 0;
            }

        }
    }
}

module.exports = {
    Bot,
    loadMap
};