var map = [];
for(var row = 0; row < settings.gridScale.row; row++) {
	map[row] = [];
	for(var col = 0; col < settings.gridScale.col; col++)
		map[row][col] = new mapCell();
}


addTile(3, 10, "grass");
addTile(4, 7, "grass");
addObstacle(1, 1, "box1", true);
addObstacle(6, 7, "box2", true);


function addTile(row, col, subType) {
	map[row][col].type = "tile";
	map[row][col].subType = subType;
}

function addObstacle(row, col, subType, canBeDestroyed) {
	map[row][col].type = "obstacle";
	map[row][col].subType = subType;
	map[row][col].canBeDestroyed = canBeDestroyed;
}
