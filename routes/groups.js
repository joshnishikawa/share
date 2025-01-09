const { da, pl } = require('google-translate-api-jp/languages');

const adjectives = [
  "Agile", "Brave", "Cunning", "Daring", "Eager", "Fearless", "Gentle", "Happy", "Inventive", "Jolly", 
  "Kind", "Lively", "Mighty", "Nimble", "Odd", "Playful", "Quick", "Rapid", "Sneaky", "Tough", 
  "Unique", "Valiant", "Witty", "Zesty", "Zany", "Clever", "Curious", "Diligent", "Fancy", "Silly", 
  "Swift", "Bold", "Charming", "Funny", "Lazy", "Grumpy", "Shy", "Wacky", "Goofy", "Noisy", "Brilliant",
  "Epic", "Funky", "Glorious", "Mysterious", "Radiant", "Smiley", "Tireless", "Vivacious", "Wise", "Adventurous", 
  "Bubbly", "Energetic", "Fearsome", "Gallant", "Heroic", "Jovial", "Majestic", "Peppy", "Snazzy", "Terrific", 
  "Weird", "Zen", "Luminous", "Proud", "Rugged", "Dapper", "Magical", "Nifty", "Quirky", "Stubborn", "Wild", 
  "Chilled", "Hyper", "Excited", "Moody", "Jumpy", "Sleek", "Stormy", "Sunny", "Fierce", "Elegant", "Lucky", 
  "Sparkling", "Vibrant", "Humble", "Shiny", "Fearful", "Loyal", "Reckless", "Optimistic", "Puzzling", "Lunar", 
  "Cosmic", "Galactic", "Breezy", "Silent", "Crafty", "Dynamic", "Fluffy", "Snoozy", "Ruthless", "Inspiring", 
  "Whimsical", "Tidy", "Gritty", "Plucky", "Electric", "Hasty", "Bold", "Fuzzy", "Dizzy", "Wandering", 
  "Precise", "Velvet", "Twisting", "Fiery", "Soaring", "Prudent", "Vigilant", "Zealous", "Chipper", "Radiant",
  "Ethereal", "Invisible", "Melodic", "Prismatic", "Quantum", "Roaring", "Sneaky", "Thunderous", "Icy", "Whirling",
  "Blazing", "Gleaming", "Harmonic", "Savage", "Serene", "Transcendent", "Whispering", "Diligent", "Ferocious",
  "Flickering", "Rumbling", "Vast", "Mighty", "Paradoxical", "Whimsical", "Shadowy", "Jagged", "Crimson", 
  "Frosty", "Galactic", "Golden", "Silver", "Azure", "Ebony", "Scarlet", "Breezy", "Gleeful", "Hidden",
  "Jagged", "Keen", "Light", "Mystical", "Obsidian", "Puzzling", "Roaring", "Silent", "Twinkling", "Uplifted",
  "Vivid", "Wandering", "Yawning", "Zesty", "Astral", "Blissful", "Dazzling", "Emerald", "Major", "Noble"
];

const nouns = [
  "Ninja", "Penguin", "Pirate", "Dragon", "Unicorn", "Robot", "Wizard", "Alien", "Monster", "Shark", 
  "Eagle", "Cheetah", "Fox", "Panther", "Wolf", "Tiger", "Bear", "Owl", "Phoenix", "Dolphin", 
  "Squirrel", "Octopus", "Turtle", "Lion", "Leopard", "Chameleon", "Falcon", "Crocodile", "Raccoon", "Lizard", 
  "Knight", "Samurai", "Viking", "Ghost", "Yeti", "Goblin", "Cyclops", "Griffin", "Mermaid", "Sasquatch",
  "Phoenix", "Gryphon", "Sphinx", "Banshee", "Pegasus", "Werewolf", "Zombie", "Genie", "Mummy", "Elf", 
  "Dwarf", "Orc", "Centaur", "Chimera", "Hydra", "Kraken", "Minotaur", "Troll", "Cyborg", "Vampire", 
  "Witch", "Guardian", "Sentinel", "Ranger", "Warrior", "Soldier", "Explorer", "Scientist", "Engineer", 
  "Astronaut", "Shaman", "Sorcerer", "Cleric", "Gladiator", "Hunter", "Paladin", "Druid", "Titan", "Manticore", 
  "Basilisk", "Cerberus", "Lich", "Wendigo", "Rogue", "Jester", "Barbarian", "Monk", "Nymph", "Enchanter", 
  "Sage", "Priest", "Archer", "Bard", "Healer", "Alchemist", "Necromancer", "Timekeeper", "Seer", "Conqueror",
  "Blademaster", "Stormcaller", "Starwalker", "Flameweaver", "Bonecrusher", "Soulstealer", "Dreamweaver", "Sunwalker",
  "Wanderer", "Pathfinder", "Moonwalker", "Windrunner", "Skybreaker", "Seafarer", "Cloudstrider", "Flamestrider",
  "Mech", "Crawler", "Overseer", "Observer", "Pilot", "Thief", "Healer", "Commander", "Pilot", "Seeker",
  "Titan", "Destroyer", "Tempest", "Cobra", "Chimera", "Specter", "Golem", "Wraith", "Revenant", "Shade", "Fungus",
  "Amoeba", "Jellyfish", "Squid", "Starfish", "Crab", "Lobster", "Shrimp", "Scorpion", "Spider", "Beetle",
  "Ant", "Mantis", "Caterpillar", "Butterfly", "Dragonfly", "Grasshopper", "Locust", "Cicada", "Ladybug"

];



