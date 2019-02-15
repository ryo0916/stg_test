function Character(){
    this.position = new Point();
    this.size = 0;
}

Character.prototype.init = function(size){
    this.size = size;
};

function CharacterShot(){
    this.position = new Point();
    this.size = 0;
    this.speed = 0;
    this.alive = false;
}

CharacterShot.prototype.set = function(p, size, speed){
    // 座標をセット
    this.position.x = p.x;
    this.position.y = p.y;

    // サイズ、スピードをセット
    this.size = size;
    this.speed = speed;

    // 生存フラグを立てる
    this.alive = true;
};

CharacterShot.prototype.move = function(){
    // 座標を真上にspeed分だけ移動させる
    this.position.y -= this.speed;

    // 一定以上の座標に到達していたら生存フラグを降ろす
    if(this.position.y < -this.size){
        this.alive = false;
    }
};

function Enemy(){
    this.position = new Point();
    this.size = 0;
    this.type = 0;
    this.params = 0;
    this.alive = false;
}

Enemy.prototype.set = function(p, size, type){
    // 座標をセット
    this.position.x = p.x;
    this.position.y = p.y;

    // サイズ、タイプをセット
    this.size = size;
    this.type = type;

    // パラメーターをリセット
    this.params = 0;

    // 生存フラグを立てる
    this.alive = true;
};

Enemy.prototype.move = function(){
    // パラメーターをインクリメント
    this.params++;

    // タイプに応じて分岐
    switch(this.type){
        case 0:
            // X 方向へまっすぐ進む
            this.position.x += 2;

            // スクリーンの右端より奥に到達したら生存フラグを降ろす
            if(this.position.x > this.size + screenCanvas.width){
                this.alive = false;
            }
            break;
        case 1:
            // マイナス X 方向へまっすぐ進む
            this.position.x -= 2;

            // スクリーンの左端より奥に到達したら生存フラグを降ろす
            if(this.position.x < -this.size){
                this.alive = false;
            }
            break;
    }
};