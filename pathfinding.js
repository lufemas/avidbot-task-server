// Start location will be in the following format:
// [distanceFromTop, distanceFromLeft]
const findShortestPath = function (startCoordinates, grid, goal) {
    let distanceFromTop = startCoordinates[0];
    let distanceFromLeft = startCoordinates[1];

    grid[goal[0]][goal[1]] = 9

    // console.log(grid)

    console.log(startCoordinates)

    // Each "location" will store its coordinates
    // and the shortest path required to arrive there
    let location = {
        distanceFromTop: distanceFromTop,
        distanceFromLeft: distanceFromLeft,
        path: [],
        status: 'Start'
    };

    // Initialize the queue with the start location already inside
    let queue = [location];

    // console.log(grid)
    // Loop through the grid searching for the goal
    while (queue.length > 0) {

        console.log('while')
        // Take the first location off the queue
        let currentLocation = queue.shift();

        // Explore North
        //   if(currentLocation.cameFrom != 'North'){

        let newLocation = exploreInDirection(currentLocation, 'North', grid);
        if (newLocation.status === 'Goal') {

            return newLocation.path;
        } else if (newLocation.status === 'Valid') {
            queue.push({...newLocation});
            console.log(currentLocation.cameFrom)
            console.log('N')

        }
        //   }

        // Explore East
        //   if(currentLocation.cameFrom != 'East'){

        newLocation = exploreInDirection(currentLocation, 'East', grid);
        if (newLocation.status === 'Goal') {

            return newLocation.path;
        } else if (newLocation.status === 'Valid') {
            queue.push({...newLocation});
            console.log(currentLocation.cameFrom)
            console.log('E')

        }
        // }

        // Explore South
        //   if(currentLocation.cameFrom != 'South'){

        newLocation = exploreInDirection(currentLocation, 'South', grid);
        if (newLocation.status === 'Goal') {

            return newLocation.path;
        } else if (newLocation.status === 'Valid') {
            queue.push({...newLocation});
            console.log(currentLocation.cameFrom)
            console.log('S')

        }
        // }

        // Explore West
        //   if(currentLocation.cameFrom != 'West'){

        newLocation = exploreInDirection(currentLocation, 'West', grid);
        if (newLocation.status === 'Goal') {

            return newLocation.path;
        } else if (newLocation.status === 'Valid') {
            queue.push({...newLocation});
            console.log(currentLocation.cameFrom)
            console.log('W')

        }
        // }
    }


    console.log('nothing')
    // No valid path found
    return false;

};

// This function will check a location's status
// (a location is "valid" if it is on the grid, is not an "obstacle",
// and has not yet been visited by our algorithm)
// Returns "Valid", "Invalid", "Blocked", or "Goal"
const locationStatus = function (location, grid) {
    let gridHeight = grid.length;
    let gridWidth = grid[0].length;
    let dft = location.distanceFromTop;
    let dfl = location.distanceFromLeft;

    if (location.distanceFromLeft < 0 ||
        location.distanceFromLeft >= gridWidth ||
        location.distanceFromTop < 0 ||
        location.distanceFromTop >= gridHeight) {

        // location is not on the grid--return false
        return 'Invalid';
    } else if (grid[dft][dfl] == 9) {
        return 'Goal';
    } else if (grid[dft][dfl] != 0) {
        // location is either an obstacle or has been visited
        return 'Blocked';
    } else {
        return 'Valid';
    }
};


// Explores the grid from the given location in the given
// direction
const exploreInDirection = function (currentLocation, direction, grid) {
    let newPath = currentLocation.path.slice();
    newPath.push(direction);
    currentLocation.status = 'Visited'
    console.log(currentLocation.status)
    let dft = currentLocation.distanceFromTop;
    let dfl = currentLocation.distanceFromLeft;

    if (direction === 'North') {
        cameFrom = 'South'
        dft -= 1;
    } else if (direction === 'East') {
        cameFrom = 'West'

        dfl += 1;
    } else if (direction === 'South') {
        cameFrom = 'North'

        dft += 1;
    } else if (direction === 'West') {
        cameFrom = 'East'

        dfl -= 1;
    }

    let newLocation = {
        distanceFromTop: dft,
        distanceFromLeft: dfl,
        path: newPath,
        status: 'Unknown',
        cameFrom: cameFrom
    };
    newLocation.status = locationStatus({...newLocation}, grid);
    // If this new location is valid, mark it as 'Visited'
    if (newLocation.status === 'Valid') {
        // grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 3;
        // newLocation.status = 'Visited';
    }
    console.log(newLocation.status)

    return {...newLocation};
};


// OK. We have the functions we need--let's run them to get our shortest path!

// Create a 4x4 grid
// Represent the grid as a 2-dimensional array

function setup(startPos, newGrid, goal) {


    //   let gridHeight = 14;
    //   let gridWidth = 20
    //   let grid = [];
    //   for (let i=0; i<gridHeight; i++) {
    //     grid[i] = [];
    //     for (let j=0; j<gridWidth; j++) {
    //       grid[i][j] = 'Empty';
    //     }
    //   }



    return findShortestPath(startPos, newGrid, goal);
}

// Think of the first index as "distance from the top row"
// Think of the second index as "distance from the left-most column"

// This is how we would represent the grid with obstacles above
//   grid[1][1] = "Start";
//   grid[5][3] = 9;

module.exports = setup

