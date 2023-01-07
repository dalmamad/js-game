let dark_layer_opacity = 0;
let opacity_speed = 1;
let dark_layer = document.getElementById('dark-layer'); 
var start_mode = false;
var story_mode = false;
var gameplay_mode = false; 
function Start(){
    start_mode = true;
    let k = true;
    document.getElementById('start').style.display = 'block'
    document.addEventListener('keydown',(key)=>{
        if(key.key=='Enter' && start_mode){
            start_mode = false;
            let fade = setInterval(()=>{
                dark_layer_opacity+=opacity_speed;
                dark_layer.style.opacity = dark_layer_opacity+'%';
                if(dark_layer_opacity>=100){
                    opacity_speed*=-1;
                    document.getElementById('start').style.display = 'none';
                    if(k){
                        Story();
                        k = false;
                    }
                }
                if(dark_layer_opacity<=0){
                    dark_layer_opacity=0;
                    opacity_speed = 1;
                    clearInterval(fade);
                }
            },10)
        }
    })
}

function Story(){
    let story_music = new Audio('./audio/tunnel.mp3');
    story_music.play();
    story_mode = true;
    let story = document.getElementById('story')
    let story_background = document.getElementById('story-background')
    let story_container = document.getElementById('story-container')
    story.style.display = 'block';
    let story_opacity_speed = 0;
    let story_opacity = 100;
    let story_text = document.getElementById('story-text');
    let story_str = story_text.innerHTML;
    story_text.innerHTML = '';
    let story_arr =  story_str.split("");
    let i = 0;
    document.addEventListener('keydown',(key)=>{
        if(key.key=='Enter' && story_mode && dark_layer_opacity==0){
            dark_layer.style.zIndex = 10;
            story_mode = false;
            let fade = setInterval(()=>{
                if(story_music.volume>0.02)
                    story_music.volume -= 0.01;
                dark_layer_opacity+=opacity_speed;
                dark_layer.style.opacity = dark_layer_opacity+'%';
                if(dark_layer_opacity>=100){
                    clearInterval(story_reveal);
                    story_music.pause();
                    opacity_speed *= -1;
                    story_opacity_speed = opacity_speed;
                    story.style.display = 'none';
                    story_background.style.display = 'none';
                    document.getElementById('gameplay').style.display = 'block';
                    Gameplay();
                }
                if(dark_layer_opacity<=0){
                    dark_layer_opacity=0;
                    opacity_speed = 1;
                    clearInterval(fade);
                }
            },10)
        }
    })
    let story_reveal = setInterval(()=>{
        if(i==story_arr.length){
            if(story_music.volume>0.02)
                    story_music.volume -= 0.01;
            story_mode = false;
            story_opacity += story_opacity_speed;
            story_container.style.opacity = story_opacity+'%'; 
            dark_layer_opacity += opacity_speed;
            dark_layer.style.opacity = dark_layer_opacity+'%';
            if(dark_layer_opacity>=100){
                story_music.pause();
                opacity_speed *= -1;
                story_opacity_speed = opacity_speed;
                story_background.style.display = 'none'
                document.getElementById('gameplay').style.display = 'block'
                Gameplay();
            }
            if(dark_layer_opacity<=0){
                dark_layer_opacity=0;
                story.style.display = 'none';
                clearInterval(story_reveal);
                }
        }
        else{
            story_text.innerHTML+=story_arr[i];
            i++;
        }
    },100)
}



