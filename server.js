const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Тоглоомны төлөв
const rooms = new Map();
const players = new Map();

// Монгол сэдвүүд
const mongolianTopics = [
    "Хаан сүргийн тухай ярицаа",
    "Чингис хааны гавьяа гүйцэтгэл",
    "Монголчуудын нүүдлийн соёл",
    "Гэгээрэн төрийн тухай",
    "Өгэдэй хааны үе",
    "Монголын цэргийн тактик",
    "Их Монгол Улсын дипломат",
    "Монголын үндэсний хувцас",
    "Байгаль эхийг хамгаалах",
    "Монгол хэлний цагаан толгой",
    "Наадам нарын тухай",
    "Монгол ахуйд байгаа эрсдэл",
    "Улаанбаатар хотын асуудал",
    "Монголчуудын уламжлалт ёс",
    "Төрийн далбааны утга учир"
];

class Room {
    constructor(roomId) {
        this.id = roomId;
        this.players = new Map();
        this.gamePhase = 'waiting'; // waiting, discussion, voting, result
        this.imposterId = null;
        this.currentTopic = null;
        this.votes = new Map();
        this.messages = [];
        this.maxPlayers = 5;
    }

    addPlayer(socketId, playerName) {
        if (this.players.size >= this.maxPlayers) {
            return false;
        }

        const player = {
            id: socketId,
            name: playerName,
            role: 'crewmate',
            alive: true,
            avatar: this.getAvatar(this.players.size),
            joinedAt: new Date()
        };

        this.players.set(socketId, player);
        return true;
    }

    getAvatar(index) {
        const avatars = ['👨‍🚀', '👩‍🚀', '🧑‍🚀', '👨‍💼', '👩‍💼'];
        return avatars[index % avatars.length];
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
        this.votes.delete(socketId);
    }

    startGame() {
        if (this.players.size < 3) {
            return false;
        }

        // Санамсаргүйгээр нэгийг нь Imposter болгох
        const playerIds = Array.from(this.players.keys());
        const imposterIndex = Math.floor(Math.random() * playerIds.length);
        this.imposterId = playerIds[imposterIndex];

        // Imposter-г оноох
        this.players.forEach(player => {
            player.role = player.id === this.imposterId ? 'imposter' : 'crewmate';
            player.alive = true;
        });

        // Санамсаргүй сэдэв сонгох
        this.currentTopic = mongolianTopics[Math.floor(Math.random() * mongolianTopics.length)];
        this.gamePhase = 'discussion';
        this.votes.clear();
        this.messages = [];

        return true;
    }

    addVote(voterId, targetId) {
        if (!this.players.has(voterId) || !this.players.has(targetId)) {
            return false;
        }

        this.votes.set(voterId, targetId);
        return true;
    }

    checkVotingResult() {
        const voteCount = new Map();
        
        this.votes.forEach(targetId => {
            voteCount.set(targetId, (voteCount.get(targetId) || 0) + 1);
        });

        let maxVotes = 0;
        let votedOutId = null;

        voteCount.forEach((votes, playerId) => {
            if (votes > maxVotes) {
                maxVotes = votes;
                votedOutId = playerId;
            }
        });

        if (votedOutId) {
            const votedOutPlayer = this.players.get(votedOutId);
            votedOutPlayer.alive = false;

            const imposterPlayer = this.players.get(this.imposterId);
            
            if (votedOutId === this.imposterId) {
                this.gamePhase = 'result';
                return {
                    winner: 'crewmates',
                    message: '🎉 Багийн гишүүд яллаа! Imposter-г илрүүллээ!',
                    votedOut: votedOutPlayer
                };
            } else {
                this.gamePhase = 'result';
                return {
                    winner: 'imposter',
                    message: '💀 Imposter яллаа! Багийн гишүүд буруу хүнийг саналаар хаслаа!',
                    votedOut: votedOutPlayer
                };
            }
        }

        return null;
    }

    getGameState() {
        return {
            id: this.id,
            players: Array.from(this.players.values()),
            gamePhase: this.gamePhase,
            currentTopic: this.currentTopic,
            playerCount: this.players.size,
            maxPlayers: this.maxPlayers,
            messages: this.messages
        };
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Хэрэглэгч холбогдлоо:', socket.id);

    // Өрөө үүсгэх
    socket.on('create-room', (playerName) => {
        const roomId = uuidv4().slice(0, 6);
        const room = new Room(roomId);
        
        if (room.addPlayer(socket.id, playerName)) {
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('room-created', { roomId, room: room.getGameState() });
            console.log(`${playerName} өрөө үүсгэлээ: ${roomId}`);
        } else {
            socket.emit('error', 'Өрөө үүсгэхэд алдаа гарлаа');
        }
    });

    // Өрөөнд орох
    socket.on('join-room', ({ roomId, playerName }) => {
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit('error', 'Өрөө олдсонгүй');
            return;
        }

        if (room.addPlayer(socket.id, playerName)) {
            socket.join(roomId);
            socket.emit('room-joined', { roomId, room: room.getGameState() });
            
            // Бүх тоглогчид руу шинэ тоглогчийн мэдээллийг илгээх
            io.to(roomId).emit('player-joined', {
                player: room.players.get(socket.id),
                room: room.getGameState()
            });
            
            console.log(`${playerName} өрөөнд орлоо: ${roomId}`);
        } else {
            socket.emit('error', 'Өрөө дүүрэн байна');
        }
    });

