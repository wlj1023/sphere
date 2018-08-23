AR.log("sphere AR v1.0");

var supportSlam = AR.resetSlamModel &&  AR.getEnvProp("slamSupport")=='true';
var stay = true;
var showQuanJing = false;
var frameIndex = 0;
var initialRotation;
var sphereRadius;//球的半径，球心到门的距离
var sphereRadiusAdjust = 2.5;//距离判断的调节值，不一定要小于球的半径才算穿越，可根据实际效果动态调节
var model=AR.get_position('group_model');
AR.toast('x'+model.x+'y'+model.y+"z"+model.z)
var video1 = "./video/hangpai.mp4"
var video2 = "./video/quanjing.mp4";
var mayi_sound = "./video/mayi_sound.mp3";

if(supportSlam){
    AR.set_visible('pPlane_tishi2',false);
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function getTexturePath(url,idx) {
    return  url+ pad(idx, 2) + ".png";
}
var texIdx = 1,texIdy = 1,i = 1,j=1; // 序列帧序号
zhen_ani(1,3,"sphere.fbm/j_","pPlane_door2",300)
zhen_ani2(1,20,"sphere.fbm/hua/hua-animation_","pPlane_door",200)
function zhen_ani(i,zhen_num,url ,nodeId,inter_time){
    for (i ; i <= zhen_num; i++) {
        AR.setTimeout(function () {
            var filePath = getTexturePath(url,texIdx);
            AR.set_texture(nodeId, filePath, 0);
            if (AR.remove_tex_cache && texIdx > 1) {
                AR.remove_tex_cache(getTexturePath(url,texIdx - 1));
            }
            texIdx++;
        }, i * inter_time);
    }

    i=1,texIdx=1;

}
function zhen_ani2(j,zhen_num,url ,nodeId,inter_time){
    for (j ; j <= zhen_num; j++) {
        AR.setTimeout(function () {
            var filePath = getTexturePath(url,texIdy);
            AR.set_texture(nodeId, filePath, 0);
            if (AR.remove_tex_cache && texIdy > 1) {
                AR.remove_tex_cache(getTexturePath(url,texIdy - 1));
            }
            texIdy++;
        }, j * inter_time);
    }

    j=1,texIdy=1;

}
var seri_inter,guang_inter,hua_inter;
AR.onload = function() {

    var doorPos = AR.get_position('pPlane_door');
    var spherePos = AR.get_position('pSphere1');
    var doorPosVec = new Vec3(doorPos.x, doorPos.y, doorPos.z);
    var spherePosVec = new Vec3(spherePos.x, spherePos.y, spherePos.z);
    sphereRadius = doorPosVec.distance(spherePosVec);//实时计算出球心到门的距离

    //航拍的节点先隐藏
    AR.set_visible('pPlane_hangpai',false);

    //设置好视频路径，节省播的时候的时间
    AR.set_video('pSphere1', video2, 10000);
    AR.set_video('pPlane_hangpai', video1);

    AR.particle_emit("pPlane_btn1", true);
    // AR.play('root#jingzhi',0,0.6);
    // AR.play('root#jiaoshui',0,0.6);
    AR.play('root#baoqiufei',0,0.6);
        // 播放序列帧
    guang_inter= AR.setInterval(function(){AR.rotate('pPlane_door1',0,0.05,0)},30)
        seri_inter=AR.setInterval(function(){

            // zhen_ani(1,3,"sphere.fbm/j_","pPlane_door2",300);
    },950);
    hua_inter=AR.setInterval(function(){
        // zhen_ani2(1,20,"sphere.fbm/hua/hua-animation_","pPlane_door",200)
    },4000)

};

AR.onbegin = function(clipId) {

};

AR.onend = function(clipId) {
    if(clipId=='root#jiaoshui'){
        AR.set_visible('nengliangqiu', true);
        AR.set_visible('shuihu', false);
        AR.play('root#baoqiufei',0,0.6);
    }else if(clipId=='root#welcome'){
        AR.set_visible('pPlane_btn2',true)
    }
};

AR.onclick = function(nodeId, x, y) {

     if(nodeId == "pPlane_chuanyuebtn" ){
         startThrough();
     }
};

var hangpaiFade;
var fadeTimes = 0;
function startThrough() {

    stay = false;

    AR.clearInterval(seri_inter);
    AR.clearInterval(guang_inter);
    AR.clearInterval(hua_inter);

    //隐藏掉不需显示的元素
    AR.set_visible('pPlane_door', false);
    AR.set_visible('pPlane_door1', false);
    AR.set_visible('pPlane_door2', false);
    AR.set_visible('pPlane_btn1', false);
    AR.set_visible('pPlane_tishi1', false);
    AR.set_visible("pPlane_chuanyuebtn", false);

    AR.particle_emit("pPlane_btn1", false);

    //隐藏整体的subGroup节点
    AR.set_visible("subGroup", false);

    //AR.log('camera and sphere set IMU');

    //开始播放航拍视频
    AR.set_visible('pPlane_hangpai',true);
    AR.play_video('pPlane_hangpai');

    AR.setTimeout(function(){

        // //显示整体的subGroup节点
        AR.set_visible("subGroup", true);

        //播放全景视频
        AR.play_video('pSphere1');

        //Fade效果交替
        hangpaiFade=AR.setInterval(function(){

            fadeTimes ++;
            var outAlpha = 1 - 0.05 * fadeTimes;
            AR.modulate_alpha('pPlane_hangpai', outAlpha, 0);

            //变为全透明时移除定时器
            if(outAlpha <= 0){

                AR.clearInterval(hangpaiFade);

                //航拍节点隐藏掉
                AR.stop_video('pPlane_hangpai');
                AR.set_visible('pPlane_hangpai',false);

                AR.set_visible('group_model',true);
                AR.set_visible('pPlane_fanhuibtn',true);
                AR.set_visible('pPlane_jiaoshuibtn',true);
                AR.play('root#welcome',0,0.6);
                AR.play_audio(mayi_sound);
            }
        },30);

        // 这里不让相机与球的中心点重合，为的是变相增加fov，让全景视频更加清晰
        var posCam = AR.get_position('__CAMERA__');
        var rootPos = AR.get_position('root');
        var posCamVec = new Vec3(posCam.x, posCam.y, posCam.z);
        var rootPosVec = new Vec3(rootPos.x, rootPos.y, rootPos.z);
        var defDistance = rootPosVec.distance(posCamVec);//获取真实条件下的DefaultDistance
AR.translate('pPlane_fanhuibtn',-7,24,-19)
        //实际球心到门的距离
        var doorPos = AR.get_position('pPlane_door');
        var spherePos = AR.get_position('pSphere1');
        var doorPosVec = new Vec3(doorPos.x, doorPos.y, doorPos.z);
        var spherePosVec = new Vec3(spherePos.x, spherePos.y, spherePos.z);
        var sdDistance = doorPosVec.distance(spherePosVec);

        var scale = AR.get_scale('root');//获取Scale,arKit下的scale不为1；

        //AR.toast('Root node Scale = '+scale.x+" defDistance = "+defDistance+" ");

        AR.translate("subGroup", 0, 0, (defDistance - sdDistance * 0.75) / scale.x );

        showQuanJing = true;
        AR.setTimeout(function(){
            AR.set_visible('group_model',false)
        } ,5000)

    },5500);

    initialRotation = AR.get_rotation('root');
    AR.set_static("root", true);
}

AR.onframe = function (t){
    frameIndex ++;

    var posCam = AR.get_position('__CAMERA__');
    if(posCam.x == NaN || posCam.y == NaN || posCam.z == NaN){
        return;
    }
    var posCamVec = new Vec3(posCam.x, posCam.y, posCam.z);//相机的位置

    var spherePos = AR.get_position('subGroup');
    var spherePosVec = new Vec3(spherePos.x, spherePos.y, spherePos.z);//球体所在的父节点位置

    var rootPos = AR.get_position('root');
    var rootPosVec = new Vec3(rootPos.x, rootPos.y, rootPos.z);//root节点位置

    var distance = posCamVec.distance(spherePosVec);//球心到camera的位置
    var distanceRoot = posCamVec.distance(rootPosVec);//Root到camera的位置

    var scale = AR.get_scale('root');//获取Scale,arKit下的scale不为1；
    var throughDistance = sphereRadius * scale.x * sphereRadiusAdjust;

    // AR.log('distanceLog sphereDistance: '+ distance +' rootDistance: ' + distanceRoot + ' sphereRadius: ' + sphereRadius);

    if(distance < throughDistance && stay && frameIndex > 40){//40帧以后算，避免一上来还未摆好就进入了穿越
        startThrough();
    }

    if(!stay && showQuanJing){
        // 需要分别来设置，不能multiply
        var rotation1 = AR.get_rotation('subGroup');
        var r = getInverse(rotation1.x, rotation1.y, rotation1.z);
        // rotate back
        AR.rotate('subGroup', r.x, r.y, r.z);

        // 再来计算相机所需要的旋转
        var rotation = AR.get_rotation('__CAMERA__');
        var rotationQ = new Quaternion;
        rotationQ.setFromEuler(rotation.x, rotation.y, rotation.z);
        rotationQ = rotationQ.inverse();

        var out = new Vec3;
        rotationQ.computeEuler(out);
        AR.rotate('subGroup', out.x, out.y, out.z);

        // static之前的姿态
        AR.rotate('subGroup', initialRotation.x, initialRotation.y, initialRotation.z);
    }
};


function getInverse(x, y, z) {
    var q = new Quaternion;
    q.setFromEuler(x, y, z);

    q = q.inverse();
    var out = new Vec3;
    q.computeEuler(out);

    return out;
}

////////
function Quaternion(x, y, z, w) {
    this.x = x !== undefined ? x : 0;
    this.y = y !== undefined ? y : 0;
    this.z = z !== undefined ? z : 0;
    this.w = w !== undefined ? w : 1;
}

Quaternion.prototype.set = function (x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
};

Quaternion.prototype.setFromAxisAngle = function (axis, angle) {
    var s = Math.sin(angle * 0.5);
    // todo: normalize
    var normal = new Vec3;
    normal.set(axis.x, axis.y, axis.z);
    normal.normalize();
    this.x = normal.x * s;
    this.y = normal.y * s;
    this.z = normal.z * s;
    this.w = Math.cos(angle * 0.5);
};

Quaternion.prototype.setFromEuler = function (x, y, z) {
    var c1 = Math.cos(x / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(z / 2);
    var s1 = Math.sin(x / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(z / 2);

    this.x = s1 * c2 * c3 - c1 * s2 * s3;
    this.y = c1 * s2 * c3 + s1 * c2 * s3;
    this.z = c1 * c2 * s3 - s1 * s2 * c3;
    this.w = c1 * c2 * c3 + s1 * s2 * s3;

    return this;

};

Quaternion.prototype.inverse = function (target) {
    var x = this.x, y = this.y, z = this.z, w = this.w;
    target = target || new Quaternion();

    this.conjugate(target);
    var inorm2 = 1 / (x * x + y * y + z * z + w * w);
    target.x *= inorm2;
    target.y *= inorm2;
    target.z *= inorm2;
    target.w *= inorm2;

    return target;
};

Quaternion.prototype.conjugate = function (target) {
    target = target || new Quaternion();

    target.x = -this.x;
    target.y = -this.y;
    target.z = -this.z;
    target.w = this.w;

    return target;
};

Quaternion.prototype.computeEuler = function (target) {
    var x = this.x, y = this.y, z = this.z, w = this.w;
    var sqx = x * x;
    var sqy = y * y;
    var sqz = z * z;

    target.x = Math.atan2(2 * x * w + 2 * y * z, 1 - 2 * sqx - 2 * sqy);
    target.y = Math.asin(2 * w * y - 2 * z * x);
    target.z = Math.atan2(2 * w * z + 2 * x * y, 1 - 2 * sqy - 2 * sqz);
};

Quaternion.prototype.rotate = function (point, target) {
    target = target || new Vec3();

    var vecQuat = new Quaternion;
    var resQuat = new Quaternion;

    vecQuat.x = point.x;
    vecQuat.y = point.y;
    vecQuat.z = point.z;
    vecQuat.w = 0;

    var conQuat = new Quaternion;
    this.conjugate(conQuat);

    vecQuat.multiply(conQuat, resQuat);
    //AR.log("1: ", resQuat.x, ", ", resQuat.y, ", ", resQuat.z, ", ", resQuat.w);

    var resQ = new Quaternion;
    this.multiply(resQuat, resQ);
    //AR.log("2: ", resQ.x, ", ", resQ.y, ", ", resQ.z, ", ", resQ.w);

    target.x = resQ.x;
    target.y = resQ.y;
    target.z = resQ.z;

    return target;
};

var Quaternion_mult_va = new Vec3();
var Quaternion_mult_vb = new Vec3();
var Quaternion_mult_vaxvb = new Vec3();

Quaternion.prototype.multiply = function (q, target) {
    target = target || new Quaternion();
    var w = this.w,
        va = Quaternion_mult_va,
        vb = Quaternion_mult_vb,
        vaxvb = Quaternion_mult_vaxvb;

    va.set(this.x, this.y, this.z);
    vb.set(q.x, q.y, q.z);
    target.w = w * q.w - va.dot(vb);
    va.cross(vb, vaxvb);

    target.x = w * vb.x + q.w * va.x + vaxvb.x;
    target.y = w * vb.y + q.w * va.y + vaxvb.y;
    target.z = w * vb.z + q.w * va.z + vaxvb.z;

    return target;
};

Quaternion.prototype.copy = function (source) {
    this.x = source.x;
    this.y = source.y;
    this.z = source.z;
    this.w = source.w;
    return this;
};

Quaternion.prototype.clone = function () {
    return new Quaternion(this.x, this.y, this.z, this.w);
};


//////////// vec
function Vec3(x, y, z) {
    this.x = x || 0.0;
    this.y = y || 0.0;
    this.z = z || 0.0;
}

Vec3.prototype.set = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};

Vec3.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
};

Vec3.prototype.sub = function (v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
};

Vec3.prototype.scale = function (f) {
    this.x *= f;
    this.y *= f;
    this.z *= f;
    return this;
};

Vec3.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};


