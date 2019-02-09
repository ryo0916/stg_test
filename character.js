function Character(){
    this.position = new Point();
    this.size = 0;
}

Character.prototype.init = function(size){
    this.size = size;
};