function Gameplay(){
    gameplay_mode = true;
    let game_sound = new Audio('./audio/stardust.mp3')
    game_sound.play();
    game_sound.volume = 0.7;
    game_sound.loop = true;
    const container = document.getElementById("playground-container");
    const container_ratio = container.offsetWidth/container.offsetHeight;
    const gameplay = document.getElementById('gameplay');
    container_width = 700;
    container_height = container_width *14/9;
    var weaponS = new Array();
    var enemieS = new Array();
    var enemy_speed = 0.2;
    var pause = false;
    var gameover = false;
    var bullet_miss_limit = 10;
    var enemy_miss_limit = 3; 
    var unlock_weapons = [];
    // unlock_weapons = ['type', weapon_lock, weapon_timespan, previous_timespan, timespan, explosive]
    var weapon_index = 0;
    var explosion_selector = [];
    var lock_weapons =[
        [0, 'Bullet', false, 0, 0, 0, false],
        [0, 'Grenade', false, 2000, 0,0, true]
        //[unlock_score,'type',weapon_lock,weapon_timespan, previous_timespan, timespan, explosive]
    ]

    /******************bullet constructor***************/
    //////////////////////////////////////////////////////
    
    function Bullet(){
        this.x_pos
        this.y_pos
        this.height
        this.x_center_point
        this.y_center_point
        this.stop = false;
        this.width = 1.5; //%
        this.speed = 0.5; //%
        this.src = './images/bullet.png'
        this.muzzle_flash = true;
        this.rotate = false;
        this.angle = 0;
        this.rotate_speed = 0; //deg
        this.explosion = false;
        this.explosion_range = 0; //%
        this.explosion_radius = 0; //%
        this.explosion_speed = 0; //%
        this.explosion_theta = 0; //deg
        this.explosion_theta_speed = 0; //deg
        this.explosion_array = new Array();
        this.explosion_end = false;

        this.create = function(){

            if(this.muzzle_flash){
                let muzzle_flash = document.getElementById("muzzle-flash");
                muzzle_flash.style.display = "inline";
                let muzzle_flash_width = 6; //%
                muzzle_flash.style.width = muzzle_flash_width+'%';
                muzzle_flash.style.left = (100*fighter.being.offsetLeft/container.offsetWidth + fighter.width/2 -muzzle_flash_width/2)+'%';
                muzzle_flash.style.top = (100*fighter.being.offsetTop/container.offsetHeight-2.3)+'%';
                setTimeout(()=>{
                    muzzle_flash.style.display = "none"
                },100)
            }

            this.y_pos = fighter.being.offsetTop/container.offsetWidth*100 //%;
            this.being = document.createElement("img");
            this.being.setAttribute("src",this.src);
            this.being.addEventListener('load',()=>{
                container.appendChild(this.being);
                this.being.style.position = 'absolute';
                this.being.style.width = this.width+'%';
                this.height = 100*this.being.offsetHeight/container.offsetWidth //%;
                this.x_pos = 100*fighter.being.offsetLeft/container.offsetWidth + fighter.width/2 - this.width/2;
                this.x_center_point = this.x_pos+this.width/2;
                this.y_center_point = this.y_pos+this.height/2; 
                this.being.style.left = this.x_pos+'%';
                this.being.style.top = this.y_pos*container_ratio+'%';
            })
        }
        this.move = ()=>{
            if(!this.stop){
                this.y_pos-= this.speed;
                this.y_center_point = this.y_pos+this.height/2;
                this.x_center_point = this.x_pos+this.width/2;
                this.being.style.top = this.y_pos*container_ratio+'%';
                
                if(this.rotate){
                    this.angle +=this.rotate_speed
                    this.being.style.transform = 'rotate(' + this.angle + 'deg)';  
                }
            }
        }

        let explosion_expansion = true;
        let explosion_contraction = false;

        this.explosion_Process = ()=>{
            this.being.style.display = 'none';
            this.stop = true;
            if(explosion_expansion){
                this.explosion_radius += this.explosion_speed;
                let i = this.explosion_array.length;
                this.explosion_array[i] = document.createElement('div');
                container.appendChild(this.explosion_array[i]);
                this.explosion_array[i].classList.add('particle');
                this.explosion_array[i].style.left = this.x_center_point+Math.cos(this.explosion_theta)*this.explosion_radius+'%';
                this.explosion_array[i].style.top = (this.y_center_point+Math.sin(this.explosion_theta)*this.explosion_radius)*container_ratio+'%';
                this.explosion_theta+=this.explosion_theta_speed;
                if(this.explosion_radius>=this.explosion_range){
                    explosion_contraction=true;
                    explosion_expansion=false;
                }
            }
            if(explosion_contraction){
                let i = this.explosion_array.length;
                let delta_x = this.x_center_point-100*this.explosion_array[i-1].offsetLeft/container.offsetWidth;
                let delta_y = this.y_center_point-100*this.explosion_array[i-1].offsetTop/container.offsetWidth;
                let pow_delta = Math.pow(delta_x,2) + Math.pow(delta_y,2);
                this.explosion_radius = Math.pow(pow_delta,0.5);
                this.explosion_array[i-1].remove();
                this.explosion_array.splice(i-1,1);
                if(i==1)
                    this.end()
            }
        }

        this.end = ()=>{
            this.being.remove();
            let d1;
            let d2;
            for(let i1=0; i1<weaponS.length;i1++){
                for(let i2=0; i2<weaponS[i1].length; i2++){
                    if(weaponS[i1][i2]==this){
                        d1=i1;
                        d2=i2;
                    }
                }
            }
            if(this==explosion_selector[d1])
                fighter.explosion_switch('auto_switch',d1);
            weaponS[d1].splice(d2,1);
        }
    }
    
    /******************grenade constructor***************/
    //////////////////////////////////////////////////////

    function Grenade(){
        Bullet.call(this);
        this.width = 5; //%
        this.speed = 0.1; //%
        this.src = './images/grenade.png'
        this.muzzle_flash = false;
        this.rotate = true;
        this.rotate_speed = 5; //deg
        this.explosion_range = 30; //%
        this.explosion_speed = 0.1; //%
        this.explosion_theta_speed = 1; //deg
    }
    

    /******************fighter constructor***************/
    //////////////////////////////////////////////////////
    function Fighter(){
        let fire_sound = new Array();
        this.bullet_miss = 0;
        this.enemy_miss = 0;
        this.score = 0;
        this.hit = false;
        this.life = 3;
        this.life_loss = false;
        this.life_gain = false;
        this.speed = 0.8; //%
        this.fast_move = false;
        this.slow_move = false;
        this.fast_move_speed = 1.4; //%
        this.slow_move_speed = 0.3; //%
        this.being = document.getElementById("fighter")
        this.width = 100*this.being.offsetWidth/container.offsetWidth; //%



        this.firing = function(){
            if(!pause){
                let i = weaponS[weapon_index].length
                fire_sound[i] = new Audio('./audio/small-hit.wav');
                fire_sound[i].play();
                weaponS[weapon_index][i]= eval('new '+unlock_weapons[weapon_index][0]+"();");
                weaponS[weapon_index][i].create();
                if(explosion_selector[weapon_index]==undefined && unlock_weapons[weapon_index][5]){
                    this.explosion_switch('auto_switch')
                }
            }
        };
    
        this.mov_x_dir = function(key){
            if(key=="ArrowLeft"){
                if(this.being.offsetLeft<=1/15*this.being.offsetWidth)
                    this.being.style.left = 1/15*this.being.offsetWidth;
                else{
                    if(this.fast_move)
                        this.being.style.left = (100*this.being.offsetLeft/container.offsetWidth - this.fast_move_speed)+'%';
                    if(this.slow_move)
                          this.being.style.left = (100*this.being.offsetLeft/container.offsetWidth - this.slow_move_speed)+'%';
                    else
                        this.being.style.left = (100*this.being.offsetLeft/container.offsetWidth - this.speed)+'%';
                }
            }
            if(key=="ArrowRight"){
                if(this.being.offsetLeft>=container.offsetWidth-16/15*this.being.offsetWidth)
                    this.being.style.left = container.offsetWidth-16/15*this.being.offsetWidth;
                else{
                    if(this.fast_move)
                        this.being.style.left = (100*this.being.offsetLeft/container.offsetWidth + this.fast_move_speed)+'%';
                    if(this.slow_move){
                        this.being.style.left = (100*this.being.offsetLeft/container.offsetWidth + this.slow_move_speed)+'%';
                    }
                    else
                        this.being.style.left = (100*this.being.offsetLeft/container.offsetWidth + this.speed)+'%';
                };
            };

        };

        this.score_change = ()=>{
            if(this.hit){
                this.score++;
                document.getElementById('score').innerHTML ='score: '+this.score;
                this.hit = false;
            };
        };

        this.weapon_switch = (key)=>{
            if(key=='KeyD'){
                weaponS[weapon_index].icon.classList.remove('wepon-select')
                weapon_index++;
                if(weapon_index==unlock_weapons.length)
                    weapon_index=0;
                weaponS[weapon_index].icon.classList.add('wepon-select')
            }
            if(key=='KeyA'){
                weaponS[weapon_index].icon.classList.remove('wepon-select');
                weapon_index--;
                if(weapon_index<0)
                    weapon_index=unlock_weapons.length-1;
                weaponS[weapon_index].icon.classList.add('wepon-select')
            }
        }

        this.explosion_switch = (key,new_index)=>{
            let weapon_index_saver = weapon_index;
            if(new_index!=undefined){
                weapon_index = new_index;
            }
            if(unlock_weapons[weapon_index][5]){
                let not_exploded = new Array();
                let index;
                for(let i=0,j=0; i<weaponS[weapon_index].length; i++){
                    if(!weaponS[weapon_index][i].explosion){
                        not_exploded[j]=weaponS[weapon_index][i];
                        if(not_exploded[j]==explosion_selector[weapon_index])
                            index=j;
                        j++;
                    }
                }
                if(not_exploded.length!=0){
                    if(key=='ArrowDown'){
                        explosion_selector[weapon_index].being.classList.remove('selected');
                        index++;
                        if(index==not_exploded.length)
                            index=0;
                        explosion_selector[weapon_index]=not_exploded[index];
                        explosion_selector[weapon_index].being.classList.add('selected');
                    }
                    if(key=='ArrowUp'){
                        explosion_selector[weapon_index].being.classList.remove('selected');
                        index--;
                        if(index<0)
                        index=not_exploded.length-1; 
                        explosion_selector[weapon_index]=not_exploded[index];
                        explosion_selector[weapon_index].being.classList.add('selected');
                    }
                    if(key=='auto_switch'){
                        
                        if(index==0){
                            if(not_exploded.length!=1)
                                this.explosion_switch('ArrowDown');
                            else
                                explosion_selector[weapon_index]=undefined;
                        }
                        if(index>0){
                            this.explosion_switch('ArrowUp')
                        }
                        if(index==undefined){
                            explosion_selector[weapon_index]=not_exploded[0];
                            explosion_selector[weapon_index].being.classList.add('selected');
                        }
                    }
                }
                else
                    explosion_selector[weapon_index]=undefined;
            }
            weapon_index = weapon_index_saver;
        }
        
        this.weapon_explosion = ()=>{
            let ex_se = explosion_selector[weapon_index]
            fighter.explosion_switch('auto_switch');
            ex_se.explosion = true;
        }

        let life_image = document.getElementById('life');
        this.life_change = ()=>{
            if(this.life_loss){
                this.life--;
                this.life_loss_sound = new Audio('./audio/impacts-glass.mp3');
                this.life_loss_sound.play();
                if(this.life>=0){
                    life_image.setAttribute('src','./images/life'+this.life+'.png');
                    this.life_loss = false;
                }
                if(this.life==0){
                    gameover_fun();
                    this.life_loss = false;
                }
            };
        };
    };

    
    /******************enemy constructor***************/
    ////////////////////////////////////////////////////
    
    function Enemy() {
        this.speed = enemy_speed //%;
        this.dead = false;
        this.end_speed = 0.6; //%
        this.width = 9; //%
        this.create = function(){
            this.being = document.createElement('img');
            this.being.setAttribute('src','./images/enemy.png');
            this.being.addEventListener('load',()=>{
                container.appendChild(this.being);
                this.being.style.position = 'absolute';
                this.being.style.width = this.width+'%';
                this.height = 100*this.being.offsetHeight/container.offsetWidth  //%;
                this.being.style.height = this.height*container_ratio+'%';
                this.x_pos = random_number();
                this.y_pos = -15 //%;
                this.x_center_point = this.x_pos+this.width/2;
                this.y_center_point = this.y_pos+this.height/2; 
                this.being.style.left = this.x_pos+'%';
                this.being.style.top = this.y_pos+'%';
            })
        };


        this.move = ()=>{
            this.y_pos += this.speed;
            this.y_center_point = this.y_pos + this.height/2; 
            this.being.style.top = this.y_pos*container_ratio+'%';
            if(this.y_pos>100/container_ratio){
                fighter.enemy_miss++;
                this.being.remove();
                enemieS.splice(enemieS.indexOf(this),1);
            }
        };

        let s = true;
        this.end = ()=>{
            if(s){
                this.sound = new Audio('./audio/slime-bubble.mp3')
                this.sound.play();
                s = false;
            }
            this.height -= this.end_speed; //%
            this.being.style.height = this.height*container_ratio+'%';
            if(this.height<=0){
                fighter.hit = true;
                this.being.remove();
                enemieS.splice(enemieS.indexOf(this),1);
            }
        }

        random_number=()=>{
            let x_pos = Math.floor(Math.random()*(100-this.width-10)+5);
            if(enemieS.length==1)
                return x_pos;
            else{
                for(let j=0; j<enemieS.length-1;j++){
                    if(enemieS[j].y_pos<=0 &&
                        x_pos+ enemieS[j].width>enemieS[j].x_pos &&
                        x_pos<enemieS[j].x_pos+enemieS[j].width){
                            x_pos = Math.floor(Math.random()*(100-this.width-10)+5);
                            j = 0;
                        }
                        
                    if(j==enemieS.length-2){
                        return x_pos;
                    }
                }
            }
        }
    };
    const fighter = new Fighter();

    
    /****************** pause ***************/
    //////////////////////////////////////////////
    
    let pause_img;
    let playagain_img;
    let score
    var pause_fun = ()=>{
        if(!pause){
            score = document.getElementById('score2');
            score.innerHTML = fighter.score;
            playagain_img = document.getElementById('playagain');
            pause_img = document.getElementById('pause');
            if(gameover){
                playagain_img.style.opacity = '0%';
                pause_img.style.opacity = '0%';
                score.style.opacity = '0%';
                playagain_img.style.top = '30%';
                pause_img.style.top = '58%';
                score.style.top = '44.2%';
                playagain_img.classList.add('gameover_playagain');
                pause_img.classList.add('gameover_playagain');
                score.classList.add('gameover_playagain');

            }
            score.style.display = 'block'
            playagain_img.style.display = 'block'
            pause_img.style.display = 'block'
            playagain_img.onclick = ()=>{
                playagain();
            }
            dark_layer.style.display = 'block';
            dark_layer.style.opacity = '50%';
            timestamp = Date.now()
            pause = true;
        }
        else{
            score.style.display = 'none'
            playagain_img.style.display = 'none'
            pause_img.style.display = 'none';
            dark_layer.style.display = 'none';
            dark_layer.style.opacity = '0%';
            requestAnimationFrame(AI)
            previous_timestamp = Date.now()-(timestamp-previous_timestamp);
            pause = false;
        }
    }
    
    /****************** gameover ***************/
    //////////////////////////////////////////////

    var gameover_fun = ()=>{
        gameover = true;
        pause_fun();
        let game_over = document.getElementById('gameover')
        game_over.style.display = 'flex'
        game_over.classList.add('gameover');
    }

    /****************** play again ***************/
    //////////////////////////////////////////////



    var playagain = ()=>{
        for(let i=0; i<enemieS.length;i++){
            enemieS[i].being.remove();
        }
        for(let i=0; i<weaponS.length; i++){
            for(let j=0; j<weaponS[i].length;j++){
                if(weaponS[i][j].explosion){
                    for(k=0; k<weaponS[i][j].explosion_array.length; k++)
                    weaponS[i][j].explosion_array[k].remove();
                }
                weaponS[i][j].being.remove();
            }
        }
        enemieS = [];
        weaponS = [];
        enemy_speed = 0.2;
        enemy_time_gap = 2000;
        fighter.score = 0;
        fighter.life = 3;
        for(let i=0; i<unlock_weapons.length;i++){
            document.getElementById('icon'+i).remove();
        }
        unlock_weapons = [];
        weapon_index = 0;
        explosion_selector = [];
        lock_weapons =[
        [0, 'Bullet', false, 0, 0, 0, false],
        [0, 'Grenade', false, 2000, 0,0, true]
        ]
        document.getElementById('life').setAttribute('src','./images/life'+fighter.life+'.png');
        document.getElementById('score').innerHTML ='score: '+fighter.score;
        document.getElementById('gameover').style.display = 'none';
        if(gameover){
            playagain_img.style.opacity = '100%';
            pause_img.style.opacity = '100%';
            score.style.opacity = '100%';
            playagain_img.style.top = '2%';
            pause_img.style.top = '30%';
            score.style.top = '16.2%';
            playagain_img.classList.remove('gameover_playagain');
            pause_img.classList.remove('gameover_playagain');
            score.classList.remove('gameover_playagain'); 
        }
        gameover = false;
        pause_fun();
    } 
    
    /******************key methods***************/
    //////////////////////////////////////////////
    
    var right_press = false;
    var left_press = false;
    var down_press = false;
    var up_press = false;
    var w_press = false;
    var s_press = false;
    var d_press = false;
    var a_press = false;

    
    document.addEventListener('keydown', keydown_handler);
    document.addEventListener('keyup', keyup_handler);
    
    function keydown_handler(key){
        if(key.code=='KeyP' && !gameover && gameplay_mode)
            pause_fun()
        if(!pause){
            switch(key.code){
                case "KeyW":
                    if(!w_press){
                        if(unlock_weapons[weapon_index][1]==false){
                            fighter.firing();
                            if(unlock_weapons[weapon_index][2]!=0){
                                unlock_weapons[weapon_index][1]=true;
                                unlock_weapons[weapon_index][3]=Date.now();
                            }
                        }
                        w_press = true;
                    }
                    break;
                case "KeyS":
                    if(!s_press){
                        if(unlock_weapons[weapon_index][5] &&
                            explosion_selector[weapon_index]!=undefined)
                            fighter.weapon_explosion()
                        s_press=true;
                    }
                    break;
                case  "ArrowUp":
                    if(!up_press){
                        fighter.explosion_switch(key.code);
                        up_press=true;
                    }
                    break;
                case  "ArrowDown":
                    if(!down_press){
                        fighter.explosion_switch(key.code);
                        down_press=true;
                    }
                    break;    
                case "ArrowLeft":
                    left_press = true;
                    break;
                case  "ArrowRight":
                    right_press = true;
                    break;
                case 'KeyE':
                    fighter.fast_move = true;
                    break;
                case 'KeyQ':
                    fighter.slow_move = true;
                    break;
                case "KeyD":
                    if(!d_press){
                        fighter.weapon_switch(key.code)
                        d_press = true;
                    };
                    break;
                case "KeyA":
                    if(!a_press){
                        fighter.weapon_switch(key.code)
                        a_press = true;
                    };
                    break;
            };

        }
    };
    function keyup_handler(key){
        switch(key.code){
            case "KeyW":
                w_press = false;
                break;
            case "ArrowLeft":
                left_press = false;
                break;
            case  "ArrowRight":
                right_press = false;
                break;
            case 'KeyE':
                fighter.fast_move = false;
                break;
            case 'KeyQ':
                fighter.slow_move = false;
                break;
            case "KeyD":
                d_press = false;
                break;
            case "KeyA":
                a_press = false;
                break;
            case "KeyS":
                s_press = false;
                break;
            case "ArrowUp":
                up_press = false;
                break;
            case "ArrowDown":
                down_press = false;
                break;
       };
    };
    
    
    
    
    /******************(So called) Artificial intelligence (:))***************/
    ///////////////////////////////////////////////////////////////////////////
    
        
    let tutorial = true;    
    let tutorial_time = 0;
    let timestamp;
    let previous_timestamp = Date.now(); 
    let playground_pos = 0;        
    let city_pos = 0;
    let enemy_speed_change = 0.0001;
    let enemy_time_gap = 2000;
    let time_gap_change_speed = 0.25;


    const AI = ()=>{

        timestamp = Date.now();
        if(tutorial && timestamp-previous_timestamp>=tutorial_time){
            document.getElementById('tutorial').style.display = 'none';
            tutorial = false;            
        }
        if(!tutorial){
            if(timestamp-previous_timestamp>=enemy_time_gap){
                let j = enemieS.length
                enemieS[j]=new Enemy();
                enemieS[j].create();
                previous_timestamp = Date.now();
            }
        }
        enemy_time_gap-= time_gap_change_speed;
        enemy_speed+=enemy_speed_change;


    
        playground_pos+=0.3/100*container.offsetWidth;
        city_pos+=0.2/100*container.offsetWidth;
        gameplay.style.backgroundPositionY = playground_pos+'px,'+city_pos +'px';
    

    //////////////// unlock weapons ///////////////
        for(let i=0; i<lock_weapons.length; i++){
            if(fighter.score==lock_weapons[i][0]){ 
                let src = './images/'+lock_weapons[i][1]+'-icon.png';
                let icon = document.createElement('img');
                icon.setAttribute('src',src);
                icon.setAttribute('id','icon'+unlock_weapons.length);
                icon.style.width=100+'%';
                document.getElementById('weapons').appendChild(icon);

                weaponS[unlock_weapons.length] = [];
                weaponS[unlock_weapons.length].icon = icon;
                if(unlock_weapons.length==0)
                    icon.classList.add('wepon-select');
                unlock_weapons[unlock_weapons.length] = [];
                for(let j=1; j<lock_weapons[i].length; j++){
                    unlock_weapons[unlock_weapons.length-1][j-1] = lock_weapons[i][j];
                }
                lock_weapons.splice(i,1);
            }

        }

    ////////////////   weapons timespan   ///////////////
        for(let i=0; i<unlock_weapons.length; i++){
            if(unlock_weapons[i][1]==true){
                weaponS[i].icon.classList.add('lock-weapon');
                unlock_weapons[i][4]=Date.now()
                if(unlock_weapons[i][4]-unlock_weapons[i][3]>=unlock_weapons[i][2]){
                    weaponS[i].icon.classList.remove('lock-weapon');
                    unlock_weapons[i][1]=false;
                }
            }
        }

    ////////////////   fighter changes   ///////////////
            if(right_press)
                fighter.mov_x_dir('ArrowRight');
            if(left_press)
                fighter.mov_x_dir('ArrowLeft');
            if(fighter.hit)
                fighter.score_change();
            if(fighter.bullet_miss==bullet_miss_limit){
                fighter.bullet_miss=0;
                fighter.life_loss = true;
            }
            if(fighter.enemy_miss==enemy_miss_limit){
                fighter.enemy_miss=0;
                fighter.life_loss = true;
               }
            if(fighter.life_loss || fighter.life_gain){
                fighter.life_change();
            }
    ////////////////////   weapon changes    //////////////////
        for(let i1=0; i1<weaponS.length; i1++){
            for(let i2=0; i2<weaponS[i1].length; i2++){
                weaponS[i1][i2].move();
                if(weaponS[i1][i2].y_pos<-10){
                    fighter.bullet_miss++;
                    weaponS[i1][i2].end()
                    break;
                }
                if(weaponS[i1][i2].explosion)
                    weaponS[i1][i2].explosion_Process();
            }
        }    



     /////////////////// enemy changes //////////////////

        for(let j=0; j<enemieS.length; j++){
            enemieS[j].move();
            if(enemieS[j].dead)
                enemieS[j].end();
        }
    
    
    ///////////////// collision check  //////////////////////
    for(let i1=0; i1<weaponS.length; i1++){
        for(let i2=0 ; i2<weaponS[i1].length; i2++){
                let double_break = false
                for(let j=0;j<enemieS.length;j++){
                        
                        if(weaponS[i1][i2].explosion){
                            let delta_x = weaponS[i1][i2].x_center_point-enemieS[j].x_center_point;
                            let delta_y = weaponS[i1][i2].y_center_point-enemieS[j].y_center_point;
                            if(Math.pow(delta_x,2)+Math.pow(delta_y,2)<=Math.pow(weaponS[i1][i2].explosion_radius,2)){
                                enemieS[j].dead = true;
                                double_break = true;
                                break;
                            }
                    }


                    if(!weaponS[i1][i2].explosion && weaponS[i1][i2].x_pos<enemieS[j].x_pos+enemieS[j].width &&
                        weaponS[i1][i2].x_pos+weaponS[i1][i2].width>enemieS[j].x_pos &&
                        weaponS[i1][i2].y_pos<enemieS[j].y_pos+enemieS[j].height &&
                        weaponS[i1][i2].y_pos+weaponS[i1][i2].height>enemieS[j].y_pos){
                            weaponS[i1][i2].end();
                            enemieS[j].dead = true;
                            double_break = true;
                            break
                     }
                }
                if(double_break)
                    break
            }
        }
            if(!pause)
                window.requestAnimationFrame(AI);
        }
        var city_img = new Image();
        city_img.onload = ()=>{
            window.requestAnimationFrame(AI);
        }
        city_img.src = './images/city.png';
}

Start()
// Story()
// document.getElementById('gameplay').style.display = 'block'
// Gameplay();