Vec3.prototype.distance = function (v) {
    var dx = v.x - this.x;
    var dy = v.y - this.y;
    var dz = v.z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

Vec3.prototype.cross = function (v, target) {
    var vx = v.x, vy = v.y, vz = v.z, x = this.x, y = this.y, z = this.z;
    target = target || new Vec3();

    target.x = (y * vz) - (z * vy);
    target.y = (z * vx) - (x * vz);
    target.z = (x * vy) - (y * vx);

    return target;
};

Vec3.prototype.normalize = function () {
    var x = this.x, y = this.y, z = this.z;
    var n = Math.sqrt(x * x + y * y + z * z);
    if (n > 0.0) {
        var invN = 1 / n;
        this.x *= invN;
        this.y *= invN;
        this.z *= invN;
    } else {
        // Make something up
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    return n;
};

Vec3.prototype.dot = function (v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
};

Vec3.prototype.angle = function (v) {
    var dx = this.y * v.z - this.z * v.y;
    var dy = this.z * v.x - this.x * v.z;
    var dz = this.x * v.y - this.y * v.x;

    return Math.atan2(Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.000000000001, this.dot(v));
};

//////////// Matrix
function Matrix() {
    this.m0 = 1.0;
    this.m1 = 0.0;
    this.m2 = 0.0;
    this.m3 = 0.0;

    this.m4 = 0.0;
    this.m5 = 1.0;
    this.m6 = 0.0;
    this.m7 = 0.0;

    this.m8 = 0.0;
    this.m9 = 0.0;
    this.m10 = 1.0;
    this.m11 = 0.0;

    this.m12 = 0.0;
    this.m13 = 0.0;
    this.m14 = 0.0;
    this.m15 = 1.0;
}

Matrix.prototype.setFromRotation = function (q) {
    var x2 = q.x + q.x;
    var y2 = q.y + q.y;
    var z2 = q.z + q.z;

    var xx2 = q.x * x2;
    var yy2 = q.y * y2;
    var zz2 = q.z * z2;
    var xy2 = q.x * y2;
    var xz2 = q.x * z2;
    var yz2 = q.y * z2;
    var wx2 = q.w * x2;
    var wy2 = q.w * y2;
    var wz2 = q.w * z2;

    this.m0 = 1.0 - yy2 - zz2;
    this.m1 = xy2 + wz2;
    this.m2 = xz2 - wy2;
    this.m3 = 0.0;

    this.m4 = xy2 - wz2;
    this.m5 = 1.0 - xx2 - zz2;
    this.m6 = yz2 + wx2;
    this.m7 = 0.0;

    this.m8 = xz2 + wy2;
    this.m9 = yz2 - wx2;
    this.m10 = 1.0 - xx2 - yy2;
    this.m11 = 0.0;

    this.m12 = 0.0;
    this.m13 = 0.0;
    this.m14 = 0.0;
    this.m15 = 1.0;
};

Matrix.prototype.getUpVector = function () {
    var dst = new Vec3;
    dst.x = this.m4;
    dst.y = this.m5;
    dst.z = this.m6;
    return dst;
};

Matrix.prototype.getLeftVector = function () {
    var dst = new Vec3;
    dst.x = -this.m0;
    dst.y = -this.m1;
    dst.z = -this.m2;
    return dst;
};

Matrix.prototype.getRightVector = function () {
    var dst = new Vec3;
    dst.x = this.m0;
    dst.y = this.m1;
    dst.z = this.m2;
    return dst;
};

Matrix.prototype.getForwardVector = function () {
    var dst = new Vec3;
    dst.x = -this.m8;
    dst.y = -this.m9;
    dst.z = -this.m10;
    return dst;
};

Matrix.prototype.getBackwardVector = function () {
    var dst = new Vec3;
    dst.x = this.m8;
    dst.y = this.m9;
    dst.z = this.m10;
    return dst;
};
