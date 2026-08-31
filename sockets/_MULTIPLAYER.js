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


const registerMultiplayerActivityEvents = require("./multiplayer/activities");
const registerHostedActivityEvents = require("./hosted/activities");
const multiplayerActivitiesConfig = require("../config/multiplayer_activities.js");
const validActivityIds = new Set(multiplayerActivitiesConfig.map((a) => a.id));
const hostActivityIds = new Set(
  multiplayerActivitiesConfig.filter((a) => a.group === "host").map((a) => a.id)
);

// Input validation helpers
function isStr(val, maxLen = 100) {
  return typeof val === 'string' && val.length > 0 && val.length <= maxLen;
}

function sanitizePlayerData(data) {
  if (!data || typeof data !== 'object') return null;
  const clean = {};
  if (isStr(data.id, 60)) clean.id = data.id;
  else return null;
  if (data.roomname !== undefined && data.roomname !== null) {
    if (isStr(data.roomname, 60)) clean.roomname = data.roomname;
    else return null;
  }
  if (data.roomtype !== undefined && data.roomtype !== null) {
    if (['public', 'private'].includes(data.roomtype)) clean.roomtype = data.roomtype;
    else return null;
  }
  if (data.color !== undefined && data.color !== null) {
    if (isStr(data.color, 20) && /^#[0-9a-fA-F]{3,8}$/.test(data.color)) clean.color = data.color;
    else clean.color = '#0d6efd';
  }
  if (data.activity !== undefined && data.activity !== null) {
    if (isStr(data.activity, 30)) clean.activity = data.activity;
    else clean.activity = null;
  }
  if (data.number !== undefined && data.number !== null) clean.number = data.number;
  return clean;
}



const multiplayer = (io, options = {}) => {
  const rooms = require("../rooms.json");
  let publicRooms = {};
  let privateRooms = {};
  const INACTIVITY_TIMEOUT = (options && typeof options.inactivityTimeout === 'number') ? options.inactivityTimeout : 10 * 60 * 1000;
  const CLEANUP_INTERVAL = (options && typeof options.cleanupInterval === 'number') ? options.cleanupInterval : 60 * 1000;

  // Helper function to get available rooms efficiently
  function getAvailableRooms() {
    const usedRooms = new Set([
      ...Object.keys(publicRooms),
      ...Object.keys(privateRooms),
    ]);
    return rooms.filter((room) => !usedRooms.has(room));
  }

  function getPublicRoomsList() {
    return Object.values(publicRooms)
      .filter((r) => {
        if (!r || !r.open || !r.players || r.players.length === 0) return false;
        const isHostAct = Boolean(
          (r.activity && hostActivityIds.has(r.activity)) ||
          (r.selectedHostActivity && hostActivityIds.has(r.selectedHostActivity)) ||
          (r.players[0] && r.players[0].activity && hostActivityIds.has(r.players[0].activity))
        );
        if (isHostAct) return true;
        return r.players.length < 4;
      })
      .map((r) => {
        const isHostAct = Boolean(
          (r.activity && hostActivityIds.has(r.activity)) ||
          (r.selectedHostActivity && hostActivityIds.has(r.selectedHostActivity)) ||
          (r.players[0] && r.players[0].activity && hostActivityIds.has(r.players[0].activity))
        );
        return {
          roomname: r.roomname,
          activity: r.activity || r.selectedHostActivity || (r.players[0] ? r.players[0].activity : null),
          isHostActivity: isHostAct,
          playerCount: r.players.length,
          hostId: r.hostId,
          players: r.players.map((p) => ({
            id: p.id,
            color: p.color,
            number: p.number,
          })),
        };
      });
  }

  function broadcastPublicRooms() {
    io.emit("publicRoomsList", getPublicRoomsList());
  }

  function touchRoom(roomname) {
    if (!roomname) return;
    const room = publicRooms[roomname] || privateRooms[roomname];
    if (room) {
      room.lastActive = Date.now();
    }
  }

  function clearActivityRoomStates(roomname) {
    try {
      const popquiz = require("./hosted/activities/popquiz");
      if (popquiz && typeof popquiz.clearPopquizState === "function") {
        popquiz.clearPopquizState(roomname);
      }
      const choose = require("./multiplayer/activities/choose");
      if (choose && typeof choose.clearChooseState === "function") {
        choose.clearChooseState(roomname);
      }
    } catch (e) {
      // ignore
    }
  }

  // Helper function to remove duplicate players by ID from a room
  function removeDuplicatePlayers(room) {
    const seen = new Set();
    room.players = room.players.filter((player) => {
      if (seen.has(player.id)) {
        return false;
      }
      seen.add(player.id);
      return true;
    });
  }

  // Helper function to find player index by ID
  function findPlayerIndex(players, playerId) {
    return players.findIndex((player) => player.id === playerId);
  }

  // Periodic cleanup function to ensure no duplicates exist
  function cleanupDuplicatePlayers() {
    // Clean up public rooms
    Object.keys(publicRooms).forEach((roomname) => {
      if (publicRooms[roomname]) {
        removeDuplicatePlayers(publicRooms[roomname]);
      }
    });

    // Clean up private rooms
    Object.keys(privateRooms).forEach((roomname) => {
      if (privateRooms[roomname]) {
        removeDuplicatePlayers(privateRooms[roomname]);
      }
    });
  }

  // Auto-remove rooms after 10 minutes of inactivity
  function cleanupInactiveRooms(customNow) {
    const now = customNow || Date.now();
    let publicRoomsChanged = false;

    // Check public rooms
    Object.keys(publicRooms).forEach((roomname) => {
      const room = publicRooms[roomname];
      if (!room) return;
      const lastActive = room.lastActive || room.date || 0;
      if (now - lastActive >= INACTIVITY_TIMEOUT) {
        io.to(roomname).emit("roomExpired", {
          roomname,
        });
        clearActivityRoomStates(roomname);
        delete publicRooms[roomname];
        publicRoomsChanged = true;
      }
    });

    // Check private rooms
    Object.keys(privateRooms).forEach((roomname) => {
      const room = privateRooms[roomname];
      if (!room) return;
      const lastActive = room.lastActive || room.date || 0;
      if (now - lastActive >= INACTIVITY_TIMEOUT) {
        io.to(roomname).emit("roomExpired", {
          roomname,
        });
        clearActivityRoomStates(roomname);
        delete privateRooms[roomname];
      }
    });

    if (publicRoomsChanged) {
      broadcastPublicRooms();
    }
  }

  function runCleanup() {
    cleanupDuplicatePlayers();
    cleanupInactiveRooms();
  }

  // Run cleanup every minute
  const cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL);
  if (cleanupInterval.unref) cleanupInterval.unref();

  function openPublicRoom(data) {
    let available = getAvailableRooms();
    if (available.length === 0) {
      return null; // no available rooms
    } else {
      let roomname = available[Math.floor(Math.random() * available.length)];
      let date = Date.now(); // current unix timecode
      data.number = 1; // set the player number to 1 if it's a new room
      publicRooms[roomname] = {
        roomname,
        roomtype: "public",
        hostId: data.id,
        selectedHostActivity: (data.activity && hostActivityIds.has(data.activity)) ? data.activity : null,
        activity: null,
        players: [data],
        open: true,
        turn: 1, // set the turn to player 1
        date,
        lastActive: date,
      };
      broadcastPublicRooms();
      return roomname;
    }
  }

  function openPrivateRoom(data) {
    // check if there are any available rooms
    let available = getAvailableRooms();
    if (available.length === 0) {
      return null; // no available rooms
    } else {
      let roomname = available[Math.floor(Math.random() * available.length)];
      let date = Date.now(); // current unix timecode
      data.number = 1; // set the player number to 1 if it's a new room
      privateRooms[roomname] = {
        roomname,
        roomtype: "private",
        hostId: data.id,
        selectedHostActivity: null,
        open: true,
        activity: null,
        players: [data],
        turn: 1,
        date,
        lastActive: date,
      };
      return roomname;
    }
  }

  function closePublicRoom(roomname) {
    clearActivityRoomStates(roomname);
    delete publicRooms[roomname];
    broadcastPublicRooms();
  }

  function closePrivateRoom(roomname) {
    clearActivityRoomStates(roomname);
    delete privateRooms[roomname];
  }


  function joinPrivateRoom(socket, data) {
    data.roomtype = "private"; // Ensure roomtype is set to private
    let roomname = Object.keys(privateRooms).includes(data.roomname)
      ? data.roomname
      : openPrivateRoom(data);
    if (roomname === null) {
      socket.emit("joined", { message: "No more available rooms." });
      return;
    } else {
      let room = privateRooms[roomname];

      // Safety check: remove any duplicate players that might exist
      removeDuplicatePlayers(room);

      let existingPlayerIndex = findPlayerIndex(room.players, data.id);
      let playerNum;

      if (existingPlayerIndex === -1) {
        // Player not found, add new player
        if (!room.open) {
          socket.emit("joined", {
            message:
              "Sorry, this room is closed and your name is not on the list.",
          });
        } else {
          const isHostAct = Boolean(
            (room.activity && hostActivityIds.has(room.activity)) ||
            (room.selectedHostActivity && hostActivityIds.has(room.selectedHostActivity))
          );
          if (isHostAct || room.players.length < 4) {
            socket.join(roomname);

            // set the player number to the next available number
            let playerNum = 1;
            let playerNums = room.players.map((x) => x.number);
            while (playerNums.includes(playerNum)) playerNum++;
            data.number = playerNum;
            data.roomname = roomname; // Ensure roomname is updated
            room.players.push(data);
            socket.emit("joined", { room, playerNum });
            socket.broadcast.to(roomname).emit("playerJoined", room.players);
            return roomname; // return the roomname for further use
          } else {
            socket.emit("joined", { message: "Sorry, this room is full." });
          }
        }
      } else {
        // Player found, update existing player data instead of adding duplicate
        playerNum = room.players[existingPlayerIndex].number;
        // Update the existing player's data with any new information
        room.players[existingPlayerIndex] = {
          ...room.players[existingPlayerIndex],
          ...data,
          number: playerNum,
        };
        socket.join(roomname);
        socket.emit("joined", { room, playerNum });
        socket.broadcast.to(roomname).emit("playerJoined", room.players);
        return roomname; // return the roomname for further use
      }
    }
  }

  function joinPublicRoom(socket, data) {
    data.roomtype = "public"; // Ensure roomtype is set to public
    let roomname =
      data.roomname && Object.keys(publicRooms).includes(data.roomname)
        ? data.roomname
        : openPublicRoom(data);

    if (roomname === null) {
      socket.emit("joined", { message: "No more available rooms." });
      return;
    } else {
      let room = publicRooms[roomname];

      // Safety check: remove any duplicate players that might exist
      removeDuplicatePlayers(room);

      let existingPlayerIndex = findPlayerIndex(room.players, data.id);
      let playerNum;

      if (existingPlayerIndex !== -1) {
        playerNum = room.players[existingPlayerIndex].number;
      }

      if (existingPlayerIndex === -1) {
        const isHostAct = Boolean(
          (room.activity && hostActivityIds.has(room.activity)) ||
          (room.selectedHostActivity && hostActivityIds.has(room.selectedHostActivity))
        );
        // Player not found, add new player (host activities do not have a 4 player limit)
        if (isHostAct || room.players.length < 4) {
          // set the player number to the next available number
          let playerNums = room.players.map((x) => x.number);
          let playerNum = 1;
          while (playerNums.includes(playerNum)) playerNum++;
          data.number = playerNum;
          data.roomname = roomname; // Ensure roomname is updated
          room.players.push(data);
          socket.join(roomname);
          socket.emit("joined", { room, playerNum });
          // broadcast to all sockets in the room except the sender
          socket.broadcast.to(roomname).emit("playerJoined", room.players);
          broadcastPublicRooms();
          return roomname; // return the roomname for further use
        } else
          socket.emit("joined", {
            message: "Sorry, this room filled up. You'll join a new one.",
          });
      } else {
        // Player found, update existing player data instead of adding duplicate
        // Update the existing player's data with any new information
        room.players[existingPlayerIndex] = {
          ...room.players[existingPlayerIndex],
          ...data,
          number: playerNum,
        };
        socket.join(roomname);
        socket.emit("joined", { room, playerNum });
        // broadcast to all sockets in the room except the sender
        socket.broadcast.to(roomname).emit("playerJoined", room.players);
        broadcastPublicRooms();
        return roomname; // return the roomname for further use
      }
    }
  }

  function leaveRoom(socket, data) {
    let roomname = data.roomname;
    let roomtype = data.roomtype;
    let id = data.id;
    let room;

    socket.leave(data.roomname);

    if (roomtype === "public" || publicRooms[roomname]) {
      if (publicRooms[roomname]) {
        room = publicRooms[roomname];
        room.players = room.players.filter((player) => player.id !== id);
        if (room.players.length === 0) {
          closePublicRoom(roomname);
        } else if (room.players.length === 1) {
          if (room.hostId === id) {
            room.hostId = room.players[0].id;
          }
          if (!room.players[0].activity) {
            room.roomtype = "private";
            room.activity = null;
            room.selectedHostActivity = null;
            privateRooms[roomname] = room;
            delete publicRooms[roomname];
            io.to(roomname).emit("roomClosed", {
              players: room.players,
              roomtype: "private",
              selectedHostActivity: null,
            });
            broadcastPublicRooms();
          } else {
            io.to(roomname).emit("playerLeft", room.players);
            broadcastPublicRooms();
          }
        } else {
          if (room.hostId === id) {
            room.hostId = room.players[0].id;
          }
          io.to(roomname).emit("playerLeft", room.players);
          broadcastPublicRooms();
        }
      }
    } else if (roomtype === "private" || privateRooms[roomname]) {
      if (privateRooms[roomname]) {
        room = privateRooms[roomname];
        room.players = room.players.filter((player) => player.id !== id);
        if (room.players.length === 0) {
          closePrivateRoom(roomname);
        } else {
          if (room.hostId === id) {
            room.hostId = room.players[0].id;
          }
          io.to(roomname).emit("playerLeft", room.players);
        }
      }
    }
  }

  // SOCKET.IO EVENTS ////////////////////////////////////////////////////////////
  io.sockets.on("connection", (socket) => {
    // Register activity events
    registerMultiplayerActivityEvents(io, socket, touchRoom);
    registerHostedActivityEvents(io, socket, touchRoom);

    // Send available public rooms to newly connected client
    socket.emit("publicRoomsList", getPublicRoomsList());

    socket.on("getPublicRooms", function () {
      socket.emit("publicRoomsList", getPublicRoomsList());
    });

    socket.on("join", function (data) {
      if (!data || typeof data !== 'object') return;
      if (data.newRoom) {
        if (!isStr(data.newRoom, 60)) return;
        const player = sanitizePlayerData(data.player);
        if (!player) return;
        leaveRoom(socket, player);
        if (Object.keys(privateRooms).includes(data.newRoom)) {
          player.roomname = data.newRoom;
          joinPrivateRoom(socket, player);
        } else if (Object.keys(publicRooms).includes(data.newRoom)) {
          player.roomname = data.newRoom;
          joinPublicRoom(socket, player);
        } else {
          player.roomname = data.newRoom;
          joinPrivateRoom(socket, player);
        }
      } else {
        const clean = sanitizePlayerData(data);
        if (!clean) return;
        if (clean.roomtype === "public") {
          joinPublicRoom(socket, clean);
        } else if (clean.roomtype === "private") {
          joinPrivateRoom(socket, clean);
        } else {
          socket.emit("joined", { message: "Invalid room type specified." });
        }
      }
    });

    socket.on("roomSearch", function (data) {
      if (!isStr(data, 60)) return;
      touchRoom(data);
      const room = privateRooms[data] || publicRooms[data] || null;
      socket.emit("roomSearch", room);
    });

    socket.on("getName", function (data) {
      if (!data || typeof data !== 'object' || !isStr(data.id, 60)) return;
      if (data.roomname !== undefined && !isStr(data.roomname, 60)) return;
      let roomname = data.roomname;
      touchRoom(roomname);
      let room;
      let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      let noun = nouns[Math.floor(Math.random() * nouns.length)];
      let newName = `${adj} ${noun}`;

      if (roomname) {
        // user is already in a room
        if (publicRooms[roomname]) {
          room = publicRooms[roomname];
          for (let player of room.players) {
            if (player.id === data.id) {
              if (room.hostId === player.id) {
                room.hostId = newName;
              }
              player.id = newName;
              io.to(roomname).emit("setName", {
                number: player.number,
                id: player.id,
              });
              return;
            }
          }
        } else if (privateRooms[roomname]) {
          room = privateRooms[roomname];
          for (let player of room.players) {
            if (player.id === data.id) {
              if (room.hostId === player.id) {
                room.hostId = newName;
              }
              player.id = newName;
              io.to(roomname).emit("setName", {
                number: player.number,
                id: player.id,
              });
              return;
            }
          }
        }
      }
      socket.emit("setName", { id: newName, number: 1 });
    });

    socket.on("setColor", function (data) {
      if (!data || typeof data !== 'object') return;
      if (!isStr(data.roomname, 60) || !isStr(data.id, 60)) return;
      if (!isStr(data.color, 20) || !/^#[0-9a-fA-F]{3,8}$/.test(data.color)) return;
      let roomname = data.roomname;
      touchRoom(roomname);
      let room = publicRooms[roomname] || privateRooms[roomname];

      if (room) {
        let player = room.players.find((p) => p.id === data.id);
        if (player) {
          player.color = data.color;
          socket.broadcast.to(roomname).emit("setColor", {
            number: player.number,
            color: player.color,
            activity: player.activity, // Include activity so other players can update activity pawn
          });
        }
      }
    });

    socket.on("leave", function (data) {
      const clean = sanitizePlayerData(data);
      if (!clean) return;
      touchRoom(clean.roomname);
      leaveRoom(socket, clean);
      socket.emit("youLeft");
    });

    socket.on("chooseActivity", function (data) {
      if (!data || typeof data !== 'object') return;
      if (!isStr(data.roomname, 60) || !isStr(data.id, 60)) return;
      if (data.activity !== undefined && data.activity !== null && (!isStr(data.activity, 30) || !validActivityIds.has(data.activity))) {
        data.activity = null;
      }
      let roomname = data.roomname;
      touchRoom(roomname);
      let room = privateRooms[roomname] || publicRooms[roomname];
      if (!room) {
        socket.emit("error", { message: "Room not found or closed." });
        return;
      }

      let player = room.players.find((p) => p.id === data.id);
      if (player) {
        player.activity = data.activity || null;
      }

      const isHost = (room.hostId === data.id);
      if (isHost) {
        if (data.activity && hostActivityIds.has(data.activity)) {
          room.selectedHostActivity = data.activity;
        } else {
          room.selectedHostActivity = null;
        }
      }

      // Solitary host in room (players.length === 1):
      if (room.players.length === 1) {
        if (data.activity) {
          // Host with no other players selects an activity thereby creating a public room
          room.activity = null;
          room.roomtype = "public";
          publicRooms[roomname] = room;
          delete privateRooms[roomname];

          socket.emit("roomOpened", {
            players: room.players,
            roomtype: "public",
            selectedHostActivity: room.selectedHostActivity,
          });
          io.to(roomname).emit("activityChosen", {
            players: room.players,
            selectedHostActivity: room.selectedHostActivity,
            roomtype: "public",
          });
          broadcastPublicRooms();
        } else {
          // Deselected activity while alone -> revert to private room
          room.activity = null;
          room.selectedHostActivity = null;
          room.roomtype = "private";
          privateRooms[roomname] = room;
          delete publicRooms[roomname];

          socket.emit("roomClosed", {
            players: room.players,
            roomtype: "private",
            selectedHostActivity: null,
          });
          io.to(roomname).emit("activityChosen", {
            players: room.players,
            selectedHostActivity: null,
            roomtype: "private",
          });
          broadcastPublicRooms();
        }
        return;
      }

      // Room has multiple players (players.length > 1)
      const isHostActivity = Boolean(
        room.selectedHostActivity ||
        (data.activity && hostActivityIds.has(data.activity))
      );

      if (isHostActivity) {
        // Host activities do not start on consensus; they require the host to click Start
        io.to(roomname).emit("activityChosen", {
          players: room.players,
          selectedHostActivity: room.selectedHostActivity || (hostActivityIds.has(data.activity) ? data.activity : null),
        });
        return;
      }

      const isStandardActivity = Boolean(data.activity && !hostActivityIds.has(data.activity));
      let allSame = isStandardActivity && room.players.every(
        (p) => p.activity === data.activity && p.activity !== null
      );
      if (allSame) {
        room.activity = data.activity;
        io.to(roomname).emit("loadActivity", data.activity);
      } else {
        io.to(roomname).emit("activityChosen", {
          players: room.players,
          selectedHostActivity: null,
        });
      }
    });

    socket.on("startActivity", function (data) {
      if (!data || typeof data !== 'object') return;
      if (!isStr(data.roomname, 60) || !isStr(data.id, 60)) return;
      if (!isStr(data.activity, 30) || !validActivityIds.has(data.activity)) return;
      let roomname = data.roomname;
      touchRoom(roomname);
      let room = privateRooms[roomname] || publicRooms[roomname];
      if (!room) return;

      if (room.hostId !== data.id) {
        socket.emit("error", { message: "Only the host can start this activity." });
        return;
      }

      room.activity = data.activity;
      room.activityPayload = data.payload || data.questions || data.values || null;
      if (data.activity === 'popquiz') {
        const popquiz = require('./hosted/activities/popquiz');
        if (popquiz && typeof popquiz.getOrCreatePopquizState === 'function') {
          const state = popquiz.getOrCreatePopquizState(roomname, room.activityPayload, data.id);
          state.started = true;
        }
      }
      if (data.activity === 'raffle') {
        const raffle = require('./hosted/activities/raffle');
        if (raffle && typeof raffle.getOrCreateRaffleState === 'function') {
          const state = raffle.getOrCreateRaffleState(roomname, room.activityPayload, data.id);
          state.started = true;
        }
      }
      io.to(roomname).emit("loadActivity", data.activity);
    });

    socket.on("activityComplete", function (data) {
      if (!data || !data.roomname) return;

      const roomname = data.roomname;
      touchRoom(roomname);
      const room = privateRooms[roomname] || publicRooms[roomname];
      if (!room) return;

      if (data.activity && room.activity && room.activity !== data.activity) return;

      room.activity = null;
      room.selectedHostActivity = null;
      room.players.forEach((p) => {
        p.activity = null;
      });

      if (publicRooms[roomname] && room.players.length === 1) {
        room.roomtype = "private";
        privateRooms[roomname] = room;
        delete publicRooms[roomname];
        broadcastPublicRooms();
      }

      io.to(roomname).emit("activityChosen", {
        players: room.players,
        selectedHostActivity: null,
      });
      io.to(roomname).emit("returnToLobby", {
        roomname,
        players: room.players,
        selectedHostActivity: null,
      });
    });

    socket.on("disconnect", function () {
      // Socket disconnected - cleanup handled by socket.io automatically
    });
  });
};


module.exports = multiplayer;
