Tiles = new Mongo.Collection("tiles");
Global = new Mongo.Collection("global");
if (Meteor.isClient) {
  Template.body.helpers({
    rows: function(){
      var col0tiles = Tiles.find({col:0}, {sort:{row:1}});
      var rows = [];
      col0tiles.forEach(function(t){
        rows.push(
          {cols: Tiles.find({row:t.row}, {sort: {col: 1}})}
        );
      });
      return rows;
    },
    color: function(){
      var color = Global.findOne({key:"color"}).value;
      return color % 7;
    }
  });

  Template.tile.helpers({
    color: function(){
      return this.count % 7;
    }
  });

  Session.setDefault('touch', false);
  function tap(){
    var tile = Tiles.findOne({row:this.row, col:this.col});
    if(!tile.count){ tile.count=0; }
    Tiles.update(tile._id, {$set: {count:tile.count+1}});

    var gcolor = Global.findOne({key:"color"});
    var done = true;
    var tiles = Tiles.find();
    tiles.forEach(function(t){
      if(t.count%7 != gcolor.value%7){ done = false; }
    });
    if(done){
      Global.update(gcolor._id, {$set: {value:gcolor.value+1}}).value;
      tiles.forEach(function(t){
        Tiles.update(t._id, {$set: {count:t.count + Math.floor(Math.random()*7)}});
      });
    }
  }
  Template.tile.events({
    'touchstart div.tile': function(){
      Session.set('touch', true);
      tap.apply(this);
      return false;
    },
    'mousedown div.tile': function(){
      if(!Session.get('touch')){
        tap.apply(this);
      }
      return false;
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var color = Global.findOne({key:"color"});
    if(!color){
      Global.insert({key:"color", value:0});
    }

    for(var r=0; r<4; r++){
      for(var c=0; c<3; c++){
        var tile = Tiles.findOne({row:r, col:c});
        if(!tile){
          Tiles.insert({row:r,col:c,count:0});
        }
      }
    }
  });
}
