/* Монгол Imposter тоглоомны CSS */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
    direction: ltr;
}

.game-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

header {
    text-align: center;
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

header h1 {
    font-size: 2.5em;
    color: #764ba2;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

header p {
    font-size: 1.2em;
    color: #666;
}

main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.screen {
    display: none;
    width: 100%;
    max-width: 800px;
    background: rgba(255, 255, 255, 0.95);
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
}

.screen.active {
    display: block;
    animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1em;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(118, 75, 162, 0.3);
    margin: 10px;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(118, 75, 162, 0.4);
}

.btn-secondary {
    background: #4a5568;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1em;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin: 5px;
}

.btn-secondary:hover {
    background: #2d3748;
    transform: translateY(-1px);
}

.start-content {
    text-align: center;
}

.start-content h2 {
    color: #764ba2;
    margin-bottom: 20px;
    font-size: 2em;
}

.start-content p {
    font-size: 1.2em;
    margin-bottom: 30px;
    color: #666;
}

.game-rules {
    margin-top: 40px;
    text-align: left;
    background: #f7fafc;
    padding: 20px;
    border-radius: 10px;
    border-left: 4px solid #764ba2;
}

.game-rules h3 {
    color: #764ba2;
    margin-bottom: 15px;
}

.game-rules ul {
    list-style: none;
    padding-left: 0;
}

.game-rules li {
    padding: 8px 0;
    padding-left: 25px;
    position: relative;
}

.game-rules li:before {
    content: "▶";
    position: absolute;
    left: 0;
    color: #764ba2;
}

.players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.player-card {
    background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    cursor: pointer;
}

.player-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: #764ba2;
}

.player-card.selected {
    border-color: #e53e3e;
    background: linear-gradient(135deg, #fed7d7 0%, #fc8181 100%);
}

.player-avatar {
    font-size: 3em;
    margin-bottom: 10px;
}

.player-name {
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 5px;
}

.player-status {
    font-size: 0.9em;
    color: #666;
}

.role-badge {
    display: inline-block;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    margin: 5px;
}

.role-imposter {
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    color: white;
}

.role-crewmate {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
}

.game-info {
    background: #f7fafc;
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
}

.chat-container {
    background: #f7fafc;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
}

.messages {
    height: 300px;
    overflow-y: auto;
    background: white;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e2e8f0;
}

.message {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 10px;
    background: #edf2f7;
}

.message.own {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin-left: 50px;
}

.message-author {
    font-weight: bold;
    margin-bottom: 5px;
}

.message-text {
    line-height: 1.4;
}

.chat-input {
    display: flex;
    gap: 10px;
}

.chat-input input {
    flex: 1;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    font-size: 1em;
    transition: border-color 0.3s ease;
}

.chat-input input:focus {
    outline: none;
    border-color: #764ba2;
}

.voting-section {
    background: #f7fafc;
    padding: 20px;
    border-radius: 10px;
}

.voting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.vote-option {
    background: white;
    border: 2px solid #e2e8f0;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.vote-option:hover {
    border-color: #764ba2;
    transform: translateY(-2px);
}

.vote-option.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #764ba2;
}

.result-content {
    text-align: center;
}

.result-content h2 {
    font-size: 2.5em;
    margin-bottom: 20px;
}

.result-content p {
    font-size: 1.3em;
    margin-bottom: 30px;
    color: #666;
}

.final-roles {
    background: #f7fafc;
    padding: 20px;
    border-radius: 10px;
    margin: 30px 0;
}

.final-role-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #764ba2;
}

footer {
    text-align: center;
    margin-top: 30px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    color: #666;
}

.btn-warning {
    background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1em;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(237, 137, 54, 0.3);
    margin: 10px;
}

.btn-warning:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(237, 137, 54, 0.4);
}

.lobby-content {
    text-align: center;
}

.lobby-content h2 {
    color: #764ba2;
    margin-bottom: 30px;
    font-size: 2em;
}

.name-input {
    margin-bottom: 30px;
}

.name-input input {
    width: 100%;
    max-width: 300px;
    padding: 15px;
    font-size: 1.2em;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    text-align: center;
    transition: border-color 0.3s ease;
}

.name-input input:focus {
    outline: none;
    border-color: #764ba2;
}

.room-actions {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
}

.join-room {
    display: flex;
    gap: 10px;
    align-items: center;
}

