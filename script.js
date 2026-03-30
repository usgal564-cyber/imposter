// Монгол Imposter тоглоомны JavaScript
class ImposterGame {
    constructor() {
        this.players = [];
        this.currentPlayer = null;
        this.imposterIndex = -1;
        this.gamePhase = 'start'; // start, players, discussion, voting, result
        this.messages = [];
        this.votes = {};
        this.selectedVote = null;
        
        this.initializeGame();
        this.bindEvents();
    }

    initializeGame() {
        // 5 тоглогчийн нэрсүүд
        const playerNames = [
            'Бат', 'Саран', 'Тэмүүлэн', 'Наран', 'Анхбаяр'
        ];
        
        const avatars = ['👨‍🚀', '👩‍🚀', '🧑‍🚀', '👨‍💼', '👩‍💼'];
        
        // Тоглогчидыг үүсгэх
        for (let i = 0; i < 5; i++) {
            this.players.push({
                id: i,
                name: playerNames[i],
                avatar: avatars[i],
                role: 'crewmate',
                alive: true,
                votes: 0
            });
        }
        
        // Санамсаргүйгээр нэгийг нь Imposter болгох
        this.imposterIndex = Math.floor(Math.random() * 5);
        this.players[this.imposterIndex].role = 'imposter';
        
        // Одоогийн тоглогч (хэрэглэгч)
        this.currentPlayer = this.players[0]; // Эхний тоглогчийг хэрэглэгч болгох
    }

