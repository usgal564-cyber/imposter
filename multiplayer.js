// Монгол Imposter тоглоом - Multiplayer хувилбар
class MultiplayerImposterGame {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
        this.currentPlayer = null;
        this.gamePhase = 'lobby';
        this.selectedVote = null;
        
        this.initializeSocket();
        this.bindEvents();
    }

    initializeSocket() {
        // Socket.IO холболт
        this.socket = io();
        
        // Socket events
        this.socket.on('connect', () => {
            console.log('Серверт холбогдлоо');
        });

        this.socket.on('room-created', (data) => {
            this.currentRoom = data.room;
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`🏠 Өрөө үүсгэгдлээ! Код: ${data.roomId}`);
        });

        this.socket.on('room-joined', (data) => {
            this.currentRoom = data.room;
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`🎮 өрөөнд орлоо!`);
        });

        this.socket.on('player-joined', (data) => {
            this.currentRoom = data.room;
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`👋 ${data.player.name} тоглоомд нэгдлээ!`);
        });

        this.socket.on('player-left', (data) => {
            this.currentRoom = data.room;
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`👋 ${data.playerName} тоглоомоос гарлаа`);
        });

        this.socket.on('game-started', (data) => {
            this.currentPlayer.role = data.role;
            this.gamePhase = 'discussion';
            this.showScreen('discussion-screen');
            this.showPlayerRole(data.role);
            this.showDiscussionTopic(data.topic);
            this.displayPlayers(data.room);
            this.addSystemMessage(`🎮 Тоглоом эхэллээ! Таны дүр: ${data.role === 'imposter' ? '🔪 Imposter' : '👥 Crewmate'}`);
        });

        this.socket.on('chat-message', (data) => {
            this.addMessage(data.playerName, data.text, data.playerId === this.socket.id);
        });

        this.socket.on('voting-started', (data) => {
            this.gamePhase = 'voting';
            this.setupVoting(data.room);
            this.addSystemMessage('🗳️ Санал хураалт эхэллээ!');
        });

        this.socket.on('vote-cast', (data) => {
            this.addSystemMessage('Таны санал хүлээгдлээ!');
        });

        this.socket.on('game-ended', (data) => {
            this.gamePhase = 'result';
            this.showScreen('result-screen');
            this.showGameResult(data);
        });

        this.socket.on('game-restarted', (data) => {
            this.currentRoom = data;
            this.gamePhase = 'waiting';
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data);
            this.clearMessages();
            this.addSystemMessage('🔄 Тоглоом дахин эхэллээ!');
        });

        this.socket.on('error', (message) => {
            alert(`Алдаа: ${message}`);
        });
    }

    bindEvents() {
        // Өрөө үүсгэх
        document.getElementById('create-room-btn').addEventListener('click', () => {
            const playerName = document.getElementById('player-name-input').value.trim();
            if (!playerName) {
                alert('Нэрээ оруулна уу!');
                return;
            }
            this.socket.emit('create-room', playerName);
        });

        // Өрөөнд орох
        document.getElementById('join-room-btn').addEventListener('click', () => {
            const playerName = document.getElementById('player-name-input').value.trim();
            const roomCode = document.getElementById('room-code-input').value.trim();
            
            if (!playerName || !roomCode) {
                alert('Нэр болон өрөөний кодоо оруулна уу!');
                return;
            }
            
            this.socket.emit('join-room', { roomId: roomCode, playerName });
        });

        // Тоглоом эхлүүлэх
        document.getElementById('start-game-btn').addEventListener('click', () => {
            if (this.currentRoom && this.currentRoom.playerCount >= 3) {
                this.socket.emit('start-game');
            } else {
                alert('Тоглоом эхлүүлэхийн тулд хамгийн багадаа 3 тоглогч хэрэгтэй!');
            }
        });

        // Зурвас илгээх
        document.getElementById('send-message-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter товчоор зурвас илгээх
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Санал хураалт эхлүүлэх
        document.getElementById('start-voting-btn').addEventListener('click', () => {
            this.socket.emit('start-voting');
        });

        // Санал өгөх
        document.getElementById('vote-btn').addEventListener('click', () => {
            this.submitVote();
        });

        // Дахин тоглох
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.socket.emit('restart-game');
        });

        // Input талбарыг фокуслах
        document.getElementById('player-name-input').focus();
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (message === '') return;
        
        this.socket.emit('chat-message', message);
        input.value = '';
    }

    submitVote() {
        if (this.selectedVote === null) {
            this.addSystemMessage('⚠️ Санал өгөх тоглогчоо сонгоно уу!');
            return;
        }

        this.socket.emit('vote', this.selectedVote);
        this.selectedVote = null;
        
        // Voting товчийг идэвхгүй болгох
        document.getElementById('vote-btn').disabled = true;
        document.getElementById('vote-btn').textContent = 'Санал илгээгдлээ';
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    updateRoomInfo(room) {
        if (document.getElementById('current-room-code')) {
            document.getElementById('current-room-code').textContent = room.id;
            document.getElementById('current-players').textContent = room.playerCount;
        }
        
        if (document.getElementById('room-code-display')) {
            document.getElementById('room-code-display').textContent = room.id;
        }

        this.updatePlayersList(room.players);
    }

    updatePlayersList(players) {
        const playersList = document.getElementById('players-list');
        const waitingGrid = document.getElementById('waiting-players-grid');
        
        if (playersList) {
            playersList.innerHTML = '';
            players.forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'player-item';
                playerItem.innerHTML = `
                    <span class="avatar">${player.avatar}</span>
                    <span>${player.name}</span>
                `;
                playersList.appendChild(playerItem);
            });
        }

        if (waitingGrid) {
            waitingGrid.innerHTML = '';
            players.forEach(player => {
                const playerCard = document.createElement('div');
                playerCard.className = 'player-card';
                playerCard.innerHTML = `
                    <div class="player-avatar">${player.avatar}</div>
                    <div class="player-name">${player.name}</div>
                    <div class="player-status">${player.alive ? 'Амьд' : 'Насбарсан'}</div>
                `;
                waitingGrid.appendChild(playerCard);
            });
        }
    }

    displayPlayers(room) {
        const playersGrid = document.getElementById('players-grid');
        if (!playersGrid) return;

        playersGrid.innerHTML = '';
        room.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-name">${player.name}</div>
                <div class="player-status">${player.alive ? 'Амьд' : 'Насбарсан'}</div>
            `;
            playersGrid.appendChild(playerCard);
        });

        // Тоглогчдын тоог шинэчлэх
        const playerCount = document.getElementById('player-count');
        if (playerCount) {
            playerCount.textContent = room.playerCount;
        }
    }

    showPlayerRole(role) {
        const roleElement = document.getElementById('player-role');
        if (!roleElement) return;

        if (role === 'imposter') {
            roleElement.textContent = '🔪 Imposter (Хулгайч)';
            roleElement.className = 'role-badge role-imposter';
        } else {
            roleElement.textContent = '👥 Crewmate (Багийн гишүүн)';
            roleElement.className = 'role-badge role-crewmate';
        }
    }

    showDiscussionTopic(topic) {
        const topicElement = document.getElementById('discussion-topic');
        if (topicElement) {
            topicElement.textContent = topic;
        }
    }

    setupVoting(room) {
        const votingGrid = document.getElementById('voting-grid');
        const startVotingBtn = document.getElementById('start-voting-btn');
        const voteBtn = document.getElementById('vote-btn');
        
        if (!votingGrid) return;

        votingGrid.innerHTML = '';
        votingGrid.style.display = 'grid';
        
        if (startVotingBtn) {
            startVotingBtn.style.display = 'none';
        }
        
        if (voteBtn) {
            voteBtn.style.display = 'inline-block';
            voteBtn.disabled = false;
            voteBtn.textContent = 'Санал өгөх';
        }

        room.players.forEach(player => {
            if (player.alive && player.id !== this.socket.id) {
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
        document.querySelectorAll('.vote-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`[data-player-id="${playerId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedVote = playerId;
        }
    }

    showGameResult(data) {
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const finalRoles = document.getElementById('final-roles');
        
        if (resultTitle) {
            resultTitle.textContent = data.winner === 'crewmates' ? '🎉 Багийн гишүүд яллаа!' : '💀 Imposter яллаа!';
        }
        
        if (resultMessage) {
            resultMessage.textContent = data.message;
        }
        
        if (finalRoles && this.currentRoom) {
            finalRoles.innerHTML = '';
            this.currentRoom.players.forEach(player => {
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
    }

    addMessage(author, text, isOwn = false) {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;

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
        if (!messagesContainer) return;

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

    clearMessages() {
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }
}

// Тоглоомыг эхлүүлэх
document.addEventListener('DOMContentLoaded', () => {
    const game = new MultiplayerImposterGame();
});
