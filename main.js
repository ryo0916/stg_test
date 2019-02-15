// global
var screenCanvas, info;
var run = true;
var fps = 1000 / 30;
var mouse = new Point();
var ctx; // canvas2d コンテキスト格納用
var fire = false;
var counter = 0;

// const 定数
var CHARA_COLOR = 'rgba(0, 0, 255, 0.75)';
var CHARA_SHOT_COLOR = 'rgba(0, 255, 0, 0.75)';
var CHARA_SHOT_MAX_COUNT = 10;
var ENEMY_COLOR = 'rgba(255, 0, 0, 0.75)';
var ENEMY_MAX_COUNT = 10;
var ENEMY_SHOT_COLOR = 'rgba(255, 0, 255, 0.75)';
var ENEMY_SHOT_MAX_COUNT = 100;

// main
window.onload = function(){
    // 変数宣言
    var i, j;
    var p = new Point();

    // スクリーンの初期化
    screenCanvas = document.getElementById('screen');
    screenCanvas.width = 256;
    screenCanvas.height = 256;

    // 2dコンテキスト
    ctx = screenCanvas.getContext('2d');

    // イベントの登録
    screenCanvas.addEventListener('mousemove', mouseMove, true);
    screenCanvas.addEventListener('mousedown', mouseDown, true);
    window.addEventListener('keydown', keyDown, true);

    // その他のエレメント関連
    info = document.getElementById('info');

    // 自機初期化
    var chara = new Character();
    chara.init(10);

    // ショット初期化
    var charaShot = new Array(CHARA_SHOT_MAX_COUNT);
    for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
        charaShot[i] = new CharacterShot();
    }

    // 敵キャラ用インスタンスの初期化
    var enemy = new Array(ENEMY_MAX_COUNT);
    for(i = 0; i < ENEMY_MAX_COUNT; i++){
        enemy[i] = new Enemy();
    }

    // エネミーショット初期化
    var enemyShot = new Array(ENEMY_SHOT_MAX_COUNT);
    for(i = 0; i < ENEMY_SHOT_MAX_COUNT; i++){
      enemyShot[i] = new EnemyShot();
    }

    // ループ処理を呼び出す
    (function(){
        // カウンタをインクリメント
        counter++;

        // HTMLを更新
        info.innerHTML = mouse.x + ' : ' + mouse.y;

        // screenクリア
        ctx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);

        // パスの設定を開始
        ctx.beginPath();

        // 自機の位置を設定
        chara.position.x = mouse.x;
        chara.position.y = mouse.y;

        // 自機を描くパスを設定
        ctx.arc(chara.position.x, chara.position.y, chara.size, 0, Math.PI * 2, false);

        // 自機の色を設定する
        ctx.fillStyle = CHARA_COLOR;

        // 自機を描く
        ctx.fill();

        // fireフラグの値により分岐
        if(fire){
            // 全ての自機ショットを調査する
            for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
                if(!charaShot[i].alive){
                    // 自機ショットを新規にセット
                    charaShot[i].set(chara.position, 3, 5);

                    // ループを抜ける
                    break;
                }
            }
            // フラグを降ろしておく
            fire = false;
        }

        // ショットパスの設定を開始
        ctx.beginPath();

        // 全ての自機ショットを調査する
        for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
            // 自機ショットが既に発射されているかチェック
            if(charaShot[i].alive){
                // 自機ショットを動かす
                charaShot[i].move();

                // 自機ショットを描くパスを設定
                ctx.arc(
                    charaShot[i].position.x,
                    charaShot[i].position.y,
                    charaShot[i].size,
                    0, Math.PI * 2, false
                );

                // パスをいったん閉じる
                ctx.closePath();
            }
        }

        // 自機ショットの色を設定する
        ctx.fillStyle = CHARA_SHOT_COLOR;

        // 自機ショットを描く
        ctx.fill();

        // 敵キャラの出現管理
        // 100フレームに一度出現
        if(counter % 100 === 0){
            // 全ての敵キャラを調査
            for(i = 0; i < ENEMY_MAX_COUNT; i++){
                // 敵キャラの生存フラグをチェック
                if(!enemy[i].alive){
                    // タイプを決定するパラメータを算出
                    j = (counter % 200) / 100;

                    // タイプに応じて初期位置を決める
                    var enemySize = 15;
                    p.x = -enemySize + (screenCanvas.width + enemySize * 2) * j
                    p.y = screenCanvas.height / 2;

                    // 敵キャラを新規にセット
                    enemy[i].set(p, enemySize, j);

                    // 1体出現させたのでループを抜ける
                    break;
                }
            }
        }

        // 敵キャラの設定を開始
        ctx.beginPath();

        // 全ての敵キャラを調査
        for(i = 0; i < ENEMY_MAX_COUNT; i++){
            // 敵キャラの生存フラグをチェック
            if(enemy[i].alive){
                // 敵キャラを動かす
                enemy[i].move();

                // 敵キャラを描くパスを設定
                ctx.arc(
                    enemy[i].position.x,
                    enemy[i].position.y,
                    enemy[i].size,
                    0, Math.PI * 2, false
                );

                // ショットを打つかどうかパラメータの値からチェック
                if(enemy[i].params % 30 === 0){
                  // エネミーショットを調査する
                  for(j = 0; j < ENEMY_SHOT_MAX_COUNT; j++){
                    if(!enemyShot[j].alive){
                      // エネミーショットを新規にセットする
                      p = enemy[i].position.distance(chara.position);
                      p.normalize();
                      enemyShot[j].set(enemy[i].position, p, 5, 5);

                      // 1個出現させたのでループを抜ける
                      break;
                    }
                  }
                }
                ctx.closePath();
            }
        }
        ctx.fillStyle = ENEMY_COLOR;
        ctx.fill();

        // エネミーショット
        ctx.beginPath();

        // 全てのエネミーショットを調査する
        for(i = 0; i < ENEMY_SHOT_MAX_COUNT; i++){
          // エネミーショットが既に発射されているかチェック
          if(enemyShot[i].alive){
            // エネミーショットを動かす
            enemyShot[i].move();

            // エネミーショットを描くパスを設定
            ctx.arc(
              enemyShot[i].position.x,
              enemyShot[i].position.y,
              enemyShot[i].size,
              0, Math.PI * 2, false
            );

            // パスをいったん閉じる
            ctx.closePath();

          }
        }

        // エネミーショットの色を設定する
        ctx.fillStyle = ENEMY_SHOT_COLOR;

        // エネミーショットを描く
        ctx.fill();

        // 衝突判定
        // 全ての自機ショットの生存フラグをチェック
        for(i = 0; i < CHARA_SHOT_MAX_COUNT; i++){
          // 自機ショットの生存フラグをチェック
          if(charaShot[i].alive){
            // 自機ショットとエネミーとの衝突判定
            for(j = 0; j < ENEMY_MAX_COUNT; j++){
              // エネミーの生存フラグをチェック
              if(enemy[j].alive){
                // エネミーと自機ショットとの距離を計測
                p = enemy[j].position.distance(charaShot[i].position);
                if(p.length() < enemy[j].size){
                  // 衝突していたら生存フラグを降ろす
                  enemy[j].alive = false;
                  charaShot[i].alive = false;

                  // 衝突があったのでループを抜ける
                  break;
                }
              }
            }
          }
        }

        // フラグにより再帰呼び出し
        if(run){setTimeout(arguments.callee, fps);}
    })();
};

// event
function mouseMove(event){
    // マウスカーソル座標の更新
    mouse.x = event.clientX - screenCanvas.offsetLeft;
    mouse.y = event.clientY - screenCanvas.offsetTop;
}

function keyDown(event){
    // キーコードを取得
    var ck = event.keyCode;

    // Escキーが押されていたらフラグを降ろす
    if(ck == 27){run = false;}
}

function mouseDown(event){
    // フラグを立てる
    fire = true;
}
