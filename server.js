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

// Шинэ сэдвийн ангиллууд
const topicCategories = {
    clothing: [
        "Хувцасны загвар",
        "Гуталны загвар",
        "Малгайны загвар",
        "Үндэсний хувцас",
        "Спорт хувцас",
        "Зуны хувцас",
        "Өвлийн хувцас",
        "Гоёл чимэглэл"
    ],
    brands: [
        "Nike бренд",
        "Adidas бренд", 
        "Apple бренд",
        "Samsung бренд",
        "Toyota бренд",
        "Coca-Cola бренд",
        "McDonald's бренд",
        "Louis Vuitton бренд"
    ],
    movies: [
        "Marvel кинонууд",
        "DC кинонууд",
        "Disney кинонууд",
        "Бөгөлөө кино",
        "Inception кино",
        "Avatar кино",
        "Harry Potter кино",
        "Star Wars кино"
    ],
    music: [
        "K-Pop хөгжим",
        "Рок хөгжим",
        "Поп хөгжим",
        "Рэп хөгжим",
        "Классик хөгжим",
        "Жазз хөгжим",
        "Хип-хоп хөгжим",
        "Электроник хөгжим"
    ],
    food: [
        "Монгол хоол",
        "Япон хоол",
        "Италиан хоол",
        "Хятад хоол",
        "Салад",
        "Десерт",
        "Уух зүйл",
        "Фастфүүд"
    ],
    sports: [
        "Хөлбөмбөг",
        "Сагсан бөмбөг",
        "Воллейбол",
        "Теннис",
        "Бокс",
        "Сүмо бөх",
        "Гольф",
        "Хүндийн өргөлт"
    ],
    technology: [
        "Смартфон",
        "Компьютер",
        "Гар утас",
        "Таблет",
        "Лаптоп",
        "Гар дэлгэц",
        "Smart watch",
        "VR технологи"
    ],
    animals: [
        "Машин үнэг",
        "Хонь",
        "Үхэр",
        "Морь",
        "Ямаа",
        "Тэмээ",
        "Нохой",
        "Муур"
    ]
};

// Асуултууд
const questions = [
    {
        question: "Монгол Улсын нийслэл хаана вэ?",
        answers: ["Улаанбаатар", "Эрдэнэт", "Дархан", "Чойбалсан"]
    },
    {
        question: "Чингис хаан хэдэн онд төрсэн бэ?",
        answers: ["1162 он", "1155 он", "1206 он", "1189 он"]
    },
    {
        question: "Монголын үндэсний бөхийн нэр юу вэ?",
        answers: ["Морь", "Тэмээ", "Үхэр", "Ямаа"]
    },
    {
        question: "Монгол улсын тугийн өнгө ямар вэ?",
        answers: ["Улаан, цэнхэр, хөх", "Улаан, цагаан, хар", "Улаан, хөх, ногоон", "Улаан, шар, хөх"]
    },
    {
        question: "Монголын хамгийн том наадам юу вэ?",
        answers: ["Наадам", "Цагаан сар", "Үндэсний баяр", "Сүлд баяр"]
    },
    {
        question: "Монгол хэлний дүрэмж хэдэн үсэгтэй вэ?",
        answers: ["35", "26", "33", "28"]
    },
    {
        question: "Говь гэж юуг хэлдэг вэ?",
        answers: ["Хуурай талбай", "Уул нуруу", "Ой хөвч", "Нуур гол"]
    },
    {
        question: "Монголын анхны хаан хэн бэ?",
        answers: ["Мөнх хаан", "Чингис хаан", "Өгэдэй хаан", "Хубилай хаан"]
    },
    {
        question: "Монголын үндэсний хоол юу вэ?",
        answers: ["Бууз", "Хуушуур", "Цуйван", "Банш"]
    },
    {
        question: "Монгол Улс хэдэн аймагт хуваагддаг вэ?",
        answers: ["21", "22", "23", "20"]
    },
    {
        question: "Монголын үндэсний хувцасыг юу гэдэг вэ?",
        answers: ["Дээл", "Хувцас", "Гутал", "Малгай"]
    },
    {
        question: "Монголын хамгийн өндөр уул юу вэ?",
        answers: ["Хүйтэн хайрхан", "Алтай овоо", "Отгонтэнгэр", "Сүхбаатар"]
    },
    {
        question: "Монголын үндэсний тоглоом юу вэ?",
        answers: ["Шагай", "Хэл хэтэг", "Домбир", "Тоглоом"]
    },
    {
        question: "Монголын үндэсний уран зураг юу вэ?",
        answers: ["Монгол зураг", "Уран зураг", "Зураг", "Дүрслэл"]
    },
    {
        question: "Монгол Улсын мөнгөний нэгж юу вэ?",
        answers: ["Төгрөг", "Юань", "Доллар", "Евро"]
    }
];

