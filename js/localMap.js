function MapCell() {
	this.type = "background";	// background(default), tile, obstacle
	this.subType = "none";
}

var localMap = [];
for(var row = 0; row < settings.gridScale.row; row++) {
	localMap[row] = [];
	for(var col = 0; col < settings.gridScale.col; col++)
		localMap[row][col] = new MapCell();
}

function addTile(row, col, subType) {
	localMap[row][col].type = "tile";
	localMap[row][col].subType = subType;
}

function addObstacle(row, col, subType) {
	localMap[row][col].type = "obstacle";
	localMap[row][col].subType = subType;
}

addTile(1, 1, "grass");
addTile(6, 7, "grass");
addObstacle(3, 10, "box1");
addObstacle(4, 7, "box2");
