const express = require('express');
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

const chooseEvents = require('./io/choose.js');
const groups = (io) => {
const rooms = require('../rooms.json');
var publicRooms = {};
var privateRooms = {};

// Helper function to get available rooms efficiently
function getAvailableRooms() {
  const usedRooms = new Set([...Object.keys(publicRooms), ...Object.keys(privateRooms)]);
  return rooms.filter(room => !usedRooms.has(room));
}

// Helper function to remove duplicate players by ID from a room
function removeDuplicatePlayers(room) {
  const seen = new Set();
  room.players = room.players.filter(player => {
    if (seen.has(player.id)) {
      return false;
    }
    seen.add(player.id);
    return true;
  });
}

// Helper function to find player index by ID
function findPlayerIndex(players, playerId) {
  return players.findIndex(player => player.id === playerId);
}

// Periodic cleanup function to ensure no duplicates exist
function cleanupDuplicatePlayers() {
  // Clean up public rooms
  Object.keys(publicRooms).forEach(roomname => {
    removeDuplicatePlayers(publicRooms[roomname]);
  });
  
  // Clean up private rooms
  Object.keys(privateRooms).forEach(roomname => {
    removeDuplicatePlayers(privateRooms[roomname]);
  });
}

// Run cleanup every 5 minutes
setInterval(cleanupDuplicatePlayers, 5 * 60 * 1000);


function openPublicRoom(data){
  let available = getAvailableRooms();
  if (available.length === 0) {
    return null; // no available rooms
  }
  else {
    let roomname = available[Math.floor(Math.random() * available.length)];
    let date = Date.now(); // current unix timecode
    data.number = 1; // set the player number to 1 if it's a new room
    publicRooms[roomname] = {roomname, roomtype: 'public',
                             activity: data.activity, players: [data],
                             open: true,
                             turn: 1, // set the turn to player 1
                             date};
    return roomname;
  }
}


function openPrivateRoom(data){
  // check if there are any available rooms
  let available = getAvailableRooms();
  if (available.length === 0) {
    return null; // no available rooms
  }
  else {
    let roomname = available[Math.floor(Math.random() * available.length)];
    let date = Date.now(); // current unix timecode
    data.number = 1; // set the player number to 1 if it's a new room
    privateRooms[roomname] = {roomname, roomtype: 'private', open: true, 
                              activity: null, players: [data],
                              turn: 1,
                              date};
    return roomname;
  }
}


function closePublicRoom(roomname){
  delete publicRooms[roomname];
}


function closePrivateRoom(roomname){
  delete privateRooms[roomname];
}


function joinPrivateRoom(socket, data){
  data.roomtype = 'private'; // Ensure roomtype is set to private
  let roomname = Object.keys(privateRooms).includes(data.roomname) ?
                 data.roomname : 
                 openPrivateRoom(data);
  if (roomname === null){
    socket.emit('joined', {message: "No more available rooms."});
    return;
  }
  else {
    let room = privateRooms[roomname];
    
    // Safety check: remove any duplicate players that might exist
    removeDuplicatePlayers(room);
    
    let existingPlayerIndex = findPlayerIndex(room.players, data.id);
    let playerNum;
    
    if (existingPlayerIndex === -1){ // Player not found, add new player
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
        return roomname; // return the roomname for further use
      }
      else {
        socket.emit('joined', {message: "Sorry, this room is full."});
      }
    }
    else { // Player found, update existing player data instead of adding duplicate
      playerNum = room.players[existingPlayerIndex].number;
      // Update the existing player's data with any new information
      room.players[existingPlayerIndex] = {...room.players[existingPlayerIndex], ...data, number: playerNum};
      socket.join(roomname);
      socket.emit('joined', {room, playerNum});
      socket.broadcast.to(roomname).emit('playerJoined', room.players);
      return roomname; // return the roomname for further use
    }
  }
}