    // Тоглоом эхлүүлэх
    socket.on('start-game', () => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) {
            socket.emit('error', 'Та өрөөнд байхгүй байна');
            return;
        }

        if (room.startGame()) {
            // Тоглогч бүрт өөрийн дүрийг илгээх
            room.players.forEach((player, playerId) => {
                io.to(playerId).emit('game-started', {
                    role: player.role,
                    topic: room.currentTopic,
                    room: room.getGameState()
                });
            });
            
            console.log(`Тоглоом эхэллээ: ${room.id}, Сэдэв: ${room.currentTopic}`);
        } else {
            socket.emit('error', 'Тоглоом эхлүүлэхэд алдаа гарлаа. Хамгийн багадаа 3 тоглогч хэрэгтэй.');
        }
    });

    // Чат мессеж
    socket.on('chat-message', (message) => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) return;

        const player = room.players.get(socket.id);
        if (!player || !player.alive) return;

        const messageData = {
            id: uuidv4(),
            playerId: socket.id,
            playerName: player.name,
            text: message,
            timestamp: new Date()
        };

        room.messages.push(messageData);
        
        // Бүх тоглогчид руу мессеж илгээх
        io.to(room.id).emit('chat-message', messageData);
        
        console.log(`${player.name}: ${message}`);
    });

    // Санал өгөх
    socket.on('vote', (targetId) => {
        const room = findPlayerRoom(socket.id);
        
        if (!room || room.gamePhase !== 'voting') {
            socket.emit('error', 'Санал өгөх үе биш');
            return;
        }

        const voter = room.players.get(socket.id);
        if (!voter || !voter.alive) {
            socket.emit('error', 'Та санал өгөх эрхгүй байна');
            return;
        }

        if (room.addVote(socket.id, targetId)) {
            socket.emit('vote-cast', { targetId });
            
            // Бүх санал ирсэн үү?
            const alivePlayers = Array.from(room.players.values()).filter(p => p.alive);
            if (room.votes.size >= alivePlayers.length) {
                const result = room.checkVotingResult();
                if (result) {
                    io.to(room.id).emit('game-ended', result);
                }
            }
        }
    });

    // Санал хураалт эхлүүлэх
    socket.on('start-voting', () => {
        const room = findPlayerRoom(socket.id);
        
        if (!room || room.gamePhase !== 'discussion') {
            socket.emit('error', 'Санал хураалт эхлүүлэх боломжгүй');
            return;
        }

        room.gamePhase = 'voting';
        room.votes.clear();
        
        io.to(room.id).emit('voting-started', {
            room: room.getGameState()
        });
    });

    // Тоглоомыг дахин эхлүүлэх
    socket.on('restart-game', () => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) return;

        room.gamePhase = 'waiting';
        room.imposterId = null;
        room.currentTopic = null;
        room.votes.clear();
        room.messages = [];

        room.players.forEach(player => {
            player.role = 'crewmate';
            player.alive = true;
        });

        io.to(room.id).emit('game-restarted', room.getGameState());
    });

    // Холболт салсан үед
    socket.on('disconnect', () => {
        console.log('Хэрэглэгч саллаа:', socket.id);
        
        const room = findPlayerRoom(socket.id);
        if (room) {
            const player = room.players.get(socket.id);
            if (player) {
                room.removePlayer(socket.id);
                
                // Өрөө хоосорбол устгах
                if (room.players.size === 0) {
                    rooms.delete(room.id);
                    console.log(`Өрөө устгагдлаа: ${room.id}`);
                } else {
                    // Бусад тоглогчид руу мэдэгдэх
                    io.to(room.id).emit('player-left', {
                        playerName: player.name,
                        room: room.getGameState()
                    });
                }
            }
        }
    });
});

// Туслах функцууд
function findPlayerRoom(socketId) {
    for (const [roomId, room] of rooms) {
        if (room.players.has(socketId)) {
            return room;
        }
    }
    return null;
}

// Express route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/room/:roomId', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Server start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Монгол Imposter тоглоом эхэллээ!`);
    console.log(`🌐 Сервер: http://localhost:${PORT}`);
    console.log(`📱 Хөтчөөр нээж болно: http://localhost:${PORT}`);
});