class Room {
    constructor(roomId) {
        this.id = roomId;
        this.players = new Map();
        this.gamePhase = 'waiting'; // waiting, discussion, voting, result, question, final_guess
        this.imposterId = null;
        this.currentTopic = null;
        this.creatorId = null; // Өрөө үүсгэгчийн ID
        this.selectedTopic = null; // Сонгосон сэдэв
        this.votes = new Map();
        this.messages = []; // Хүлээлгэний үеийн чат мессежүүд
        this.maxPlayers = 5;
        this.currentRound = 0;
        this.maxRounds = 5;
        this.currentQuestion = null;
        this.correctAnswer = null;
        this.usedQuestions = [];
        this.playerAnswers = new Map();
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
            joinedAt: new Date(),
            isCreator: this.players.size === 0 // Эхний орж ирэх хүн үүсгэгч болно
        };

        this.players.set(socketId, player);
        
        // Хэрэв эхний тоглогч бол үүсгэгч болгох
        if (this.players.size === 1) {
            this.creatorId = socketId;
        }
        
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

        // Хэрэв сэдэв сонгоогүй бол автоматаар сонгох
        if (!this.selectedTopic) {
            this.selectedTopic = mongolianTopics[Math.floor(Math.random() * mongolianTopics.length)];
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

        this.currentTopic = this.selectedTopic;
        this.gamePhase = 'discussion';
        this.votes.clear();
        this.messages = []; // Тоглоомын чатыг цэвэрлэх

        return true;
    }

    addVote(voterId, targetId) {
        if (!this.players.has(voterId) || !this.players.has(targetId)) {
            return false;
        }

        this.votes.set(voterId, targetId);
        return true;
    }

    // Асуулт сонгох функц
    selectRandomQuestion() {
        const availableQuestions = questions.filter(q => !this.usedQuestions.includes(q.question));
        if (availableQuestions.length === 0) {
            // Бүх асуултууд ашиглагдсан бол дахин эхлэх
            this.usedQuestions = [];
            return this.selectRandomQuestion();
        }
        
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];
        
        this.currentQuestion = selectedQuestion.question;
        this.correctAnswer = selectedQuestion.answers[0]; // Эхний хариулт зөв
        this.usedQuestions.push(selectedQuestion.question);
        