function joinPublicRoom(socket, data){
  let roomname = data.roomname && Object.keys(publicRooms).includes(data.roomname) ?
                 data.roomname : 
                 openPublicRoom(data);

  if (roomname === null){
    socket.emit('joined', {message: "No more available rooms."});
    return;
  }
  else {
    let room = publicRooms[roomname];
    
    // Safety check: remove any duplicate players that might exist
    removeDuplicatePlayers(room);
    
    let existingPlayerIndex = -1;
    let playerNum;

    // Special case: if the room has only one player and it's the same ID, close room and create new private room
    if (room.players.length === 1 && room.players[0].id === data.id){
      leaveRoom(socket, data); // This will close the room since they're the only player
      // Create a new private room for them
      let newRoomname = openPrivateRoom(data);
      if (newRoomname) {
        socket.join(newRoomname);
        socket.emit('joined', {room: privateRooms[newRoomname], playerNum: 1});
        return newRoomname;
      } else {
        socket.emit('joined', {message: "No available rooms."});
        return;
      }
    }
    else{
      // Check if player already exists in the room
      existingPlayerIndex = findPlayerIndex(room.players, data.id);
      if (existingPlayerIndex !== -1) {
        playerNum = room.players[existingPlayerIndex].number;
      }
    }

    if (existingPlayerIndex === -1){ // Player not found, add new player
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
        return roomname; // return the roomname for further use
      }
      else socket.emit('joined', {message: "Sorry, this room filled up. You'll join a new one."});
    }
    else { // Player found, update existing player data instead of adding duplicate
      // Update the existing player's data with any new information
      room.players[existingPlayerIndex] = {...room.players[existingPlayerIndex], ...data, number: playerNum};
      socket.join(roomname);
      socket.emit('joined', {room, playerNum});
      // broadcast to all sockets in the room except the sender
      socket.broadcast.to(roomname).emit('playerJoined', room.players);
      return roomname; // return the roomname for further use
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
      }
      else io.to(roomname).emit('playerLeft', room.players);
    }
  }
  else if (roomtype === 'private'){
    if (privateRooms[roomname]){
      room = privateRooms[roomname];
      room.players = room.players.filter(player => player.id !== id);
      if (room.players.length === 0){
        closePrivateRoom(roomname);
      }
      else io.to(roomname).emit('playerLeft', room.players);
    }
  }
}


// SOCKET.IO EVENTS ////////////////////////////////////////////////////////////
io.sockets.on('connection', socket =>{
  
  // Initialize modular event handlers for this socket
  chooseEvents(io, socket);
  
  socket.on('join', function(data){
    if (data.newRoom) {
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
    else {
      if (data.roomtype === 'public'){
        joinPublicRoom(socket, data);
      }
      else if (data.roomtype === 'private'){
        joinPrivateRoom(socket, data);
      }
      else {
        socket.emit('joined', {message: "Invalid room type specified."});
      }
    }
  });

  socket.on('roomSearch', function(data){
    const room = privateRooms[data] || publicRooms[data] || null;
    socket.emit('roomSearch', room);
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
    let roomname = data.roomname;
    let room = publicRooms[roomname] || privateRooms[roomname];

    if (room) {
      let player = room.players.find(p => p.id === data.id);
      if (player) {
        player.color = data.color;
        socket.broadcast.to(roomname).emit('setColor', {
          number: player.number, 
          color: player.color,
          activity: player.activity // Include activity so other players can update activity pawn
        });
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
      if (room.players.length === 1){ // alone in your room
        publicRooms[roomname] = room; // move the room to public
        delete privateRooms[roomname];
        socket.emit('roomOpened', room.players);
      }
      else if (room.length === 4){ // in a full private room
        let allSame = room.players.every(player => player.activity === data.activity);
        if (allSame){
          room.activity = data.activity;
          io.to(roomname).emit('loadActivity', data.activity);
        }
        else {
          io.to(roomname).emit('activityChosen', room.players);
        }
      }
      else{
        // Check if all players chose the same activity
        let allSame = room.players.every(player => player.activity === data.activity);
        if (allSame){
          room.activity = data.activity;
          io.to(roomname).emit('loadActivity', data.activity);
        }
        else {
          io.to(roomname).emit('activityChosen', room.players);
        }
      }
    }
    else if (publicRooms[roomname]){
      if (room.players.length === 1){ // alone in public room
        room.activity = data.activity;
        io.to(roomname).emit('activityChosen', room.players);
      }
      else {
        let allSame = room.players.every(player => player.activity === data.activity);
        if (allSame){
          room.activity = data.activity;
          io.to(roomname).emit('loadActivity', data.activity);
        }
        else {
          io.to(roomname).emit('activityChosen', room.players);
        }
      }
    }
    else {
      socket.emit('error', {message: "Room not found or closed."});
    }
  });










































  socket.on('disconnect', function(){
    // Socket disconnected - cleanup handled by socket.io automatically
  });
});


};


module.exports = groups;
