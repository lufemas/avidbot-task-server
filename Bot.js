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
        height: 0,
        totalWalkTiles : 0,
        totalCleanedTiles : 0,
    }
    
    totalSteps = 0;

    
    timeSec = {
        started : 0.0,
        elapsed: 0.0,
        finished: 0.0
    }

    isPaused = true;


    startPos = [-1, -1];
    // startPos = [1, 13];
    currPos = [-1, -1];
    nodes = [[]];
    startNode = {};
    movSpeed = 200;
    cleaningSpeed = 200;

    constructor(io) {
        this.io = io
    }
}
async function loadMap(inputMap, bot) {
    let currLine = 0;

    ([...inputMap]).forEach((tileChar, ind) => {
        // console.log(tile)
        let tile = 0;
        tileChar == '#' ? tile = 1 : null
        // if(tileChar == ' ') tile = 0
        tileChar == '\n' ?
            function () {
                currLine += 1; bot.map.floorPlan[currLine] = []; bot.map.original[currLine] = []
            }()
            :
            function () {
                tile == 0 ? bot.map.totalWalkTiles += 1 : null
                bot.map.floorPlan[currLine].push(tile);
                bot.map.original[currLine].push(tile);
            }()

        if (bot.startPos[0] < 0) {
            tile == 0 ? bot.startPos = [currLine, bot.map.floorPlan.length - 1] : null;
        }
        console.log('start position')
        console.table(bot.startPos)
    });

    bot.map.width = bot.map.floorPlan[0].length;
    bot.map.height = bot.map.floorPlan.length;


    bot.currPos = bot.startPos;


    console.log('---------------')



    emitUpdate(bot)

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

    const nextPos = positions.shift()


    bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] != 2 ?
    function(){
        bot.map.totalCleanedTiles += 1
        bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 2
    }():
    null
    



    bot.currPos[0] = nextPos.y
    bot.currPos[1] = nextPos.x
    bot.totalSteps += 1


    bot.timeSec.elapsed = (new Date().getTime()/1000) - bot.timeSec.started

    emitUpdate(bot)

    if(!bot.isPaused)
    setTimeout(() => {
        if (positions.length > 0) {
            walk(positions, bot)

        } else {
            setNextGoal(bot)
        }
    }, 200)


}

function getNextFrees(i, j) {
    const result = [];

    if (bot.map.floorPlan[j + 1][i] == ' ') result.push([j + 1, i])
    if (bot.map.floorPlan[j - 1][i] == ' ') result.push([j - 1, i])
    if (bot.map.floorPlan[j][i + 1] == ' ') result.push([j, i + 1])
    if (bot.map.floorPlan[j][i - 1] == ' ') result.push([j, i - 1])

    return result;
}

async function setNextGoal(bot) {
    junkRemoval(bot)
    bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 'x'
    emitUpdate(bot)

    easystar.setGrid(bot.map.floorPlan)
    easystar.setAcceptableTiles([0, 2]);

    wLoop:
    for (let j = 0; j < bot.map.height; j++) {
        hLoop:

        for (let i = 0; i < bot.map.width; i++) {

            if (bot.map.floorPlan[j][i] == 0) {

                // console.log(`${bot.map.floorPlan[j][i]} [${j}][${i}] is valid`)
                // bot.map.floorPlan[j][i] = 9
                console.log(`next goal: [${j}][${i}]`)


                // console.log('walking')
                printMap(bot.map.floorPlan)
                console.log(bot.map.totalWalkTiles)
                console.log(bot.map.totalCleanedTiles)

                // await walk(PF(bot.currPos, bot.map.floorPlan.slice(), [j,i]), bot)
                easystar.findPath(bot.currPos[1], bot.currPos[0], i, j, function (path) {
                    if (path === null) {
                        console.warn("Path was not found.");
                    } else {
                        // alert("Path was found. The first Point is " + path[0].x + " " + path[0].y);
                        // console.table(path)
                        walk(path, bot)
                    }
                });

                easystar.calculate()


                break wLoop;


            }

            if (i >= bot.map.width - 1 && j >= bot.map.height - 1) {

                bot.totalCleanedTiles = bot.totalWalkTiles;
                bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 2

                console.log('finished')

                bot.timeSec.finished = new Date().getTime()/1000
                bot.timeSec.elapsed = bot.timeSec.finished - bot.timeSec.started
                printMap(bot.map.floorPlan)

                emitUpdate(bot)
                
                console.log(bot.map.totalWalkTiles)
                console.log(bot.map.totalCleanedTiles)

                // setTimeout(()=>{
                 bot.io.emit('finished', true)

                // }, 1000)
                
                return 0
            }
        }
    }


}

function junkRemoval(bot) {
    for (let i = 0; i < bot.map.width; i++) {
        for (let j = 0; j < bot.map.height; j++) {


            if (bot.map.floorPlan[j][i] == 9) {
                bot.map.floorPlan[j][i] = 0;
            }

        }
    }
}

function pause(bot){
    bot.isPaused = true;
}

function resume(bot){
    bot.isPaused = false;
    if (bot.timeSec.started  == 0) bot.timeSec.started = new Date().getTime() / 1000
    setNextGoal(bot)
}

function killSim(bot){

    bot.map = {
        original: [[]],
        floorPlan: [[]],
        width: 0,
        height: 0,
        totalWalkTiles : 0,
        totalCleanedTiles : 0
    }

    bot.isPaused = true;

    bot.startPos = [-1, -1];
    bot.currPos = [-1, -1];
    bot.nodes = [[]];
    bot.startNode = {};

    bot.io.emit('update', 
    {currentPosition : bot.currPos, 
    currentMap: bot.map.floorPlan,
    totalCleanedTiles: bot.map.totalCleanedTiles,
    totalWalkTiles: bot.map.totalWalkTiles,
    mapWidth : 1,
    mapHeight : 1,
    isPaused : true
    })
}

function emitUpdate( bot){
    bot.io.emit('update', 
    {currentPosition : bot.currPos, 
    currentMap: bot.map.floorPlan,
    totalCleanedTiles: bot.map.totalCleanedTiles,
    totalWalkTiles: bot.map.totalWalkTiles,
    mapWidth : bot.map.width,
    mapHeight : bot.map.height,
    startedTime: bot.timeSec.started,
    elapsedTime: bot.timeSec.elapsed,
    finishedTime: bot.timeSec.finished,
    totalSteps: bot.totalSteps,
    isPaused : bot.isPaused
    })
}

module.exports = {
    Bot,
    loadMap,
    setNextGoal,
    pause,
    resume,
    killSim
};