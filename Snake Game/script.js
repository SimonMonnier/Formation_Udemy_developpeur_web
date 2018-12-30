window.onload = function(){
	var canvas;
	var canvasWidth = 900;
	var canvasHeigth = 600;
	var blockSize = 20;
	var contex;
	var delay = 100;
	var theSnake;
	var theApple;
	var widthInBlocks = canvasWidth / blockSize;
	var heightInBlocks = canvasHeigth / blockSize;
	var score;
	var timeout;

	init();

	function init(){
		canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeigth;
		canvas.style.border = "20px solid  #AAAAAA";
		canvas.style.margin = "50px auto";
		canvas.style.backgroundColor = "#DDDDDD "
		canvas.style.display = "block";
		document.body.appendChild(canvas);
		contex = canvas.getContext('2d');
		theSnake = new snake([[6,4], [5,4], [4,4]], "right");
		theApple = new apple([10, 15]);
		score = 0;
		refreshCanvas();
	}

	function refreshCanvas(){
		theSnake.advance();

		if(theSnake.checkCollision()){
			gameOver();
		}
		else{
			if(theSnake.isEatingApple(theApple)){
				theSnake.ateApple = true;
				score++;
				do{
					theApple.setNewPosition();
				}
				while(theApple.isOnSnake(theSnake));
			}
			contex.clearRect(0, 0, canvasWidth, canvasHeigth);
			drawScore();
			theSnake.draw();
			theApple.draw();
			timeout = setTimeout(refreshCanvas, delay);
		}
	}

	function gameOver(){
		contex.save();
		contex.font = "bold 70px sans-serif";
		contex.fillStyle = "#000000";
		contex.textAlign = "center";
		contex.textBaseline = "middle";
		contex.strokeStyle = "white";
		contex.lineWidth = 5;
		var centerX = canvasWidth / 2;
		var centerY = canvasHeigth / 2;
		contex.strokeText("Game Over", centerX, centerY - 160);
		contex.fillText("Game Over", centerX, centerY - 160);
		contex.font = "bold 30px sans-serif";
		contex.lineWidth = 1.5;
		contex.fillText("Appuyez sur Espace pour rejouer !", centerX, centerY + 160);
		contex.strokeText("Appuyez sur Espace pour rejouer !", centerX, centerY + 160);
		contex.restore();
	}

	function restart(){
		theSnake = new snake([[6,4], [5,4], [4,4]], "right");
		theApple = new apple([10, 15]);
		score = 0;
		clearTimeout(timeout);
		refreshCanvas();
	}

	function drawScore(){
		contex.save();
		contex.font = "bold 150px sans-serif";
		contex.fillStyle = "#AAAAAA";
		contex.textAlign = "center";
		contex.textBaseline = "middle";
		var centerX = canvasWidth / 2;
		var centerY = canvasHeigth / 2;
		contex.fillText(score.toString(), centerX, centerY);
		contex.restore();
		gameover = true;
	}

	function drawBlock(contex, position){
		var x = position[0] * blockSize;
		var y = position[1] * blockSize;
		contex.fillRect(x, y, blockSize, blockSize);
	}

	function snake(body, direction){
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.draw = function(){
			contex.save();
			contex.fillStyle = "#2ECC40";
			for(var i = 0; i < this.body.length; i++){
				drawBlock(contex, this.body[i]);
			}
			contex.restore();
		};
		this.advance = function(){
			var nextPosition = this.body[0].slice();
			switch(this.direction){
				case "right":
					nextPosition[0]++;
					break;
				case "left":
					nextPosition[0]--;
					break;
				case "up":
					nextPosition[1]--;
					break;
				case "down":
					nextPosition[1]++;
					break;
				default:
					throw("invalid direction");
			}
			this.body.unshift(nextPosition);
			if(!this.ateApple)
				this.body.pop();
			else
				this.ateApple = false;
		};
		this.setDirection = function(newDirection){
			var allowedDirections;
			switch(this.direction){
				case "right":
				case "left":
					allowedDirections = ["up", "down"];
					break;
				case "up":
				case "down":
					allowedDirections = ["right", "left"];
					break;
				default:
					throw("invalid direction");
			}
			if(allowedDirections.indexOf(newDirection) > -1){
				this.direction = newDirection;
			}
		};
		this.checkCollision = function(){
			var wallCollision = false;
			var snakeCollision = false;
			var head = this.body[0];
			var rest = this.body.slice(1);
			var snakeX = head[0];
			var snakeY = head[1];
			var minY = 0;
			var minX = 0;
			var maxY = heightInBlocks - 1;
			var maxX = widthInBlocks - 1;
			var isNotBetweenHorizontalWall = snakeX < minX || snakeX > maxX;
			var isNotBetweenVerticalWall = snakeY < minY || snakeY > maxY;

			if(isNotBetweenHorizontalWall || isNotBetweenVerticalWall)
				wallCollision = true;

			for(var i = 0; i < rest.length; i++){
				if(snakeX === rest[i][0] && snakeY === rest[i][1])
					snakeCollision = true;
			}
			return wallCollision || snakeCollision;
		};
		this.isEatingApple = function(appelToEat){
			var head = this.body[0];

			if(head[0] === appelToEat.position[0] && head[1] === appelToEat.position[1])
				return true;
			else
				return false;
		};
	}

	function apple(position){
		this.position = position;
		this.draw = function(){
			contex.save();
			contex.fillStyle = "#FF4136";
			contex.beginPath();
			var radius = blockSize / 2;
			var x = this.position[0] * blockSize + radius;
			var y = this.position[1] * blockSize + radius;
			contex.arc(x, y, radius, 0, Math.PI * 2, true);
			contex.fill();
			contex.restore();
		}
		this.setNewPosition = function(){
			var newX = Math.round(Math.random() * (widthInBlocks - 1));
			var newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX, newY];
		};
		this.isOnSnake = function(snakeToCheck){
			var isOnSnake = false;

			for(var i = 0; i < snakeToCheck.body.length; i++){
				if(this.position[0] === snakeToCheck.body[i][0] && snakeToCheck.body[i][1])
					isOnSnake = true;
			}
			return isOnSnake;
		}
	}

	document.onkeydown = function handleKeyDown(e){
		var key = e.keyCode;
		var newDirection;
		
		switch(key){
			case 37: //fléche de gauche
				newDirection = "left";
				break;
			case 38: // fléche du haut
				newDirection = "up";
				break;
			case 39: //fléche de droite
				newDirection = "right";
				break;
			case 40: //fléche du bas
				newDirection = "down";
				break;
			case 32:
				restart();
				return;
			default:
				return;
		}
		theSnake.setDirection(newDirection);
	}
}