    bindEvents() {
        // Тоглоом эхлүүлэх товч
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Зурвас илгээх товч
        document.getElementById('send-message-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter товчоор зурвас илгээх
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Санал өгөх товч
        document.getElementById('vote-btn').addEventListener('click', () => {
            this.submitVote();
        });

        // Дахин тоглох товч
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.gamePhase = 'players';
        this.showScreen('players-screen');
        this.displayPlayers();
        this.showPlayerRole();
        
        // 3 секундын дараа хэлэлцүүлгийн үе шилжүүлэх
        setTimeout(() => {
            this.startDiscussion();
        }, 3000);
    }

    showScreen(screenId) {
        // Бү дэлгэцийг нуух
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Шаардлагатай дэлгэцийг харуулах
        document.getElementById(screenId).classList.add('active');
    }

    displayPlayers() {
        const playersGrid = document.getElementById('players-grid');
        playersGrid.innerHTML = '';

        this.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-status">${player.alive ? 'Амьд' : 'Насбарсан'}</div>
            `;
            playersGrid.appendChild(playerCard);
        });
    }

    showPlayerRole() {
        const roleElement = document.getElementById('player-role');
        if (this.currentPlayer.role === 'imposter') {
            roleElement.textContent = '🔪 Imposter (Хулгайч)';
            roleElement.className = 'role-badge role-imposter';
        } else {
            roleElement.textContent = '👥 Crewmate (Багийн гишүүн)';
            roleElement.className = 'role-badge role-crewmate';
        }
    }

    startDiscussion() {
        this.gamePhase = 'discussion';
        this.showScreen('discussion-screen');
        this.setupVoting();
        this.addSystemMessage('🎮 Хэлэлцүүлгийн үе эхэллээ! Imposter-г олоорой!');
        
        // AI тоглогчдын зурвасууд
        this.generateAIMessages();
    }

    setupVoting() {
        const votingGrid = document.getElementById('voting-grid');
        votingGrid.innerHTML = '';

        this.players.forEach(player => {
            if (player.alive && player.id !== this.currentPlayer.id) {
                const voteOption = document.createElement('div');
                voteOption.className = 'vote-option';
                voteOption.dataset.playerId = player.id;
                voteOption.innerHTML = `
                    <div style="font-size: 2em;">${player.avatar}</div>
                    <div>${player.name}</div>
                `;
                
                voteOption.addEventListener('click', () => {
                    this.selectVote(player.id);
                });
                
                votingGrid.appendChild(voteOption);
            }
        });
    }

    selectVote(playerId) {
        // өмнөх сонголтыг цуцлах
        document.querySelectorAll('.vote-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Шинэ сонголтыг сонгох
        const selectedOption = document.querySelector(`[data-player-id="${playerId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedVote = playerId;
        }
    }

    submitVote() {
        if (this.selectedVote === null) {
            this.addSystemMessage('⚠️ Санал өгөх тоглогчоо сонгоно уу!');
            return;
        }

        // Хэрэглэгчийн саналыг хадгалах
        this.votes[this.currentPlayer.id] = this.selectedVote;
        
        // AI тоглогчдын саналууд
        this.generateAIVotes();
        
        // Үр дүнг шалгах
        this.checkVotingResult();
    }

    generateAIMessages() {
        // AI тоглогчид зурвас бичих
        const aiMessages = [
            { playerId: 1, text: 'Би анхааралтай харж байна. Эргэлзээгүй хүн байна.' },
            { playerId: 2, text: 'Сүүлийн үед хэн ч юу ч хэлэхгүй байна. Энэ эргэлзээтэй.' },
            { playerId: 3, text: 'Бид бүхэн нэгдэж шийдвэр гаргах хэрэгтэй.' },
            { playerId: 4, text: 'Би санал бодлоо тодорхойлох хэрэгтэй байна.' }
        ];

        aiMessages.forEach((msg, index) => {
            setTimeout(() => {
                if (this.players[msg.playerId].alive) {
                    this.addMessage(this.players[msg.playerId].name, msg.text);
                }
            }, (index + 1) * 2000);
        });
    }

    generateAIVotes() {
        // AI тоглогчид санал өгөх
        this.players.forEach(player => {
            if (player.alive && player.id !== this.currentPlayer.id) {
                // Санамсаргүй санал өгөх (Imposter-г илрүүлэх магадлал)
                const alivePlayers = this.players.filter(p => p.alive && p.id !== player.id);
                if (alivePlayers.length > 0) {
                    const randomPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                    this.votes[player.id] = randomPlayer.id;
                    randomPlayer.votes++;
                }
            }
        });
    }

    checkVotingResult() {
        // Саналын үр дүнг шалгах
        let maxVotes = 0;
        let votedOutPlayer = null;

        this.players.forEach(player => {
            if (player.votes > maxVotes) {
                maxVotes = player.votes;
                votedOutPlayer = player;
            }
        });

        if (votedOutPlayer) {
            this.addSystemMessage(`🗳️ ${votedOutPlayer.name} саналаар хасагдлаа!`);
            votedOutPlayer.alive = false;
            
            // Ялагчийг шалгах
            if (votedOutPlayer.role === 'imposter') {
                this.endGame(true);
            } else {
                // Imposter ялсан үү
                setTimeout(() => {
                    this.endGame(false);
                }, 2000);
            }
        }
    }

    endGame(crewmateWin) {
        this.gamePhase = 'result';
        this.showScreen('result-screen');
        
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const finalRoles = document.getElementById('final-roles');
        
        if (crewmateWin) {
            resultTitle.textContent = '🎉 Багийн гишүүд яллаа!';
            resultMessage.textContent = 'Imposter-г амжилттай илрүүллээ!';
        } else {
            resultTitle.textContent = '💀 Imposter яллаа!';
            resultMessage.textContent = 'Imposter бүх багийн гишүүдийг хөнөөлөө!';
        }
        
        // Бүх тоглогчийн дүрийг харуулах
        finalRoles.innerHTML = '';
        this.players.forEach(player => {
            const roleItem = document.createElement('div');
            roleItem.className = 'final-role-item';
            roleItem.innerHTML = `
                <span>${player.avatar} ${player.name}</span>
                <span class="role-badge ${player.role === 'imposter' ? 'role-imposter' : 'role-crewmate'}">
                    ${player.role === 'imposter' ? '🔪 Imposter' : '👥 Crewmate'}
                </span>
            `;
            finalRoles.appendChild(roleItem);
        });
    }

    restartGame() {
        // Тоглоомыг дахин эхлүүлэх
        this.players = [];
        this.currentPlayer = null;
        this.imposterIndex = -1;
        this.gamePhase = 'start';
        this.messages = [];
        this.votes = {};
        this.selectedVote = null;
        
        this.initializeGame();
        this.showScreen('start-screen');
        
        // Мессежийн цонхыг цэвэрлэх
        document.getElementById('messages').innerHTML = '';
    }

    addMessage(author, text, isOwn = false) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : ''}`;
        messageDiv.innerHTML = `
            <div class="message-author">${author}</div>
            <div class="message-text">${text}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addSystemMessage(text) {
        const messagesContainer = document.getElementById('messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.style.background = '#fef5e7';
        messageDiv.style.borderLeft = '4px solid #f39c12';
        messageDiv.innerHTML = `
            <div class="message-author">🤖 Систем</div>
            <div class="message-text">${text}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (message === '') return;
        
        this.addMessage(this.currentPlayer.name, message, true);
        input.value = '';
        
        // AI хариу өгөх
        setTimeout(() => {
            this.generateAIResponse(message);
        }, 1500);
    }

    generateAIResponse(userMessage) {
        // AI тоглогчдын хариу
        const responses = [
            'Тиймээ, би бас үүнийг анхаарч байна.',
            'Санал чинь зүгээр байна.',
            'Би өөрөө бодоод байна.',
            'Энэ чухал санал байна.',
            'Би таны саналтай санал нэгтгэлээ.'
        ];
        
        const aliveAIPlayers = this.players.filter(p => p.alive && p.id !== this.currentPlayer.id);
        if (aliveAIPlayers.length > 0) {
            const randomPlayer = aliveAIPlayers[Math.floor(Math.random() * aliveAIPlayers.length)];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage(randomPlayer.name, randomResponse);
        }
    }
}

// Тоглоомыг эхлүүлэх
document.addEventListener('DOMContentLoaded', () => {
    const game = new ImposterGame();
});