        return {
            question: selectedQuestion.question,
            answers: selectedQuestion.answers.sort(() => Math.random() - 0.5) // Хариултуудыг санамсаргүй эрэмбэлэх
        };
    }

    // Хариулт шалгах функц
    checkAnswer(playerId, answer) {
        const player = this.players.get(playerId);
        if (!player || !player.alive) return false;
        
        const isCorrect = answer === this.correctAnswer;
        this.playerAnswers.set(playerId, { answer, isCorrect });
        
        return isCorrect;
    }

    // Раунд шалгах функц
    checkRoundEnd() {
        const alivePlayers = Array.from(this.players.values()).filter(p => p.alive);
        const answersCount = this.playerAnswers.size;
        
        // Бүх амьд тоглогчид хариулсан эсэх
        if (answersCount >= alivePlayers.length) {
            // Буруу хариулсан тоглогчдыг хасах
            let eliminatedCount = 0;
            this.playerAnswers.forEach((answerData, playerId) => {
                if (!answerData.isCorrect) {
                    const player = this.players.get(playerId);
                    if (player) {
                        player.alive = false;
                        eliminatedCount++;
                    }
                }
            });
            
            this.currentRound++;
            this.playerAnswers.clear();
            
            // Үлдсэн тоглогчид
            const remainingPlayers = Array.from(this.players.values()).filter(p => p.alive);
            
            return {
                eliminated: eliminatedCount,
                remaining: remainingPlayers.length,
                round: this.currentRound,
                isFinalRound: this.currentRound >= this.maxRounds || remainingPlayers.length <= 2
            };
        }
        
        return null;
    }

    // Эцсийн таамаглалтын үе
    startFinalGuess() {
        this.gamePhase = 'final_guess';
        const remainingPlayers = Array.from(this.players.values()).filter(p => p.alive);
        return remainingPlayers;
    }

    getGameState() {
        return {
            id: this.id,
            players: Array.from(this.players.values()),
            gamePhase: this.gamePhase,
            currentTopic: this.currentTopic,
            selectedTopic: this.selectedTopic,
            playerCount: this.players.size,
            maxPlayers: this.maxPlayers,
            messages: this.messages,
            creatorId: this.creatorId,
            currentRound: this.currentRound,
            maxRounds: this.maxRounds,
            currentQuestion: this.currentQuestion,
            remainingPlayers: Array.from(this.players.values()).filter(p => p.alive).length
        };
    }

    // Сэдэв сонгох функц
    selectTopic(topic) {
        if (mongolianTopics.includes(topic)) {
            this.selectedTopic = topic;
            return true;
        }
        return false;
    }

    // Санамсаргүй сэдэв сонгох функц
    selectRandomTopic() {
        const categories = Object.keys(topicCategories);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const categoryTopics = topicCategories[randomCategory];
        const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)];
        
        this.selectedTopic = randomTopic;
        return {
            topic: randomTopic,
            category: randomCategory
        };
    }

    // Бүх сэдвүүдийг авах
    static getAllTopics() {
        return mongolianTopics;
    }

    // Ангиллуудыг авах
    static getTopicCategories() {
        return topicCategories;
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
            socket.emit('room-created', { 
                roomId, 
                room: room.getGameState(),
                isCreator: true,
                topics: Room.getAllTopics(),
                categories: Room.getTopicCategories()
            });
            console.log(`${playerName} өрөө үүсгэлээ: ${roomId}`);
        } else {
            socket.emit('error', 'Өрөө үүсгэхэд алдаа гарлаа');
        }
    });

    // Өрөөнд орох
    socket.on('join-room', ({ roomId, playerName }) => {
        console.log(`Өрөөнд орох хүсэлт: ${playerName}, Код: ${roomId}`);
        
        const room = rooms.get(roomId);
        
        if (!room) {
            console.log(`Өрөө олдсонгүй: ${roomId}`);
            socket.emit('error', 'Өрөө олдсонгүй');
            return;
        }

        if (room.addPlayer(socket.id, playerName)) {
            socket.join(roomId);
            const player = room.players.get(socket.id);
            console.log(`${playerName} өрөөнд орлоо: ${roomId}, Дүр: ${player.role}`);
            
            socket.emit('room-joined', { 
                roomId, 
                room: room.getGameState(),
                isCreator: player.isCreator,
                selectedTopic: room.selectedTopic
            });
            
            // Бүх тоглогчид руу шинэ тоглогчийн мэдээллийг илгээх
            io.to(roomId).emit('player-joined', {
                player: player,
                room: room.getGameState()
            });
            
            console.log(`${playerName} өрөөнд орлоо: ${roomId}`);
        } else {
            console.log(`Өрөө дүүрэн байна: ${roomId}`);
            socket.emit('error', 'Өрөө дүүрэн байна');
        }
    });

    // Хүлээлгэний үеийн чат мессеж
    socket.on('waiting-chat-message', (message) => {
        const room = findPlayerRoom(socket.id);
        
        if (!room || room.gamePhase !== 'waiting') {
            socket.emit('error', 'Хүлээлгэний үе биш');
            return;
        }

        const player = room.players.get(socket.id);
        if (!player) return;

        const messageData = {
            id: uuidv4(),
            playerId: socket.id,
            playerName: player.name,
            text: message,
            timestamp: new Date()
        };

        room.messages.push(messageData);
        
        // Бүх тоглогчид руу мессеж илгээх
        io.to(room.id).emit('waiting-chat-message', messageData);
        
        console.log(`[Хүлээлгээ] ${player.name}: ${message}`);
    });

    // Сэдэв сонгох
    socket.on('select-topic', (topic) => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) {
            socket.emit('error', 'Та өрөөнд байхгүй байна');
            return;
        }

        // Зөвхөн өрөө үүсгэгч л сэдэв сонгох боломжтой
        if (socket.id !== room.creatorId) {
            socket.emit('error', 'Зөвхөн өрөө үүсгэгч л сэдэв сонгох боломжтой');
            return;
        }

        if (room.selectTopic(topic)) {
            // Бүх тоглогчид руу сонгосон сэдвийг илгээх
            io.to(room.id).emit('topic-selected', {
                topic: topic,
                room: room.getGameState()
            });
            
            console.log(`Сэдэв сонгогдлоо: ${topic}`);
        } else {
            socket.emit('error', 'Сэдэв сонгох боломжгүй');
        }
    });

    // Санамсаргүй сэдэв сонгох
    socket.on('select-random-topic', () => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) {
            socket.emit('error', 'Та өрөөнд байхгүй байна');
            return;
        }

        // Зөвхөн өрөө үүсгэгч л сэдэв сонгох боломжтой
        if (socket.id !== room.creatorId) {
            socket.emit('error', 'Зөвхөн өрөө үүсгэгч л сэдэв сонгох боломжтой');
            return;
        }

        const topicData = room.selectRandomTopic();
        
        // Бүх тоглогчид руу сонгосон сэдвийг илгээх
        io.to(room.id).emit('random-topic-selected', {
            topic: topicData.topic,
            category: topicData.category,
            room: room.getGameState()
        });
        
        console.log(`Санамсаргүй сэдэв сонгогдлоо: ${topicData.topic} (${topicData.category})`);
    });

    // Тоглоом дуусгах
    socket.on('end-game', () => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) {
            socket.emit('error', 'Та өрөөнд байхгүй байна');
            return;
        }

        // Зөвхөн өрөө үүсгэгч л тоглоом дуусгах боломжтой
        if (socket.id !== room.creatorId) {
            socket.emit('error', 'Зөвхөн өрөө үүсгэгч л тоглоом дуусгах боломжтой');
            return;
        }

        room.gamePhase = 'waiting';
        room.currentRound = 0;
        room.selectedTopic = null;
        room.currentQuestion = null;
        room.usedQuestions = [];
        room.playerAnswers.clear();
        room.votes.clear();
        
        // Бүх тоглогчид руу мэдэгдэх
        io.to(room.id).emit('game-ended-by-creator', {
            message: 'Өрөө үүсгэгч тоглоомыг дуусгав',
            room: room.getGameState()
        });
        
        console.log(`Тоглоом дуусгагдлаа: ${room.id}`);
    });

    // Тоглоом эхлүүлэх
    socket.on('start-game', () => {
        const room = findPlayerRoom(socket.id);
        
        if (!room) {
            socket.emit('error', 'Та өрөөнд байхгүй байна');
            return;
        }

        // Хамгийн багадаа 3 тоглогч хэрэгтэй
        if (room.players.size < 3) {
            socket.emit('error', 'Тоглоом эхлүүлэхийн тулд хамгийн багадаа 3 тоглогч хэрэгтэй!');
            return;
        }

        // Сэдэв сонгогдсон эсэх
        if (!room.selectedTopic) {
            socket.emit('error', 'Эхлэхийн тулд сэдэв сонгох шаардлагатай!');
            return;
        }

        // Тоглоомын горимыг шинэчлэх - асуулт хариулт
        room.gamePhase = 'question';
        room.currentRound = 1;
        
        // Эхний асуултыг илгээх
        const questionData = room.selectRandomQuestion();
        
        // Бүх тоглогчид руу мэдээлэх
        room.players.forEach((player, playerId) => {
            io.to(playerId).emit('question-phase-started', {
                role: player.role,
                topic: room.selectedTopic,
                round: room.currentRound,
                maxRounds: room.maxRounds,
                question: questionData.question,
                answers: questionData.answers,
                room: room.getGameState()
            });
        });
        
        console.log(`Асуултын тоглоом эхэллээ: ${room.id}, Раунд: ${room.currentRound}`);
    });

    // Хариулт илгээх
    socket.on('submit-answer', (answer) => {
        const room = findPlayerRoom(socket.id);
        
        if (!room || room.gamePhase !== 'question') {
            socket.emit('error', 'Асуултын үе биш');
            return;
        }

        const isCorrect = room.checkAnswer(socket.id, answer);
        
        socket.emit('answer-result', {
            correct: isCorrect,
            answer: answer
        });
        
        // Раунд дууссан эсэх шалгах
        const roundResult = room.checkRoundEnd();
        if (roundResult) {
            io.to(room.id).emit('round-ended', {
                round: roundResult.round,
                eliminated: roundResult.eliminated,
                remaining: roundResult.remaining,
                isFinalRound: roundResult.isFinalRound,
                room: room.getGameState()
            });
            
            if (roundResult.isFinalRound) {
                // Эцсийн таамаглалтын үе
                const remainingPlayers = room.startFinalGuess();
                io.to(room.id).emit('final-guess-phase', {
                    remainingPlayers: remainingPlayers,
                    room: room.getGameState()
                });
            } else {
                // Дараагийн раунд
                setTimeout(() => {
                    const nextQuestion = room.selectRandomQuestion();
                    room.gamePhase = 'question';
                    
                    room.players.forEach((player, playerId) => {
                        if (player.alive) {
                            io.to(playerId).emit('next-question', {
                                round: room.currentRound,
                                question: nextQuestion.question,
                                answers: nextQuestion.answers,
                                room: room.getGameState()
                            });
                        }
                    });
                }, 3000);
            }
        }
    });

    // Эцсийн таамаглалт
    socket.on('submit-final-vote', (targetId) => {
        const room = findPlayerRoom(socket.id);
        
        if (!room || room.gamePhase !== 'final_guess') {
            socket.emit('error', 'Эцсийн таамаглалтын үе биш');
            return;
        }

        room.votes.set(socket.id, targetId);
        
        // Бүх санал ирсэн үү?
        const alivePlayers = Array.from(room.players.values()).filter(p => p.alive);
        if (room.votes.size >= alivePlayers.length) {
            const voteCount = new Map();
            
            room.votes.forEach(targetId => {
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
            
            const votedOutPlayer = room.players.get(votedOutId);
            const imposterPlayer = room.players.get(room.imposterId);
            
            room.gamePhase = 'result';
            
            io.to(room.id).emit('game-ended', {
                winner: votedOutId === room.imposterId ? 'crewmates' : 'imposter',
                message: votedOutId === room.imposterId ? 
                    '🎉 Багийн гишүүд яллаа! Imposter-г илрүүллээ!' : 
                    '💀 Imposter яллаа! Багийн гишүүд буруу хүнийг сонголоо!',
                votedOut: votedOutPlayer,
                imposter: imposterPlayer,
                votes: Array.from(voteCount.entries()).map(([playerId, votes]) => ({
                    playerId,
                    playerName: room.players.get(playerId).name,
                    votes
                })),
                room: room.getGameState()
            });
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