const groups = (io) => {
const rooms = require('../rooms.json');
var publicRooms = {}; // array of public rooms in use
var privateRooms = {}; // array of private rooms in use


function openPublicRoom(data){
  let available = rooms.filter(x => !Object.keys(publicRooms).includes(x) 
                                 && !Object.keys(privateRooms).includes(x));
  if (available.length === 0) return null; // no available rooms
  else {
    let roomname = available[Math.floor(Math.random() * available.length)];
    let date = Date.now(); // current unix timecode
    data.player.number = 1; // set the player number to 1 if it's a new room
    publicRooms[roomname] = {roomname, type: 'public',
                             activity: data.room.activity, players: [data.player],
                             date}; // add the word to the rooms object
    return roomname;
  }
}


function openPrivateRoom(data){
  let available = rooms.filter(x => !Object.keys(publicRooms).includes(x) 
                                 && !Object.keys(privateRooms).includes(x));
  if (available.length === 0) return null; // no available rooms
  else {
    let roomname = available[Math.floor(Math.random() * available.length)];
    let date = Date.now(); // current unix timecode
    data.player.number = 1; // set the player number to 1 if it's a new room
    privateRooms[roomname] = {roomname, type: 'private', open: true, 
                              activity: null, players: [data.player],
                              date}; // add the room to the rooms object
    return roomname;
  }
}


function closePublicRoom(roomname){
  publicRooms = publicRooms.filter(x => x !== roomname);
}


function closePrivateRoom(roomname){
  privateRooms = privateRooms.filter(x => x !== roomname);
}


function joinNewPrivateRoom(socket, data){
  let roomname = openPrivateRoom(data);
  if (roomname === null){
    console.log('FIXME: NO AVAILABLE ROOMS, WE PROBABLY NEED TO FILTER EXPIRED ONES');
    socket.emit('joined', {message: "No more available rooms."});
    return;
  }
  else {
    data['room'] = privateRooms[roomname];
    data.player.number = 1;
    joinPrivateRoom(socket, data);
  }
}


function joinPrivateRoom(socket, data){
  let roomname = Object.keys(privateRooms).includes(data.room.roomname) ?
                 data.room.roomname : 
                 openPrivateRoom(data);

  if (roomname === null){
    console.log('FIXME: NO AVAILABLE ROOMS, WE PROBABLY NEED TO FILTER EXPIRED ONES');
    socket.emit('joined', {message: "No more available rooms."});
    return;
  }
  else {
    let room = privateRooms[roomname];
    let playerFound = false;
    let playerNum;
    for (let player of room.players){
      if (player.id === data.player.id){
        playerFound = true;
        playerNum = player.number;
        break;
      }
    }
    
    if (!playerFound){
      if (!room.open){
        socket.emit('joined', {message: "Sorry, this room is closed and your name is not on the list."});
      }
      else if (room.players.length < 4){
        socket.join(roomname);

        // set the player number to the next available number
        let playerNum = 1;
        let playerNums = room.players.map(x => x.number);
        while (playerNums.includes(playerNum)) playerNum++;
        data.player.number = playerNum;
        room.players.push(data.player);
        socket.emit('joined', {room, playerNum});
        // log all the sockets in the room
        console.log('sockets in room: ', io.sockets.adapter.rooms.get(roomname));
        socket.broadcast.to(roomname).emit('playerJoined', room);
        console.log(`${socket.id} joined the private room. "${roomname}" as player ${data.player.number}.`);
      }
      else {
        socket.emit('joined', {message: "Sorry, this room is full."});
      }
    }
    else {
      socket.join(roomname);
      socket.emit('joined', {room, playerNum});
      socket.broadcast.to(roomname).emit('playerJoined', room);
      console.log(`${socket.id} rejoined the private room "${roomname}" as player ${playerNum}.`);
    }
  }
}


function joinPublicRoom(socket, data){
  let roomname = Object.keys(publicRooms).includes(data.room.roomname) ?
                 data.room.roomname : 
                 openPublicRoom(data);

  if (roomname === null){
    console.log('FIXME: NO AVAILABLE ROOMS, WE PROBABLY NEED TO FILTER EXPIRED ONES');
    socket.emit('joined', {message: "No more available rooms."});
    return;
  }
  else {
    let room = publicRooms[roomname];
    let playerFound = false;
    let playerNum;
    for (let player of room.players){
      if (player.id === data.player.id){
        playerFound = true;
        playerNum = player.number;
        break;
      }
    }
    
    if (!playerFound){
      if (room.players.length < 4){
        // set the player number to the next available number
        let playerNums = room.players.map(x => x.number);
        let playerNum = 1;
        while (playerNums.includes(playerNum)) playerNum++;
        data.player.number = playerNum;
        room.players.push(data.player);
        socket.join(roomname);
        socket.emit('joined', {room, playerNum});
        // broadcast to all sockets in the room except the sender
        socket.broadcast.to(roomname).emit('playerJoined', room);
        console.log(`${socket.id} joined the public room. "${roomname}"`);
      }
      else socket.emit('joined', {message: "Sorry, this room filled up. You'll join a new one."});
    }
    else {
      for (let player of room.players){
        if (player.id === data.player.id){
          socket.join(roomname);
          socket.emit('joined', {room, playerNum});
          // broadcast to all sockets in the room except the sender
          socket.broadcast.to(roomname).emit('playerJoined', room);
          console.log(`${socket.id} rejoined the public room. "${roomname}"`);
          return;
        }
      }
    }
  }
}


// SOCKET.IO EVENTS ////////////////////////////////////////////////////////////
io.sockets.on('connection', socket =>{
  console.log('socket connected: ', socket.id);

  socket.on('join', function(data){
    if (data.room){
      if (data.room.type === 'public'){
        joinPublicRoom(socket, data);
      }
      else if (data.room.type === 'private'){
        joinPrivateRoom(socket, data);
      }
      else { // room doesn't exist any more, open a new one
        joinNewPrivateRoom(socket, data);
      }
    }
    else { // choose a random available room, add to privateRooms and return it
      joinNewPrivateRoom(socket, data);
    }
  });


  socket.on('roomSearch', function(data){
    console.log('roomSearch: ', data);
    if (Object.keys(privateRooms).includes(data)){
      socket.emit('roomSearch', true);
    }
    else {
      socket.emit('roomSearch', false);
    }
  });


  socket.on('setColor', function(data){
    let room;
    if (data.room.type === 'public'){
      room = publicRooms[data.room.roomname];
    }
    else if (data.room.type === 'private'){
      room = privateRooms[data.room.roomname];
    }

    for (let player of room.players){
      if (player.id === data.player.id){
        player.color = data.player.color;
        socket.broadcast.to(data.room.roomname).emit('setColor', {number: player.number, color: player.color});
        break;
      }
    }
  });
  

  socket.on('getName', function(data){
    let room;
    let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    let noun = nouns[Math.floor(Math.random() * nouns.length)];
    let newName = `${adj} ${noun}`;

    if (data.room.type){ // user is already in a room
      if (data.room.type === 'public' && publicRooms[data.room.roomname]){ 
        room = publicRooms[data.room.roomname];
        for (let player of room.players){
          if (player.id === data.player.id){
            player.id = newName;
            // broadcast to all sockets in the room including sender
            io.in(data.room.roomname).emit('setName', {number: data.player.number, id: newName});
            break;
          }
        }
      }
      else if (data.room.type === 'private' && privateRooms[data.room.roomname]){
        room = privateRooms[data.room.roomname];
        for (let player of room.players){
          if (player.id === data.player.id){
            player.id = newName;
            // broadcast to all sockets in the room including sender
            io.in(data.room.roomname).emit('setName', {number: data.player.number, id: newName});
            break;
          }
        }
      }
      else { // room no longer exists, open a new one under the newName and return it
        socket.emit('setName', {number: data.player.number, id: newName});
      }
    }
    else { // New users need a name before their room can be created
      socket.emit('setName', {number: data.player.number, id: newName});
    }
  });


  socket.on('leave', async function(data){ // data = {room: 'room1'}
    socket.leave(data.room);
    // emit to all sockets in the room including sender
    io.in(data.room).emit('left', socketIds);
  });





  socket.on('selectimg', function(data){
    // emit to all sockets in the room except the sender
    socket.broadcast.to(data.room).emit('selectedimg', data.word);
  });

  socket.on('selectword', async function(data){
    // emit to all sockets in the room except the sender
    socket.broadcast.to(data.room).emit('selectedword', data.word);
    console.log('selectedword: ', data.word);
  });

  socket.on('disconnect', function(){
    console.log('socket disconnected: ', socket.id);
  });
});


};


module.exports = groups;
