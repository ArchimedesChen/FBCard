// script.js (新增在文件開頭的變數區塊)
// ... 其他既有變数 ...

let timerInterval; // 儲存計時器 ID，用於啟動和停止
let totalSeconds = 0; // 追蹤總秒數

// 【刪除或註釋掉】這行有問題的初始化：
// let timerElement = document.getElementById('timer');



// script.js (修改 initGame 函数)

function initGame() {
    // 1. 重置游戏状态
    matches = 0;
    tries = 0;
    flippedCards = [];
    lockBoard = false;
    gameBoard.innerHTML = '';
    gameMessage.classList.add('hidden');

    // 【新增】2. 初始化计时器
    if (timerInterval) {
        clearInterval(timerInterval); // 停止旧计时器
    }
    totalSeconds = 0;
    updateTimerDisplay(); // 重置显示为 00:00

    // 3. 初始化计分板
    totalPairsEl.textContent = cardIcons.length;
    updateScoreBoard();

    // 4. 洗牌并生成卡片
    shuffle(gameCards);
    generateCards();
    
    // 【新增】5. 启动计时器
    startTimer();
}



// 啟動計時器
function startTimer() {
    // 如果有舊的計時器，先清除它
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 每隔 1000 毫秒 (1 秒) 執行一次
    timerInterval = setInterval(() => {
        totalSeconds++;
        updateTimerDisplay();
    }, 1000);
}


function updateTimerDisplay() {
    // 【关键修改】：在这里重新获取元素，确保它不是 null
    const displayElement = document.getElementById('timer'); 
    
    if (displayElement) {
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        displayElement.textContent = `${minutes}:${seconds}`;
    }
}



// script.js (修改 endGame 函数)
function endGame() {
    // 停止计时器
    if (timerInterval) {
        clearInterval(timerInterval); 
    }
    
    gameMessage.classList.remove('hidden');
    
    // 【關鍵修改】直接获取元素，确保它不为 null
    const finalTime = document.getElementById('timer') ? document.getElementById('timer').textContent : '00:00';

    // 使用 finalTime
    gameMessage.textContent = `🎉 恭喜你完成游戏！你用了 ${finalTime}，总共尝试了 ${tries} 次。`;
}



// 卡片内容（请使用偶数个，确保能配对）
const cardIcons = [
    'pic1.jpg', 
    'pic2.jpg', 
    'pic3.jpg', 
    'pic4.jpg',
    'pic5.jpg', 
    'pic6.jpg', 
    'pic7.jpg', 
    'pic8.jpg'
];


// 将图标复制一份并打乱顺序，形成可配对的卡片数组
let gameCards = [...cardIcons, ...cardIcons];
let flippedCards = []; // 存储当前翻开的两张卡片
let matches = 0;
let tries = 0;
let lockBoard = false; // 防止在检查配对时再次点击

const gameBoard = document.getElementById('game-board');
const matchesEl = document.getElementById('matches');
const triesEl = document.getElementById('tries');
const totalPairsEl = document.getElementById('total-pairs');
const resetButton = document.getElementById('reset-button');
const gameMessage = document.getElementById('game-message');

// --- 游戏初始化和重置 ---

function shuffle(array) {
    // 经典 Fisher-Yates 洗牌算法
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

 
function generateCards() {
    gameCards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon; // 储存配对值
        card.dataset.index = index; // 储存索引

        // 内部结构：正面和背面
        card.innerHTML = `
            <div class="card-inner">
        <div class="card-front">
            <img src="images/${icon}" alt="Card Image">
        </div>
        <div class="card-back">?</div>
    </div>
`;

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// --- 游戏逻辑 ---

function flipCard() {
    // 如果板子被锁定（正在检查配对），或卡片已配对，或卡片已经被翻开，则不执行任何操作
    if (lockBoard || this.classList.contains('matched') || this.classList.contains('flipped')) {
        return;
    }

    this.classList.add('flipped');
    flippedCards.push(this);

    // 检查是否翻开了两张卡片
    if (flippedCards.length === 2) {
        // 锁定板子，防止继续点击
        lockBoard = true;
        tries++;
        updateScoreBoard();
        
        // 检查配对
        checkForMatch();
    }
}


function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.icon === card2.dataset.icon;

    if (isMatch) {
        // 成功配对
        disableCards(card1, card2); 
        matches++; 
        updateScoreBoard();
        
        // -----------------------------------------------------
        // 【關鍵修復點】檢查遊戲是否結束並呼叫 endGame
        // -----------------------------------------------------
        if (matches === cardIcons.length) {
            // 延迟 500ms，让最后两张卡片有时间翻转到位
            setTimeout(endGame, 500); 
        }

    } else {
        // 没有配对：执行 unflipCards
        unflipCards(card1, card2); 
    }
}


function disableCards(card1, card2) {
    // 标记为已配对，并移除点击事件
    card1.classList.add('matched');
    card2.classList.add('matched');
    card1.removeEventListener('click', flipCard);
    card2.removeEventListener('click', flipCard);

    // 重置状态以进行下一轮
    resetBoard();
}

function unflipCards(card1, card2) {
    // 延迟 1 秒后翻回
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        resetBoard();
    }, 1000); // 1000 毫秒 = 1 秒
}

function resetBoard() {
    [flippedCards, lockBoard] = [[], false];
}

function updateScoreBoard() {
    matchesEl.textContent = matches;
    triesEl.textContent = tries;
}


function endGame() {
    // 💥 關鍵：停止计时器 💥
    if (timerInterval) {
        clearInterval(timerInterval); 
    }
    
    gameMessage.classList.remove('hidden');
    // ... 遊戲結束訊息的其餘程式碼 ...
}


// --- 事件监听 ---
resetButton.addEventListener('click', initGame);

// 启动游戏
initGame();