.join-room input {
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    font-size: 1em;
    text-align: center;
    width: 150px;
    transition: border-color 0.3s ease;
}

.join-room input:focus {
    outline: none;
    border-color: #764ba2;
}

.room-info {
    background: #f7fafc;
    padding: 25px;
    border-radius: 15px;
    margin-top: 30px;
    border: 2px solid #e2e8f0;
}

.room-info h3 {
    color: #764ba2;
    margin-bottom: 15px;
}

.room-info p {
    margin: 10px 0;
    font-size: 1.1em;
}

.players-list {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.player-item {
    background: white;
    padding: 12px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-left: 4px solid #764ba2;
}

.player-item .avatar {
    font-size: 1.5em;
}

.waiting-content {
    text-align: center;
}

.waiting-content h2 {
    color: #764ba2;
    margin-bottom: 20px;
    font-size: 2em;
}

.room-code-display {
    background: #f7fafc;
    padding: 25px;
    border-radius: 15px;
    margin-top: 30px;
}

.room-code-display h3 {
    color: #764ba2;
    margin-bottom: 15px;
}

.code-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 2em;
    font-weight: bold;
    padding: 20px;
    border-radius: 15px;
    margin: 15px 0;
    letter-spacing: 5px;
    text-transform: uppercase;
    box-shadow: 0 10px 25px rgba(118, 75, 162, 0.3);
}

.topic-display {
    background: #fef5e7;
    border: 2px solid #f39c12;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 25px;
    text-align: center;
}

.topic-display h3 {
    color: #f39c12;
    margin-bottom: 10px;
}

.topic-display p {
    font-size: 1.2em;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
}

.waiting-chat-container {
    background: #f7fafc;
    border: 2px solid #e2e8f0;
    border-radius: 15px;
    padding: 20px;
    margin: 25px 0;
}

.waiting-chat-container h3 {
    color: #764ba2;
    margin-bottom: 15px;
    text-align: center;
}

.creator-controls {
    background: linear-gradient(135deg, #fef5e7 0%, #fdebd0 100%);
    border: 2px solid #f39c12;
    border-radius: 15px;
    padding: 25px;
    margin: 25px 0;
}

.creator-controls h3 {
    color: #f39c12;
    margin-bottom: 20px;
    text-align: center;
}

.topic-selection p {
    text-align: center;
    margin-bottom: 20px;
    font-weight: bold;
    color: #333;
}

.topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    background: white;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.topic-option {
    padding: 12px 20px;
    margin: 5px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9em;
}

.topic-option:hover {
    background: rgba(103, 126, 234, 0.1);
    border-color: #667eea;
    transform: translateY(-2px);
}

.topic-option.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #764ba2;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

.selected-topic {
    background: white;
    border: 2px solid #27ae60;
    border-radius: 10px;
    padding: 15px;
    margin: 15px 0;
    text-align: center;
}

.selected-topic p {
    margin: 0 0 10px 0;
    color: #27ae60;
    font-size: 1.1em;
}

.selected-topic strong {
    color: #27ae60;
    font-size: 1.2em;
}

/* Хүлээлгэний чат загвар */
#waiting-messages {
    height: 200px;
    overflow-y: auto;
    background: white;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e2e8f0;
}

/* Topic selection scroll bar styling */
.topics-grid::-webkit-scrollbar {
    width: 8px;
}

.topics-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.topics-grid::-webkit-scrollbar-thumb {
    background: #f39c12;
    border-radius: 10px;
}

.topics-grid::-webkit-scrollbar-thumb:hover {
    background: #e67e22;
}

/* Асуулт хариултын дэлгэц */
.question-content {
    text-align: center;
}

.question-content h2 {
    color: #764ba2;
    margin-bottom: 20px;
    font-size: 2em;
}

.round-info {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 30px;
    background: #f7fafc;
    padding: 15px;
    border-radius: 10px;
    border: 2px solid #e2e8f0;
}

.round-info p {
    font-weight: bold;
    color: #333;
}

.question-container {
    margin-bottom: 30px;
}

.question-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 10px 25px rgba(118, 75, 162, 0.3);
}

.question-box h3 {
    font-size: 1.4em;
    margin: 0;
    line-height: 1.4;
}

.timer-container {
    background: #f7fafc;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 15px;
    position: relative;
    height: 40px;
}

