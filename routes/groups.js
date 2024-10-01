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
var publicRooms = {}; // array of rooms in use
var privateRooms = {}; // array of teacher-created rooms in use

function openPublicRoom(activity){
  let available = rooms.filter(x => !Object.keys(publicRooms).includes(x) 
                                    && !Object.keys(privateRooms).includes(x));
  if (available.length === 0){
    return null;
  }
  else {
    let newRoom = available[Math.floor(Math.random() * available.length)];
    publicRooms[newRoom] = {activity}; // add the word to the rooms object
    return newRoom;
  }
}

function openPrivateRoom(){
  let available = rooms.filter(x => !Object.keys(publicRooms).includes(x) 
                                    && !Object.keys(privateRooms).includes(x));
  if (available.length === 0){
    return null;
  }
  else {
    let newRoom = available[Math.floor(Math.random() * available.length)];
    privateRooms[newRoom] = {activity: null}; //add the word to the rooms object
    return newRoom;
  }
}


function closePublicRoom(room){
  publicRooms = publicRooms.filter(x => x !== room);
}


function closePrivateRoom(room){
  privateRooms = privateRooms.filter(x => x !== room);
}


function joinNewPrivateRoom(socket){
  let room = openPrivateRoom();
  if (room === null){
    console.log('No available rooms');
    socket.emit('joined', null); // client will notify "No available rooms"
    return;
  }

  socket.join(room);
  console.log(`${socket.id} joined the private room. "${room}"`);
  // current unix timecode
  let date = Date.now();
  socket.emit('joined', {date, room, type: 'private', open: true, 
                         activity: null, players: {}, turn: null});
}


function joinPublicRoom(socket, room){
  // TODO:Maybe check if the socket was already in the room? If the activity matches? Maybe no.
  socket.join(room);
  console.log(`${socket.id} joined the public room. "${room}"`);
  socket.broadcast.to(room).emit('joined', socket.id);
  let date = Date.now();
  socket.emit('joined', {date, room, type: 'public'});
}

function getNewName(){
  let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  let noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

io.sockets.on('connection', socket =>{
  console.log('socket connected: ', socket.id);

  socket.on('join', async function(data){ // data = {room: 'room1', type: 'public', player: {} }
    console.log('join: ', data);
    if (data){
      if (data.type === 'public' && Object.keys(publicRooms).includes(data.room)){
        joinPublicRoom(socket, data.room);
      }
      else if (data.type === 'private' && Object.keys(privateRooms).includes(data.room)){
        socket.join(data.room);
        // assigns player number in order of joining
        let number = io.sockets.adapter.rooms.get(data.room).size + 1;
        console.log(`${socket.id} joined the private room. "${data.room}" as player ${number}`);
        // check how many sockets are in the room
        let clients = io.sockets.adapter.rooms.get(data.room);

        // if the room is empty or there are less than 4 connected sockets, add the new socket
        if (!clients || clients.size < 4){
          data.player.number = number;
          socket.broadcast.to(data.room).emit('playerJoined', data.player);
          socket.emit('joined', {room: data.room, type: 'private'});
        }
        else {
          // choose a random available room and return it
          let room = openPrivateRoom();
          if (room === null){
            console.log('No available rooms');
            return;
          }

          socket.join(room);
          console.log(`${socket.id} joined the private room. "${room}"`);
          socket.broadcast.to(room).emit('joined', socket.id);
          socket.emit('joined', {room, type: 'private'});
        }

        socket.emit('joined', {room: data.room, type: 'private'});
      }
      else {
        socket.emit('joined', null);
      }
    }
    else { // choose a random available room, add to privateRooms and return it
      joinNewPrivateRoom(socket);
    }
  });

  socket.on('getName', function(){
    let name = getNewName();
    console.log(name);
    socket.emit('setName', name);
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

  socket.on('setPlayer', function(data){
    socket.broadcast.to(data.room).emit('setPlayer', data.player);
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
