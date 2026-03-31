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
            console.log('room-created event хүлээгдлээ:', data);
            this.currentRoom = data.room;
            this.isCreator = data.isCreator;
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`🏠 Өрөө үүсгэгдлээ! Код: ${data.roomId}`);
            
            // Өрөөний кодыг харуулах
            const roomCodeDisplay = document.getElementById('room-code-display');
            if (roomCodeDisplay) {
                roomCodeDisplay.textContent = data.roomId;
            }
            
            // Хэрэв үүсгэгч бол сэдвүүдийг харуулах
            if (data.isCreator) {
                console.log('Үүсгэгч тул сэдвүүдийг харуулж байна:', { 
                    topics: data.topics, 
                    categories: data.categories 
                });
                this.showTopicSelection(data.topics, data.categories);
            } else {
                console.log('Үүсгэгч биш тул сэдэв харуулахгүй');
            }
        });

        this.socket.on('room-joined', (data) => {
            console.log('room-joined event хүлээгдлээ:', data);
            this.currentRoom = data.room;
            this.isCreator = data.isCreator;
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.addSystemMessage(`🎮 өрөөнд орлоо!`);
            
            // Өрөөний кодыг харуулах
            const roomCodeDisplay = document.getElementById('room-code-display');
            if (roomCodeDisplay) {
                roomCodeDisplay.textContent = data.room.id;
            }
            
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
            this.addSystemMessage(`👋 ${data.player.name} нэгдлээ!`);
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

        // Санамсаргүй сэдэв сонгогдсон
        this.socket.on('random-topic-selected', (data) => {
            this.currentRoom = data.room;
            this.showSelectedTopic(data.topic, data.category);
            this.addSystemMessage(`🎲 Санамсаргүй сэдэв сонгогдлоо: ${data.topic} (${data.category})`);
        });

        // Тоглоом дуусгагдлаа
        this.socket.on('game-ended-by-creator', (data) => {
            this.currentRoom = data.room;
            this.gamePhase = 'waiting';
            this.showScreen('waiting-screen');
            this.updateRoomInfo(data.room);
            this.clearMessages();
            this.addSystemMessage(data.message);
            this.showTopicSelection(this.allTopics, this.allCategories);
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
            
            console.log('Өрөөнд орох оролдлого:', { playerName, roomCode });
            
            if (!playerName || !roomCode) {
                alert('Нэр болон өрөөний кодоо оруулна уу!');
                return;
            }
            
            console.log('Сервер рүү join-room event илгээж байна');
            this.socket.emit('join-room', { roomId: roomCode, playerName });
        });

        // Тоглоом эхлүүлэх
        document.getElementById('start-game-btn').addEventListener('click', () => {
            console.log('Тоглоом эхлүүлэх товч дарлаа');
            console.log('Current room:', this.currentRoom);
            console.log('Сонгосон сэдэв:', this.currentRoom?.selectedTopic);
            
            if (this.currentRoom) {
                console.log('Тоглогчдын тоо:', this.currentRoom.playerCount);
                
                if (this.currentRoom.playerCount < 3) {
                    alert('Тоглоом эхлүүлэхийн тулд хамгийн багадаа 3 тоглогч хэрэгтэй!');
                    return;
                }
                
                if (!this.currentRoom.selectedTopic) {
                    alert('Тоглоом эхлүүлэхийн тулд сэдэв сонгох шаардлагатай!');
                    return;
                }
                
                console.log('Тоглоом эхлүүлэх боломжтой, сервер рүү илгээж байна');
                this.socket.emit('start-game');
            } else {
                console.log('Current room байхгүй байна');
                alert('Өрөөнд ороогүй байна!');
            }
        });

        // Сэдэв сонгох товч
        document.getElementById('select-topic-btn').addEventListener('click', () => {
            this.selectTopic();
        });

        // Сэдвийг өөрчлөх товч
        document.getElementById('change-topic-btn').addEventListener('click', () => {
            this.showTopicSelection(this.allTopics, this.allCategories);
        });

        // Өрөөний кодыг хуулбарлах товч
        document.getElementById('copy-room-code-btn').addEventListener('click', () => {
            this.copyRoomCode();
        });

        // Санамсаргүй сэдэв сонгох товч
        document.getElementById('random-topic-btn').addEventListener('click', () => {
            this.selectRandomTopic();
        });

        // Тоглоом дуусгах товч
        document.getElementById('end-game-btn').addEventListener('click', () => {
            if (confirm('Та тоглоомыг дуусгахдаа итгэлтэй байна уу?')) {
                this.socket.emit('end-game');
            }
        });
    }

    // Дэлгэц солих
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    // Өрөөний мэдээлэл шинэчлэх
    updateRoomInfo(room) {
        const roomCode = document.getElementById('current-room-code');
        const playerCount = document.getElementById('current-players');
        const playersGrid = document.getElementById('waiting-players-grid');
        const startGameBtn = document.getElementById('start-game-btn');
        const endGameBtn = document.getElementById('end-game-btn');
        
        if (roomCode) roomCode.textContent = room.id;
        if (playerCount) playerCount.textContent = `${room.playerCount}/5`;
        
        if (playersGrid) {
            playersGrid.innerHTML = '';
            room.players.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-item';
                
                // Өөрийн дүрийн өнгө
                if (player.id === this.socket.id) {
                    if (player.role === 'imposter') {
                        playerDiv.classList.add('player-self-imposter');
                    } else {
                        playerDiv.classList.add('player-self-crewmate');
                    }
                } else {
                    playerDiv.classList.add('player-crewmate');
                }
                
                playerDiv.innerHTML = `
                    <span class="player-avatar">${player.avatar}</span>
                    <span>${player.name}</span>
                    ${player.isCreator ? '👑' : ''}
                    <div class="role-indicator ${player.id === this.socket.id ? player.role : 'crewmate'}"></div>
                `;
                playersGrid.appendChild(playerDiv);
            });
        }
        
        // Товчнуудыг харуулах/нуух
        if (this.isCreator) {
            if (startGameBtn) startGameBtn.style.display = 'inline-block';
            if (endGameBtn) endGameBtn.style.display = 'inline-block';
        } else {
            if (startGameBtn) startGameBtn.style.display = 'none';
            if (endGameBtn) endGameBtn.style.display = 'none';
        }
    }

    // Сэдэв сонголтын функцүүд
    showTopicSelection(topics, categories) {
        console.log('showTopicSelection дуудагдлаа:', { topics, categories });
        
        this.allTopics = topics || [];
        this.allCategories = categories || {};
        
        const creatorControls = document.getElementById('creator-controls');
        const topicSelection = document.getElementById('topic-selection');
        const selectedTopic = document.getElementById('selected-topic');
        const topicsGrid = document.getElementById('topics-grid');
        
        console.log('DOM элементүүд:', { 
            creatorControls: !!creatorControls, 
            topicSelection: !!topicSelection, 
            selectedTopic: !!selectedTopic, 
            topicsGrid: !!topicsGrid 
        });
        
        if (!creatorControls || !topicSelection || !topicsGrid) {
            console.error('DOM элемент олдсонгүй!');
            return;
        }
        
        // Зөвхөн үүсгэгчид харагдах
        if (this.isCreator) {
            creatorControls.style.display = 'block';
            topicSelection.style.display = 'block';
            selectedTopic.style.display = 'none';
            
            // Ангиллууд болон сэдвүүдийг харуулах
            topicsGrid.innerHTML = '';
            
            // Санамсаргүй сэдэв товч
            const randomBtn = document.createElement('button');
            randomBtn.id = 'random-topic-btn';
            randomBtn.className = 'btn-secondary';
            randomBtn.textContent = '🎲 Санамсаргүй сэдэв сонгох';
            randomBtn.style.marginBottom = '20px';
            randomBtn.style.width = '100%';
            topicsGrid.appendChild(randomBtn);
            
            // Ангиллуудыг харуулах
            if (this.allCategories && Object.keys(this.allCategories).length > 0) {
                Object.entries(this.allCategories).forEach(([categoryKey, categoryTopics]) => {
                    const categorySection = document.createElement('div');
                    categorySection.className = 'category-section';
                    categorySection.innerHTML = `
                        <h4>📁 ${this.getCategoryName(categoryKey)}</h4>
                        <div class="category-topics"></div>
                    `;
                    
                    const categoryTopicsDiv = categorySection.querySelector('.category-topics');
                    categoryTopics.forEach(topic => {
                        const topicOption = document.createElement('div');
                        topicOption.className = 'topic-option';
                        topicOption.textContent = topic;
                        topicOption.addEventListener('click', (e) => {
                            this.selectTopicOption(topic, e.target);
                        });
                        categoryTopicsDiv.appendChild(topicOption);
                    });
                    
                    topicsGrid.appendChild(categorySection);
                });
            } else if (this.allTopics && this.allTopics.length > 0) {
                // Хуучин сэдвүүдийг харуулах
                this.allTopics.forEach(topic => {
                    const topicOption = document.createElement('div');
                    topicOption.className = 'topic-option';
                    topicOption.textContent = topic;
                    topicOption.addEventListener('click', (e) => {
                        this.selectTopicOption(topic, e.target);
                    });
                    topicsGrid.appendChild(topicOption);
                });
            } else {
                topicsGrid.innerHTML = '<p>Сэдэв олдсонгүй!</p>';
            }
        }
    }

    getCategoryName(key) {
        const names = {
            clothing: '👕 Хувцас',
            brands: '🏷️ Брэндүүд',
            movies: '🎬 Кинонууд',
            music: '🎵 Хөгжим',
            food: '🍽 Хоол',
            sports: '⚽ Спорт',
            technology: '💻 Технологи',
            animals: '🐾 Амьтад'
        };
        return names[key] || key;
    }

    selectRandomTopic() {
        this.socket.emit('select-random-topic');
    }

    selectTopicOption(topic, element) {
        console.log('selectTopicOption дуудагдлаа:', topic);
        
        // Өмнөх сонголтыг цуцлах
        document.querySelectorAll('.topic-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Шинэ сонголт
        if (element) {
            element.classList.add('selected');
        }
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

    showSelectedTopic(topic, category) {
        console.log('showSelectedTopic дуудагдлаа:', { topic, category });
        
        const topicSelection = document.getElementById('topic-selection');
        const selectedTopic = document.getElementById('selected-topic');
        const chosenTopicText = document.getElementById('chosen-topic-text');
        
        if (topicSelection && selectedTopic && chosenTopicText) {
            topicSelection.style.display = 'none';
            selectedTopic.style.display = 'block';
            chosenTopicText.textContent = topic;
            
            // Current room-д сонгосон сэдвийг хадгалах
            if (this.currentRoom) {
                this.currentRoom.selectedTopic = topic;
            }
            
            console.log('Сэдэв сонгогдлоо, currentRoom:', this.currentRoom);
        }
    }

    // Чат функцийн
    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (message) {
            this.socket.emit('chat-message', message);
            input.value = '';
        }
    }

    sendWaitingMessage() {
        const input = document.getElementById('waiting-message-input');
        const message = input.value.trim();
        
        if (message) {
            this.socket.emit('waiting-chat-message', message);
            input.value = '';
        }
    }

    addMessage(playerName, text, isOwn = false) {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : ''}`;
        messageDiv.innerHTML = `
            <span class="player-name">${playerName}:</span>
            <span class="message-text">${text}</span>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addWaitingMessage(playerName, text, isOwn = false) {
        const messagesContainer = document.getElementById('waiting-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : ''}`;
        messageDiv.innerHTML = `
            <span class="player-name">${playerName}:</span>
            <span class="message-text">${text}</span>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addSystemMessage(text) {
        // Хүлээлгэний чат руу систем мессеж
        const waitingMessagesContainer = document.getElementById('waiting-messages');
        if (waitingMessagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message system';
            messageDiv.innerHTML = `<span class="system-text">${text}</span>`;
            waitingMessagesContainer.appendChild(messageDiv);
            waitingMessagesContainer.scrollTop = waitingMessagesContainer.scrollHeight;
        }

        // Ярилцлагын чат руу систем мессеж
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message system';
            messageDiv.innerHTML = `<span class="system-text">${text}</span>`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    clearMessages() {
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    enableWaitingChat() {
        // Хүлээлгэний чат идэвхжүүлэх
        const waitingInput = document.getElementById('waiting-message-input');
        const waitingSendBtn = document.getElementById('send-waiting-message-btn');
        
        if (waitingInput) waitingInput.disabled = false;
        if (waitingSendBtn) waitingSendBtn.disabled = false;
    }

    // Өрөөний кодыг хуулбарлах функц
    copyRoomCode() {
        const roomCodeElement = document.getElementById('room-code-display');
        const copyBtn = document.getElementById('copy-room-code-btn');
        
        if (!roomCodeElement || !copyBtn) return;
        
        const roomCode = roomCodeElement.textContent;
        
        // Clipboard руу хуулбарлах
        navigator.clipboard.writeText(roomCode).then(() => {
            // Товчны бичиглэл өөрчлөх
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Хуулбарлагдлаа!';
            copyBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            
            // 3 секундын дараа эхний бичиглэлд буцах
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 3000);
        }).catch(err => {
            console.error('Хуулбарлахад алдаа гарлаа:', err);
            alert('Кодыг хуулбарлахад алдаа гарлаа. Гартаа оруулж хуулбарлана уу!');
        });
    }
}

// Тоглоомыг эхлүүлэх
document.addEventListener('DOMContentLoaded', () => {
    const game = new MultiplayerImposterGame();
});