.timer-bar {
    height: 100%;
    background: linear-gradient(90deg, #48bb78 0%, #f6ad55 50%, #e53e3e 100%);
    border-radius: 8px;
    width: 100%;
    transition: width 1s linear;
}

.timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: bold;
    font-size: 1.2em;
    color: #333;
}

.answer-input {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 30px;
}

.answer-input input {
    flex: 1;
    max-width: 400px;
    padding: 15px;
    font-size: 1.2em;
    border: 2px solid #e2e8f0;
    border-radius: 25px;
    text-align: center;
    transition: border-color 0.3s ease;
}

.answer-input input:focus {
    outline: none;
    border-color: #764ba2;
}

.players-status {
    background: #f7fafc;
    border: 2px solid #e2e8f0;
    border-radius: 15px;
    padding: 20px;
}

.player-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #764ba2;
}

.player-status-item.eliminated {
    opacity: 0.5;
    border-left-color: #e53e3e;
    text-decoration: line-through;
}

/* Эцсийн таамаглалтын дэлгэц */
.final-guess-content {
    text-align: center;
}

.final-guess-content h2 {
    color: #764ba2;
    margin-bottom: 20px;
    font-size: 2em;
}

.final-guess-content > p {
    font-size: 1.2em;
    margin-bottom: 30px;
    color: #666;
}

.remaining-players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.remaining-player-card {
    background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    cursor: pointer;
}

.remaining-player-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border-color: #764ba2;
}

.remaining-player-card.selected {
    border-color: #e53e3e;
    background: linear-gradient(135deg, #fed7d7 0%, #fc8181 100%);
}

.final-voting {
    background: #f7fafc;
    border: 2px solid #e2e8f0;
    border-radius: 15px;
    padding: 25px;
}

.final-voting h3 {
    color: #764ba2;
    margin-bottom: 20px;
    font-size: 1.3em;
}

.final-voting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.final-vote-option {
    background: white;
    border: 2px solid #e2e8f0;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.final-vote-option:hover {
    border-color: #764ba2;
    transform: translateY(-2px);
}

.final-vote-option.selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #764ba2;
}

.btn-danger {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
}

.btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

/* Өрөөний кодын хайрцаг */
.code-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 1.5em;
    font-weight: bold;
    padding: 20px;
    border-radius: 10px;
    letter-spacing: 3px;
    text-align: center;
    margin: 10px 0;
    box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
    position: relative;
    overflow: hidden;
}

.code-box::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
    border-radius: 10px;
    z-index: -1;
    opacity: 0.7;
    animation: borderAnimation 3s linear infinite;
}

@keyframes borderAnimation {
    0% { opacity: 0.7; }
    50% { opacity: 0.3; }
    100% { opacity: 0.7; }
}

/* Хуулбарлах товч */
#copy-room-code-btn {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 20px;
    font-size: 0.9em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 3px 10px rgba(243, 156, 18, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
}

#copy-room-code-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(243, 156, 18, 0.4);
}

#copy-room-code-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(243, 156, 18, 0.3);
}

/* Хуулбарлагдсан үед */
.copy-success {
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%) !important;
    animation: copySuccess 0.5s ease;
}

@keyframes copySuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

/* Тоглогчдын өнгөний заалтууд */
.player-imposter {
    border: 3px solid #e74c3c !important;
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
    box-shadow: 0 0 20px rgba(231, 76, 60, 0.5) !important;
}

.player-crewmate {
    border: 3px solid #27ae60 !important;
    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%) !important;
    box-shadow: 0 0 20px rgba(39, 174, 96, 0.3) !important;
}

.player-self-imposter {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
    color: white !important;
}

.player-self-crewmate {
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%) !important;
    color: white !important;
}

/* Ангиллуудын загвар */
.category-section {
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    padding: 15px;
    border: 2px solid #e2e8f0;
}

.category-section h4 {
    color: #764ba2;
    margin-bottom: 10px;
    font-size: 1.1em;
    border-bottom: 2px solid #764ba2;
    padding-bottom: 5px;
}

.category-topics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
}

/* Icon загварууд */
.topic-icon {
    font-size: 1.5em;
    margin-right: 10px;
}

