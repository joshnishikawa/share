const { da, pl, so, co } = require('google-translate-api-jp/languages');

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
var publicRooms = {};
var privateRooms = {};


function openPublicRoom(data){
  console.log(data);
  console.log('Attempting to open public room.');
  let available = rooms.filter(x => !Object.keys(publicRooms).includes(x) 
                                 && !Object.keys(privateRooms).includes(x));
  if (available.length === 0) {
    console.log('No available public rooms.');
    return null; // no available rooms
  }
  else {
    let roomname = available[Math.floor(Math.random() * available.length)];
    let date = Date.now(); // current unix timecode
    data.number = 1; // set the player number to 1 if it's a new room
    publicRooms[roomname] = {roomname, roomtype: 'public',
                             activity: data.activity, players: [data],
                             date}; // add the word to the rooms object
    console.log(`Public room "${roomname}" opened.`);
    return roomname;
  }
}


function openPrivateRoom(data){
  console.log('Attempting to open private room.');
  // check if there are any available rooms
  let available = rooms.filter(x => !Object.keys(publicRooms).includes(x) 
                                 && !Object.keys(privateRooms).includes(x));
  if (available.length === 0) {
    console.log('No available private rooms.');
    return null; // no available rooms
  }
  else {
    let roomname = available[Math.floor(Math.random() * available.length)];
    let date = Date.now(); // current unix timecode
    data.number = 1; // set the player number to 1 if it's a new room
    privateRooms[roomname] = {roomname, roomtype: 'private', open: true, 
                              activity: null, players: [data],
                              date}; // add the room to the rooms object
    console.log(`Private room "${roomname}" opened.`);
    return roomname;
  }
}


function closePublicRoom(roomname){
  delete publicRooms[roomname];
  console.log(`Public room "${roomname}" closed.`);
}


function closePrivateRoom(roomname){
  delete privateRooms[roomname];
  console.log(`Private room "${roomname}" closed.`);
}


function joinPrivateRoom(socket, data){
  data.roomtype = 'private'; // Ensure roomtype is set to private
  let roomname = Object.keys(privateRooms).includes(data.roomname) ?
                 data.roomname : 
                 openPrivateRoom(data);
  if (roomname === null){
    console.log('No available private rooms.'); // FIXME: we need to filter expired rooms
    socket.emit('joined', {message: "No more available rooms."});
    return;
  }
  else {
    let room = privateRooms[roomname];
    let playerFound = false;
    let playerNum;
    for (let player of room.players){
      if (player.id === data.id){
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
        data.number = playerNum;
        data.roomname = roomname; // Ensure roomname is updated
        room.players.push(data);
        socket.emit('joined', {room, playerNum});
        socket.broadcast.to(roomname).emit('playerJoined', room.players);
        console.log(`${socket.id} joined the private room. "${roomname}" as player ${data.number}.`);
        return roomname; // return the roomname for further use
      }
      else {
        socket.emit('joined', {message: "Sorry, this room is full."});
      }
    }
    else {
      socket.join(roomname);
      socket.emit('joined', {room, playerNum});
      socket.broadcast.to(roomname).emit('playerJoined', room.players);
      console.log(`${socket.id} rejoined the private room "${roomname}" as player ${playerNum}.`);
      return roomname; // return the roomname for further use
    }
  }
}


function joinPublicRoom(socket, data){
  let roomname = data.roomname && Object.keys(publicRooms).includes(data.roomname) ?
                 data.roomname : 
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
      if (player.id === data.id){
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
        data.number = playerNum;
        data.roomname = roomname; // Ensure roomname is updated
        room.players.push(data);
        socket.join(roomname);
        socket.emit('joined', {room, playerNum});
        // broadcast to all sockets in the room except the sender
        socket.broadcast.to(roomname).emit('playerJoined', room.players);
        console.log(`${socket.id} joined the public room. "${roomname}"`);
        return roomname; // return the roomname for further use
      }
      else socket.emit('joined', {message: "Sorry, this room filled up. You'll join a new one."});
    }
    else {
      console.log(publicRooms[roomname]);
      for (let player of room.players){
        if (player.id === data.id){
          socket.join(roomname);
          socket.emit('joined', {room, playerNum});
          // broadcast to all sockets in the room except the sender
          socket.broadcast.to(roomname).emit('playerJoined', room.players);
          console.log(`${socket.id} rejoined the public room. "${roomname}"`);
          return roomname; // return the roomname for further use
        }
      }
    }
  }
}


function leaveRoom(socket, data){
  let roomname = data.roomname;
  let roomtype = data.roomtype;
  let id = data.id;
  let room;

  socket.leave(data.roomname);

  if (roomtype === 'public'){
    if (publicRooms[roomname]){
      room = publicRooms[roomname];
      room.players = room.players.filter(player => player.id !== id);
      if (room.players.length === 0){
        closePublicRoom(roomname);
        console.log(`Closing public room "${roomname}" as it has no players left.`);
      }
      else io.to(roomname).emit('playerLeft', room.players);
    }
  }
  else if (roomtype === 'private'){
    if (privateRooms[roomname]){
      room = privateRooms[roomname];
      room.players = room.players.filter(player => player.id !== id);
      if (room.players.length === 0){
        console.log(`Closing private room "${roomname}" as it has no players left.`);
        closePrivateRoom(roomname);
      }
      else io.to(roomname).emit('playerLeft', room.players);
    }
  }
  console.log(`${socket.id} left the room "${roomname}".`);
}


