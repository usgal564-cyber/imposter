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
            this.isCreator = data.isCreator;
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`🏠 Өрөө үүсгэгдлээ! Код: ${data.roomId}`);
            
            // Хэрэв үүсгэгч бол сэдвүүдийг харуулах
            if (data.isCreator) {
                this.showTopicSelection(data.topics);
            }
        });

        this.socket.on('room-joined', (data) => {
            this.currentRoom = data.room;
            this.isCreator = data.isCreator;
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`🎮 өрөөнд орлоо!`);
            
            // Хэрэв сэдэв сонгогдсон бол харуулах
            if (data.selectedTopic) {
                this.showSelectedTopic(data.selectedTopic);
            }
            
            // Хүлээлгэний чатыг идэвхжүүлэх
            this.enableWaitingChat();
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

        // Асуултын үе эхэллээ
        this.socket.on('question-phase-started', (data) => {
            this.currentPlayer.role = data.role;
            this.gamePhase = 'question';
            this.showScreen('question-screen');
            this.showQuestion(data);
            this.addSystemMessage(`🎮 Асуултын тоглоом эхэллээ! Таны дүр: ${data.role === 'imposter' ? '🔪 Imposter' : '👥 Crewmate'}`);
        });

        // Хариултын үр дүн
        this.socket.on('answer-result', (data) => {
            if (data.correct) {
                this.addSystemMessage('✅ Зөв хариулт!');
            } else {
                this.addSystemMessage('❌ Буруу хариулт! Та энэ раундад хасагдах болно.');
            }
        });

        // Раунд дуусав
        this.socket.on('round-ended', (data) => {
            this.addSystemMessage(`📍 Раунд ${data.round} дуусав! ${data.eliminated} тоглогч хасагдлаа. Үлдсэн: ${data.remaining}`);
            
            if (data.isFinalRound) {
                this.addSystemMessage('🎯 Эцсийн таамаглалтын үе эхэллээ!');
            } else {
                this.addSystemMessage(`⏳ Дараагийн раунд түрүүлэгдлээ...`);
            }
        });

        // Дараагийн асуулт
        this.socket.on('next-question', (data) => {
            this.showQuestion(data);
            this.addSystemMessage(`❓ Раунд ${data.round}: Шинэ асуулт!`);
        });

        // Эцсийн таамаглалтын үе
        this.socket.on('final-guess-phase', (data) => {
            this.gamePhase = 'final_guess';
            this.showScreen('final-guess-screen');
            this.showFinalGuess(data);
            this.addSystemMessage('🎯 Үлдсэн тоглогчдоос хэн Imposter болохыг сонгоно уу!');
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

        // Хүлээлгэний үеийн чат
        this.socket.on('waiting-chat-message', (data) => {
            this.addWaitingMessage(data.playerName, data.text, data.playerId === this.socket.id);
        });

        // Сэдэв сонгогдсон
        this.socket.on('topic-selected', (data) => {
            this.currentRoom = data.room;
            this.showSelectedTopic(data.topic);
            this.addSystemMessage(`📝 Сэдэв сонгогдлоо: ${data.topic}`);
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
            console.log('Тоглоом эхлүүлэх товч дарлаа');
            console.log('Current room:', this.currentRoom);
            
            if (this.currentRoom) {
                console.log('Тоглогчдын тоо:', this.currentRoom.playerCount);
                console.log('Сонгосон сэдэв:', this.currentRoom.selectedTopic);
                
                if (this.currentRoom.playerCount < 3) {
                    alert('Тоглоом эхлүүлэхийн тулд хамгийн багадаа 3 тоглогч хэрэгтэй!');
                    return;
                }
                
                if (!this.currentRoom.selectedTopic) {
                    alert('Эхлэхийн тулд сэдэв сонгох шаардлагатай!');
                    return;
                }
                
                console.log('Сервер рүү start-game event илгээж байна');
                this.socket.emit('start-game');
            } else {
                alert('Та өрөөнд байхгүй байна!');
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

        // Хүлээлгэний үеийн чат
        document.getElementById('send-waiting-message-btn').addEventListener('click', () => {
            this.sendWaitingMessage();
        });

        // Enter товчоор хүлээлгэний чат илгээх
        document.getElementById('waiting-message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendWaitingMessage();
            }
        });

        // Сэдэв сонгох товч
        document.getElementById('select-topic-btn').addEventListener('click', () => {
            this.selectTopic();
        });

        // Сэдвийг өөрчлөх товч
        document.getElementById('change-topic-btn').addEventListener('click', () => {
            this.showTopicSelection(this.allTopics);
        });

        // Хариулт илгээх
        document.getElementById('submit-answer-btn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Enter товчоор хариулт илгээх
        document.getElementById('answer-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // Эцсийн санал өгөх
        document.getElementById('submit-final-vote-btn').addEventListener('click', () => {
            this.submitFinalVote();
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

    // Хүлээлгэний үеийн чат функцүүд
    sendWaitingMessage() {
        const input = document.getElementById('waiting-message-input');
        const message = input.value.trim();
        
        if (message === '') return;
        
        this.socket.emit('waiting-chat-message', message);
        input.value = '';
    }

    addWaitingMessage(author, text, isOwn = false) {
        const messagesContainer = document.getElementById('waiting-messages');
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

    enableWaitingChat() {
        // Хүлээлгэний чат идэвхжүүлэх
        const waitingInput = document.getElementById('waiting-message-input');
        const waitingSendBtn = document.getElementById('send-waiting-message-btn');
        
        if (waitingInput) waitingInput.disabled = false;
        if (waitingSendBtn) waitingSendBtn.disabled = false;
    }

    // Сэдэв сонголтын функцүүд
    showTopicSelection(topics) {
        this.allTopics = topics;
        const creatorControls = document.getElementById('creator-controls');
        const topicSelection = document.getElementById('topic-selection');
        const selectedTopic = document.getElementById('selected-topic');
        const topicsGrid = document.getElementById('topics-grid');
        
        if (!creatorControls || !topicSelection || !topicsGrid) return;
        
        // Зөвхөн үүсгэгчид харагдах
        if (this.isCreator) {
            creatorControls.style.display = 'block';
            topicSelection.style.display = 'block';
            selectedTopic.style.display = 'none';
            
            // Сэдвүүдийг харуулах
            topicsGrid.innerHTML = '';
            topics.forEach(topic => {
                const topicOption = document.createElement('div');
                topicOption.className = 'topic-option';
                topicOption.textContent = topic;
                topicOption.addEventListener('click', () => {
                    this.selectTopicOption(topic);
                });
                topicsGrid.appendChild(topicOption);
            });
        }
    }

    selectTopicOption(topic) {
        // Өмнөх сонголтыг цуцлах
        document.querySelectorAll('.topic-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Шинэ сонголт
        event.target.classList.add('selected');
        this.selectedTopic = topic;
        
        // Сонгох товчийг харуулах
        const selectBtn = document.getElementById('select-topic-btn');
        if (selectBtn) {
            selectBtn.style.display = 'inline-block';
        }
    }

    selectTopic() {
        if (this.selectedTopic) {
            this.socket.emit('select-topic', this.selectedTopic);
        }
    }

    showSelectedTopic(topic) {
        const topicSelection = document.getElementById('topic-selection');
        const selectedTopic = document.getElementById('selected-topic');
        const chosenTopicText = document.getElementById('chosen-topic-text');
        
        if (topicSelection && selectedTopic && chosenTopicText) {
            topicSelection.style.display = 'none';
            selectedTopic.style.display = 'block';
            chosenTopicText.textContent = topic;
        }
        
        // Бүх тоглогчид сэдвийг харуулах
        const topicDisplay = document.createElement('div');
        topicDisplay.className = 'topic-display';
        topicDisplay.style.background = '#e8f5e8';
        topicDisplay.style.border = '2px solid #27ae60';
        topicDisplay.style.margin = '20px 0';
        topicDisplay.style.padding = '15px';
        topicDisplay.style.borderRadius = '10px';
        topicDisplay.style.textAlign = 'center';
        topicDisplay.innerHTML = `
            <h4 style="color: #27ae60; margin-bottom: 10px;">📝 Тоглоомын сэдэв</h4>
            <p style="font-weight: bold; font-size: 1.1em;">${topic}</p>
        `;
        
        // Хүлээлгэний дэлгэцэд нэмэх
        const waitingContent = document.querySelector('.waiting-content');
        if (waitingContent) {
            // Өмнөх сэдвийг устгах
            const oldTopicDisplay = waitingContent.querySelector('.topic-display');
            if (oldTopicDisplay) {
                oldTopicDisplay.remove();
            }
            
            // Шинэ сэдвийг оруулах
            waitingContent.insertBefore(topicDisplay, waitingContent.querySelector('.waiting-chat-container'));
        }
    }

    // Асуулт харуулах
    showQuestion(data) {
        const questionText = document.getElementById('question-text');
        const currentRound = document.getElementById('current-round');
        const remainingPlayers = document.getElementById('remaining-players');
        const answerInput = document.getElementById('answer-input');
        const submitBtn = document.getElementById('submit-answer-btn');
        
        if (questionText) questionText.textContent = data.question;
        if (currentRound) currentRound.textContent = data.round;
        if (remainingPlayers) remainingPlayers.textContent = data.room.remainingPlayers;
        
        // Хариултын сонголтуудыг харуулах
        if (answerInput && data.answers) {
            // Хариултын input-г цэвэрлэх
            answerInput.value = '';
            answerInput.placeholder = 'Зөв хариулт сонгох эсвэл бичих...';
            answerInput.disabled = false;
        }
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Хариулах';
        }
        
        // Timer эхлүүлэх
        this.startTimer(30);
    }

    // Timer эхлүүлэх
    startTimer(seconds) {
        const timerBar = document.getElementById('timer-bar');
        const timerText = document.getElementById('timer-text');
        
        if (!timerBar || !timerText) return;
        
        let timeLeft = seconds;
        timerText.textContent = timeLeft;
        timerBar.style.width = '100%';
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            timerBar.style.width = `${(timeLeft / seconds) * 100}%`;
            
            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                timerText.textContent = '0';
                timerBar.style.width = '0%';
                
                // Цаг дуусвал автомат хариулах
                this.submitAnswer();
            }
        }, 1000);
    }

    // Хариулт илгээх
    submitAnswer() {
        const answerInput = document.getElementById('answer-input');
        const submitBtn = document.getElementById('submit-answer-btn');
        
        if (!answerInput || !answerInput.value.trim()) {
            alert('Хариултаа оруулна уу!');
            return;
        }
        
        const answer = answerInput.value.trim();
        
        // Input болон товчийг идэвхгүй болгох
        answerInput.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Хариулт илгээгдлээ';
        
        // Timer-г зогсоох
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Сервер рүү хариулт илгээх
        this.socket.emit('submit-answer', answer);
    }

    // Эцсийн таамаглалт харуулах
    showFinalGuess(data) {
        const remainingGrid = document.getElementById('remaining-players-grid');
        const finalVotingGrid = document.getElementById('final-voting-grid');
        
        if (!remainingGrid || !finalVotingGrid) return;
        
        remainingGrid.innerHTML = '';
        finalVotingGrid.innerHTML = '';
        
        data.remainingPlayers.forEach(player => {
            // Үлдсэн тоглогчдын карт
            const playerCard = document.createElement('div');
            playerCard.className = 'remaining-player-card';
            playerCard.innerHTML = `
                <div style="font-size:3em;">${player.avatar}</div>
                <div>${player.name}</div>
            `;
            playerCard.addEventListener('click', () => {
                this.selectFinalPlayer(player.id);
            });
            remainingGrid.appendChild(playerCard);
            
            // Санал хураалтын сонголт
            const voteOption = document.createElement('div');
            voteOption.className = 'final-vote-option';
            voteOption.dataset.playerId = player.id;
            voteOption.innerHTML = `
                <div style="font-size:2em;">${player.avatar}</div>
                <div>${player.name}</div>
            `;
            voteOption.addEventListener('click', () => {
                this.selectFinalPlayer(player.id);
            });
            finalVotingGrid.appendChild(voteOption);
        });
    }

    // Эцсийн тоглогч сонгох
    selectFinalPlayer(playerId) {
        document.querySelectorAll('.final-vote-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        const selectedOption = document.querySelector(`[data-player-id="${playerId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedFinalVote = playerId;
        }
    }

    // Эцсийн санал илгээх
    submitFinalVote() {
        if (!this.selectedFinalVote) {
            alert('Imposter-г сонгоно уу!');
            return;
        }
        
        const submitBtn = document.getElementById('submit-final-vote-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Санал илгээгдлээ...';
        }
        
        this.socket.emit('submit-final-vote', this.selectedFinalVote);
    }
}

// Тоглоомыг эхлүүлэх
document.addEventListener('DOMContentLoaded', () => {
    const game = new MultiplayerImposterGame();
});