.player-avatar {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.role-indicator {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.role-indicator.imposter {
    background: #e74c3c;
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.8);
}

.role-indicator.crewmate {
    background: #27ae60;
    box-shadow: 0 0 10px rgba(39, 174, 96, 0.6);
}

/* Анимаци эффектүүд */
@keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
    100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
}

@keyframes pulse-green {
    0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(39, 174, 96, 0); }
    100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
}

.player-imposter {
    animation: pulse-red 2s infinite;
}

.player-crewmate {
    animation: pulse-green 2s infinite;
}

/* Хариултын өнгө */
.answer-correct {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%) !important;
    border-color: #27ae60 !important;
}

.answer-incorrect {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%) !important;
    border-color: #e74c3c !important;
}

/* Тоглоомын статус */
.game-status-waiting {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border: 2px solid #f39c12;
}

.game-status-playing {
    background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
    border: 2px solid #17a2b8;
}

.game-status-ended {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    border: 2px solid #dc3545;
}

@media (max-width: 768px) {
    .game-container {
        padding: 10px;
    }
    
    .screen {
        padding: 20px;
    }
    
    header h1 {
        font-size: 2em;
    }
    }
    
    .players-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }
    
    .voting-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
    
    .message.own {
        margin-left: 20px;
    }
    
    .join-room {
        flex-direction: column;
    }
    
    .room-actions {
        gap: 15px;
    }
    
    .code-box {
        font-size: 1.5em;
        letter-spacing: 3px;
    }
    
    .topics-grid {
        grid-template-columns: 1fr;
        max-height: 250px;
    }
    
    .waiting-chat-container {
        margin: 15px 0;
        padding: 15px;
    }
    
    .creator-controls {
        margin: 15px 0;
        padding: 20px;
    }
    
    .round-info {
        flex-direction: column;
        gap: 10px;
    }
    
    .answer-input {
        flex-direction: column;
        align-items: center;
    }
    
    .answer-input input {
        max-width: 100%;
    }
    
    .remaining-players-grid {
        grid-template-columns: 1fr;
    }
    
    .final-voting-grid {
        grid-template-columns: 1fr;
    }


/* Ярилцлагын хэсэг */
.discussion-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.topic-display {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    margin-bottom: 20px;
}

.topic-display h3 {
    margin: 0;
    font-size: 1.3em;
}

.players-section {
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.player-card {
    background: #f8f9fa;
    border: 3px solid #e9ecef;
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.player-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.player-avatar {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.player-name {
    font-weight: bold;
    margin-bottom: 5px;
}

.role-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin: 8px auto;
}

.role-indicator.imposter {
    background: #e74c3c;
    box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

.role-indicator.crewmate {
    background: #27ae60;
    box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
}

.player-imposter {
    border-color: #e74c3c;
    background: #fdf2f2;
}

.player-crewmate {
    border-color: #27ae60;
    background: #f0f9f4;
}

.player-self-imposter {
    border-color: #e74c3c;
    background: #fdf2f2;
    box-shadow: 0 0 20px rgba(231, 76, 60, 0.3);
}

.player-self-crewmate {
    border-color: #27ae60;
    background: #f0f9f4;
    box-shadow: 0 0 20px rgba(39, 174, 96, 0.3);
}

.chat-section {
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    height: 500px;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.messages {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 15px;
}

.message {
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    max-width: 80%;
}

.message.own {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    margin-left: auto;
    text-align: right;
}

.message.system {
    background: #f39c12;
    color: white;
    text-align: center;
    margin: 10px auto;
    font-style: italic;
}

.message .player-name {
    font-weight: bold;
    margin-right: 5px;
}

.chat-input {
    display: flex;
    gap: 10px;
}

.chat-input input {
    flex: 1;
    padding: 10px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
}

.role-info {
    grid-column: 1 / -1;
    background: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    text-align: center;
}

.role-badge {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: bold;
    margin-top: 10px;
}

.role-badge.role-imposter {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
}

.role-badge.role-crewmate {
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    color: white;
}

/* Санал өгөх хэсэг */
.voting-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
}

.voting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
}

.vote-card {
    background: white;
    border: 3px solid #e9ecef;
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.vote-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.vote-card.selected {
    border-color: #e74c3c;
    background: #fdf2f2;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(231, 76, 60, 0.3);
}

.vote-card .player-avatar {
    font-size: 3em;
    margin-bottom: 10px;
}

.vote-card .player-name {
    font-weight: bold;
    font-size: 1.1em;
}