// SOCKET.IO EVENTS ////////////////////////////////////////////////////////////
io.sockets.on('connection', socket =>{
  console.log('socket connected: ', socket.id);
  socket.on('join', function(data){
    if (data.newRoom) {
      console.log(`${data.player.id} is joining a different room: ${data.newRoom}`);
      leaveRoom(socket, data.player);
      if (Object.keys(privateRooms).includes(data.newRoom)){
        data.player.roomname = data.newRoom; // update the roomname
        joinPrivateRoom(socket, data.player);
      }
      else if (Object.keys(publicRooms).includes(data.newRoom)){
        data.player.roomname = data.newRoom; // update the roomname
        joinPublicRoom(socket, data.player);
      }
      else {
        data.player.roomname = data.newRoom; // update the roomname
        openPrivateRoom(socket, data.player);
      }
    }
    else if (!data.roomname || data.roomtype === 'private'){
      joinPrivateRoom(socket, data);
    }
    else {
      joinPublicRoom(socket, data);
    }
  });


  socket.on('roomSearch', function(data){
    if (Object.keys(privateRooms).includes(data)){
      socket.emit('roomSearch', privateRooms[data]);
    }
    else if (Object.keys(publicRooms).includes(data)){
      socket.emit('roomSearch', publicRooms[data]);
    }
    else {
      socket.emit('roomSearch', null);
    }
  });


  socket.on('getName', function(data){
    let roomname = data.roomname;
    let room;
    let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    let noun = nouns[Math.floor(Math.random() * nouns.length)];
    let newName = `${adj} ${noun}`;

    if (roomname){ // user is already in a room
      if (publicRooms[roomname]){ 
        room = publicRooms[roomname];
        for (let player of room.players){
          if (player.id === data.id){
            player.id = newName;
            io.to(roomname).emit('setName', {number: player.number, id: player.id});
            return;
          }
        }
      }
      else if (privateRooms[roomname]){
        room = privateRooms[roomname];
        for (let player of room.players){
          if (player.id === data.id){
            player.id = newName;
            io.to(roomname).emit('setName', {number: player.number, id: player.id});
            return;
          }
        }
      }
    }
    socket.emit('setName', {id: newName, number: 1});
  });


  socket.on('setColor', function(data){
    let room;
    let roomname = data.roomname;
    if (publicRooms[roomname]){
      room = publicRooms[roomname];
    }
    else if (privateRooms[roomname]){
      room = privateRooms[roomname];
    }

    if (room) {
      for (let player of room.players){
        if (player.id === data.id){
          player.color = data.color;
          socket.broadcast.to(roomname).emit('setColor', {number: player.number, color: player.color});
          break;
        }
      }
    }
  });
  

  socket.on('leave', function(data){
    leaveRoom(socket, data);
    socket.emit('youLeft');
  });

  
  socket.on('chooseActivity', function(data){
    let roomname = data.roomname;
      // Find the player in the room and update their activity
    let room = privateRooms[roomname] || publicRooms[roomname];
    if (room) {
      let player = room.players.find(p => p.id === data.id);
      if (player) {
        player.activity = data.activity; // Update the player's activity
      }
    }

    if (privateRooms[roomname]){
      if (privateRooms[roomname].players.length === 1){ // alone in your room
        publicRooms[roomname] = privateRooms[roomname]; // move the room to public
        delete privateRooms[roomname];
        socket.emit('roomOpened', publicRooms[roomname].players);
      }
      else if (privateRooms[roomname].players.length === 4){ // in a full private room
        let allSame = privateRooms[roomname].players.every(player => player.activity === data.activity);
        if (allSame){
          privateRooms[roomname].activity = data.activity;
          io.to(roomname).emit('loadActivity', data.activity);
        }
        else {
          io.to(roomname).emit('activityChosen', privateRooms[roomname].players);
        }
      }
      else{
        io.to(roomname).emit('activityChosen', privateRooms[roomname].players);
      }
    }
    else if (publicRooms[roomname]){
      if (publicRooms[roomname].players.length === 1){ // alone in public room
        publicRooms[roomname].activity = data.activity;
        io.to(roomname).emit('activityChosen', publicRooms[roomname].players);
      }
      else {
        let allSame = publicRooms[roomname].players.every(player => player.activity === data.activity);
        if (allSame){
          publicRooms[roomname].activity = data.activity;
          io.to(roomname).emit('loadActivity', data.activity);
        }
        else {
          io.to(roomname).emit('activityChosen', publicRooms[roomname].players);
        }
      }
    }
  });










































  socket.on('selectimg', function(data){
    socket.broadcast.to(data.roomname).emit('selectedimg', data.word);
  });


  socket.on('selectword', async function(data){
    socket.broadcast.to(data.roomname).emit('selectedword', data.word);
    console.log('selectedword: ', data.word);
  });


  socket.on('disconnect', function(){
    console.log('socket disconnected: ', socket.id);
  });
});


};


module.exports = groups;
