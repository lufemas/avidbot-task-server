// Bot Class and utility functions

const EasyStar = require('easystarjs')    // Pathfinding library I'm using

// Create a new instance of EasyStar
const easystar = new EasyStar.js()

// Bot Class ( Data Only )
// Holds all the important data,
// including, data necessary to finish the ask and
// data for monitoring and statistics
class Bot {

    // Data of the map are under the 'map' object
    map = {
        original: [[]],         // The original map without any information
        floorPlan: [[]],        // The map with cleaning information
        width: 0,               // Map width in 'Areas'
        height: 0,              // Map height in 'Areas'
        totalWalkTiles : 0,     // Total walkable 'Areas'
        totalCleanedTiles : 0,  // Total cleaned 'Areas'
    }
    
    // Total stetps done during the task
    totalSteps = 0;

    
    // Time related data
    timeSec = {
        started : 0.0,
        elapsed: 0.0,
        finished: 0.0
    }

    // PAUSE state control
    isPaused = true;

    // Initial Posistion, negative means it is not defined yet
    startPos = [-1, -1];

    // current position
    currPos = [-1, -1];
    nodes = [[]];
    startNode = {};

    // Bot speed
    movSpeed = 200;
    cleaningSpeed = 200;

    // receives the socket.io instance as a constructor to be able to emit messages
    constructor(io) {
        this.io = io
    }
}

// This function load the map and convert the ASCII characters to integers
// '#' is 1, ' ' is 0
// During this step the first avaiable position will be set as initial position
// After everything done, a update message is emitted
async function loadMap(inputMap, bot) {
    let currLine = 0;

    ([...inputMap]).forEach((tileChar, ind) => {
        let tile = 0;
        tileChar == '#' ? tile = 1 : null
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


// PrintMap function for Debugging
function printMap(map) {
    console.log('\n-----------------')
    map.forEach(line => {
        console.log(line.join(''))
    })
    console.log('\n-----------------')

    

}

// Some utility functions----------------------------------
function isValid(tile) {
    return tile != '#';
}


function isClean(tile) {
    return tile == 'c';
}

function vec2Sum(arr1, arr2) {
    return [arr1[0] + arr2[0], arr1[1] + arr2[1]]
}
// --------------------------------------------------------

// 'walk' function
// Receives a list of positions pre calculated to move the bot also receved as argument 
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

    // After every step, emits the new state
    emitUpdate(bot)

    // Walk again in 200ms if is not paused and there is new positions to go
    if(!bot.isPaused)
    setTimeout(() => {
        if (positions.length > 0) {
            walk(positions, bot)

        } else {
            setNextGoal(bot)
        }
    }, 200)


}

// Utility function not used at production
function getNextFrees(i, j) {
    const result = [];

    if (bot.map.floorPlan[j + 1][i] == ' ') result.push([j + 1, i])
    if (bot.map.floorPlan[j - 1][i] == ' ') result.push([j - 1, i])
    if (bot.map.floorPlan[j][i + 1] == ' ') result.push([j, i + 1])
    if (bot.map.floorPlan[j][i - 1] == ' ') result.push([j, i - 1])

    return result;
}

// Function that searchs for NOT CLEANED Areas and calculate the path to it
async function setNextGoal(bot) {
    junkRemoval(bot)
    // Current position is marked as 'x'
    bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 'x'
    emitUpdate(bot)

    easystar.setGrid(bot.map.floorPlan)
    easystar.setAcceptableTiles([0, 2]);

    wLoop:
    for (let j = 0; j < bot.map.height; j++) {
        hLoop:

        for (let i = 0; i < bot.map.width; i++) {

            if (bot.map.floorPlan[j][i] == 0) {


                // If a NOT CLEANED Area is found, claculate path, call 'walk' and break the loop
                console.log(`next goal: [${j}][${i}]`)


                printMap(bot.map.floorPlan)
                console.log(bot.map.totalWalkTiles)
                console.log(bot.map.totalCleanedTiles)

                easystar.findPath(bot.currPos[1], bot.currPos[0], i, j, function (path) {
                    if (path === null) {
                        console.warn("Path was not found.");
                    } else {
                        walk(path, bot)
                    }
                });

                easystar.calculate()


                break wLoop;


            }

            // If the loop completes all spots are cleaned or the robot is over the last one to be cleaned 
            // Emits 'finished' signal
            if (i >= bot.map.width - 1 && j >= bot.map.height - 1) {

                bot.totalCleanedTiles = bot.totalWalkTiles;
                // bot.map.floorPlan[bot.currPos[0]][bot.currPos[1]] = 2

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

// Utility function to remove any non usable information at the working map
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

// Kill/Stop Bot
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

// Update signal
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