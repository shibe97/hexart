(function(){
    window.requestAnimationFrame = (function(){
        return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');

    window.Hexart = (function(){
        var Hex = function(ctx, x, y, offsetX, offsetY, r, angle, color, fixed){
            this.x = x;
            this.y = y;
            this.r = r;
            this.angle = angle;
            this.color = color;
            this.xPos = x * (Math.sqrt(3) / 2) * r + offsetX;
            this.yPos = y * 1.5 * r + offsetY;
            this.rotateFlag = false;
            this.rotateTimer = 0;
            this.rotateCenter = 0; // 0:回転なし, 1:左下, 2:左上, 3:上, 4:右上, 5:右下, 6:下
            this.rotateDirection = 0; // 0:回転なし, 1:時計回り, 2:半時計回り
            this.fixed = fixed || false;

            // 六角形を描画
            this.render = function(){
                ctx.beginPath();

                // 内角
                var radDiv = (Math.PI * 2) / 6;
                
                // 回転オフセット(省略時は270°)
                var radOffset = this.angle * Math.PI / 180;
                
                // パス描画
                ctx.moveTo(this.xPos + Math.cos(radOffset) * this.r, this.yPos + Math.sin(radOffset) * this.r);
                for (var i = 1; i < 6; ++i) {
                    var rad = radDiv * i + radOffset;
                    ctx.lineTo(
                        this.xPos + Math.cos(rad) * this.r,
                        this.yPos + Math.sin(rad) * this.r
                    );
                }

                ctx.fillStyle = this.color;
                ctx.closePath();
                ctx.fill();
            };

            // 頂点を軸に回転させる
            this.rotate = function(){
                if(this.rotateTimer < 120){
                    this.rotateTimer+=2;
                    var theta = 90 + this.rotateCenter * 60;

                    if(this.rotateDirection === 1){
                        this.angle = 90 + this.rotateTimer;
                        this.xPos = this.x * (Math.sqrt(3) / 2) * this.r + Math.cos(theta*Math.PI/180) * this.r + this.r * Math.cos((-90 + this.rotateCenter * 60 + this.rotateTimer)*Math.PI/180) + offsetX;
                        this.yPos = this.y * 1.5 * this.r + Math.sin(theta*Math.PI/180) * this.r + this.r * Math.sin((-90 + this.rotateCenter * 60 + this.rotateTimer)*Math.PI/180) + offsetY;
                    } else if(this.rotateDirection === 2){
                        this.angle = 90 - this.rotateTimer;
                        this.xPos = this.x * (Math.sqrt(3) / 2) * this.r + Math.cos(theta*Math.PI/180) * this.r + this.r * Math.cos((-90 + this.rotateCenter * 60 - this.rotateTimer)*Math.PI/180) + offsetX;
                        this.yPos = this.y * 1.5 * this.r + Math.sin(theta*Math.PI/180) * this.r + this.r * Math.sin((-90 + this.rotateCenter * 60 - this.rotateTimer)*Math.PI/180) + offsetY;
                    }
                } else {
                    this.rotateTimer = 0;
                    this.rotateFlag = false;
                    if((this.rotateCenter === 1 && this.rotateDirection === 1) || (this.rotateCenter === 6 && this.rotateDirection === 2)){
                        this.x -= 1; 
                        this.y += 1; 
                    } else if((this.rotateCenter === 1 && this.rotateDirection === 2) || (this.rotateCenter === 2 && this.rotateDirection === 1)){
                        this.x -= 2;
                    } else if((this.rotateCenter === 2 && this.rotateDirection === 2) || (this.rotateCenter === 3 && this.rotateDirection === 1)){
                        this.x -= 1;
                        this.y -= 1;
                    } else if((this.rotateCenter === 3 && this.rotateDirection === 2) || (this.rotateCenter === 4 && this.rotateDirection === 1)){
                        this.x += 1;
                        this.y -= 1;
                    } else if((this.rotateCenter === 4 && this.rotateDirection === 2) || (this.rotateCenter === 5 && this.rotateDirection === 1)){
                        this.x += 2;
                    } else if((this.rotateCenter === 5 && this.rotateDirection === 2) || (this.rotateCenter === 6 && this.rotateDirection === 1)){
                        this.x += 1;
                        this.y += 1;
                    }
                    this.rotateCenter = 0;
                    this.rotateDirection = 0;

                }
            };

            // 回転できる頂点を見つける
            this.decideRotation = function(){
                if(this.fixed){
                    return false;
                }
                
                // 0:左上, 1:左, 2:左下, 3:右下, 4:右, 5:右上
                var vertex = [0, 0, 0, 0, 0, 0];
                hexes.forEach(function(_hex, index){
                    if(_hex.x === this.x - 1 && _hex.y === this.y - 1){
                        vertex[0] = 1;
                    }
                    if(_hex.x === this.x - 2 && _hex.y === this.y){
                        vertex[1] = 1;
                    }
                    if(_hex.x === this.x - 1 && _hex.y === this.y + 1){
                        vertex[2] = 1;
                    }
                    if(_hex.x === this.x + 1 && _hex.y === this.y + 1){
                        vertex[3] = 1;
                    }
                    if(_hex.x === this.x + 2 && _hex.y === this.y){
                        vertex[4] = 1;
                    }
                    if(_hex.x === this.x + 1 && _hex.y === this.y - 1){
                        vertex[5] = 1;
                    }
                }, this);

                var available = [];
                if(vertex[0] === 0 && vertex[1] === 0 && vertex[2] === 0){
                    if(vertex[5] === 1){
                        if(!checkExistence(this.x - 3, this.y - 1)){
                            available.push({
                                center: 3,
                                direction: 1 //時計
                            });
                        }
                    }
                    if(vertex[3] === 1){
                        if(!checkExistence(this.x - 3, this.y + 1)){
                            available.push({
                                center: 6,
                                direction: 2 //反時計
                            });
                        }
                    }
                }
                if(vertex[1] === 0 && vertex[2] === 0 && vertex[3] === 0){
                    if(vertex[0] === 1){
                        if(!checkExistence(this.x - 3, this.y + 1)){
                            available.push({
                                center: 2,
                                direction: 1 //時計
                            });
                        }
                    }
                    if(vertex[4] === 1){
                        if(!checkExistence(this.x, this.y + 2)){
                            available.push({
                                center: 5,
                                direction: 2 //反時計
                            });
                        }
                    }
                }
                if(vertex[2] === 0 && vertex[3] === 0 && vertex[4] === 0){
                    if(vertex[1] === 1){
                        if(!checkExistence(this.x, this.y + 2)){
                            available.push({
                                center: 1,
                                direction: 1 //時計
                            });
                        }
                    }
                    if(vertex[5] === 1){
                        if(!checkExistence(this.x + 3, this.y + 1)){
                            available.push({
                                center: 4,
                                direction: 2 //反時計
                            });
                        }
                    }
                }
                if(vertex[3] === 0 && vertex[4] === 0 && vertex[5] === 0){
                    if(vertex[2] === 1){
                        if(!checkExistence(this.x + 3, this.y + 1)){
                            available.push({
                                center: 6,
                                direction: 1 //時計
                            });
                        }
                    }
                    if(vertex[0] === 1){
                        if(!checkExistence(this.x + 3, this.y - 1)){
                            available.push({
                                center: 3,
                                direction: 2 //反時計
                            });
                        }
                    }
                }
                if(vertex[4] === 0 && vertex[5] === 0 && vertex[0] === 0){
                    if(vertex[3] === 1){
                        if(!checkExistence(this.x + 3, this.y - 1)){
                            available.push({
                                center: 5,
                                direction: 1 //時計
                            });
                        }
                    }
                    if(vertex[1] === 1){
                        if(!checkExistence(this.x, this.y - 2)){
                            available.push({
                                center: 2,
                                direction: 2 //反時計
                            });
                        }
                    }
                }
                if(vertex[5] === 0 && vertex[0] === 0 && vertex[1] === 0){
                    if(vertex[4] === 1){
                        if(!checkExistence(this.x, this.y - 2)){
                            available.push({
                                center: 4,
                                direction: 1 //時計
                            });
                        }
                    }
                    if(vertex[2] === 1){
                        if(!checkExistence(this.x - 3, this.y - 1)){
                            available.push({
                                center: 1,
                                direction: 2 //反時計
                            });
                        }
                    }
                }


                if(available.length === 2){
                    if(Math.random() < 0.5){
                        this.rotateCenter = available[0].center;
                        this.rotateDirection = available[0].direction;
                    } else {
                        this.rotateCenter = available[1].center;
                        this.rotateDirection = available[1].direction;
                    }
                    return true;
                } else if(available.length === 1){
                    this.rotateCenter = available[0].center;
                    this.rotateDirection = available[0].direction;
                } else {
                    return false;
                }
                
            };

        };


        var moveHex = function(){
            var hex = hexes[Math.floor(hexes.length * Math.random())];
            if(hex.decideRotation()){
                hex.rotateFlag = true;            
            } else {
                moveHex();
            }
        };

        /**
         * 指定した座標にHexがあるかどうかを確認
         *
         */ 
        var checkExistence = function(x, y){
            var existFlag = false;
            hexes.forEach(function(_hex, index){
                if(_hex.x === x && _hex.y === y){
                    existFlag = true;
                }
            });
            return existFlag;
        };
        var hexes = [];
        

        return {
            
            /**
             * Hexart
             * @param {number} row
             * @param {number} col
             * @param {number} r
             *
             */ 
            init : function(row, col, r){
                this.createHexes(row, col, r);
                setInterval(moveHex, 1500);
                this.loop();
            },
            createHexes : function(row, col, r){
                var offsetX = (canvas.width - (Math.sqrt(3) / 2) * r * (row+1)) / 2;
                var offsetY = (canvas.height - 1.5 * r * (col+1)) / 2;

                for(var i=1; i<=row; i++){
                    for(var j=1; j<=col; j++){
                        if((i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1)){
                            var random = Math.random();
                            if(random > 0.9){
                                hexes.push(new Hex(ctx, i, j, offsetX, offsetY, r, 90, "#eee", true));
                            } else if(random > 0.5) {
                                hexes.push(new Hex(ctx, i, j, offsetX, offsetY, r, 90, "#"+Math.floor(Math.random() * 0xFFFFFF).toString(16)));
                            }
                        }
                    }
                }
            },
            loop : function(){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                hexes.forEach(function(_hex, index){
                    if(_hex.rotateFlag){
                        _hex.rotate();
                    }
                    _hex.render();
                });
                requestAnimationFrame(this.loop.bind(this));
            }
        };
    })();


})();
