// ⭐ データの永続化: localStorageのキーを定義 ⭐
const STORAGE_KEY = 'clickCounterApp_data';

let counters = [];

const container = document.querySelector('.button-container');
const resetButton = document.getElementById('reset-button');
const outputButton = document.getElementById('output-button');
const outputArea = document.getElementById('output-area');

// ------------------------------------------------------------------
// 永続化機能: データのロードと保存
// ------------------------------------------------------------------

/**
 * localStorageからデータをロードする関数
 */
function loadCounters() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            counters = JSON.parse(savedData);
        } catch (e) {
            console.error("Failed to parse stored data.", e);
            initializeDefaultCounters();
        }
    } else {
        initializeDefaultCounters();
    }
}

/**
 * デフォルトの20アイテムを作成する関数
 */
function initializeDefaultCounters() {
    counters = [];
    for (let i = 1; i <= 20; i++) {
        counters.push({ name: `アイテム${i}`, count: 0 });
    }
}

/**
 * 現在のデータをlocalStorageに保存する関数
 */
function saveCounters() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
}

// ------------------------------------------------------------------
// ボタン描画機能
// ------------------------------------------------------------------

/**
 * すべてのボタン要素を生成し、DOMに追加する関数
 */
function renderButtons() {
    container.innerHTML = ''; 

    counters.forEach((item, index) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('counter-wrapper');
        
        // アイテム名表示エリアの作成
        const nameSpan = document.createElement('div');
        nameSpan.classList.add('item-name');
        nameSpan.id = `name-${index}`; // IDを追加
        nameSpan.textContent = item.name;

        // アイテム名クリックで編集モードへ
        nameSpan.addEventListener('click', () => {
            enterEditMode(index, nameSpan);
        });
        
        // カウント表示
        const countDisplay = document.createElement('div');
        countDisplay.classList.add('count-display');
        countDisplay.id = `count-${index}`; 
        countDisplay.textContent = item.count;

        // コントロールパネル (増減ボタンのコンテナ)
        const controlPanel = document.createElement('div');
        controlPanel.classList.add('control-panel');

        // カウントダウン (-) ボタン
        const decrementButton = document.createElement('button');
        decrementButton.classList.add('count-control-button', 'decrement');
        decrementButton.textContent = '－';
        decrementButton.addEventListener('click', () => {
            updateCounter(index, -1);
        });

        // カウントアップ (+) ボタン
        const incrementButton = document.createElement('button');
        incrementButton.classList.add('count-control-button', 'increment');
        incrementButton.textContent = '＋';
        incrementButton.addEventListener('click', () => {
            updateCounter(index, 1);
        });
        
        // 要素を組み立て
        controlPanel.appendChild(decrementButton);
        controlPanel.appendChild(incrementButton);
        
        wrapper.appendChild(nameSpan);
        wrapper.appendChild(countDisplay);
        wrapper.appendChild(controlPanel);

        container.appendChild(wrapper);
    });
}

// ------------------------------------------------------------------
// アイテム名カスタマイズ機能: 編集モードの処理
// ------------------------------------------------------------------

/**
 * 指定されたアイテムを編集モードに切り替える関数
 */
function enterEditMode(index, nameElement) {
    // 編集モード用の input 要素を作成
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('item-name-input');
    input.value = counters[index].name;
    input.maxLength = 15; // 最大文字数を設定
    
    // 現在の nameElement を input に置き換える
    nameElement.replaceWith(input);
    input.focus();
    
    // Enterキーを押した、またはフォーカスが外れたら保存
    const saveName = () => {
        const newName = input.value.trim() || `アイテム${index + 1}`;
        counters[index].name = newName;
        saveCounters(); // 永続化
        
        // input を新しい nameElement に置き換える
        const newNameElement = document.createElement('div');
        newNameElement.classList.add('item-name');
        newNameElement.id = `name-${index}`;
        newNameElement.textContent = newName;
        
        // イベントリスナーを再設定
        newNameElement.addEventListener('click', () => {
            enterEditMode(index, newNameElement);
        });
        
        input.replaceWith(newNameElement);
    };

    input.addEventListener('blur', saveName); // フォーカスが外れたら保存
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveName();
        }
    });
}


// ------------------------------------------------------------------
// カウント更新機能
// ------------------------------------------------------------------

/**
 * 指定されたインデックスのカウンタを指定量更新し、表示を更新する関数
 * @param {number} index - 更新するカウンタのインデックス
 * @param {number} amount - 更新量 (1:プラス, -1:マイナス)
 */
function updateCounter(index, amount) {
    // データの更新
    counters[index].count += amount;
    
    if (counters[index].count < 0) {
        counters[index].count = 0;
    }
    
    saveCounters(); // 永続化: カウント更新後に保存
    
    // DOM（表示）の更新
    const countDisplay = document.getElementById(`count-${index}`);
    if (countDisplay) {
        countDisplay.textContent = counters[index].count;
    }

    // カウントアップ時のみ、アイテム名をファイル出力
    if (amount > 0) {
        downloadItemName(counters[index].name);
    }
}


// ------------------------------------------------------------------
// 機能 1: カウンタのリセット機能
// ------------------------------------------------------------------

/**
 * すべてのカウンタを0にリセットする関数
 */
function resetAllCounters() {
    if (!confirm("本当に全てのカウントをリセットしますか？")) {
        return; 
    }
    
    counters.forEach(item => {
        item.count = 0;
    });

    saveCounters(); // 永続化: リセット後に保存

    // DOM（表示）の更新
    counters.forEach((item, index) => {
        const countDisplay = document.getElementById(`count-${index}`);
        if (countDisplay) {
            countDisplay.textContent = item.count;
        }
    });

    outputArea.textContent = '';
    alert("全てのカウントをリセットしました。");
}

// リセットボタンにイベントリスナーを設定
resetButton.addEventListener('click', resetAllCounters);


// ------------------------------------------------------------------
// 共通処理: YYYYMMDDhhmmss形式のタイムスタンプ生成
// ------------------------------------------------------------------

function generateTimestamp() {
    const now = new Date();
    
    // YYYYMMDDhhmmss 形式を生成
    return String(now.getFullYear()) + 
           String(now.getMonth() + 1).padStart(2, '0') + 
           String(now.getDate()).padStart(2, '0') + 
           String(now.getHours()).padStart(2, '0') + 
           String(now.getMinutes()).padStart(2, '0') + 
           String(now.getSeconds()).padStart(2, '0');
}


// ------------------------------------------------------------------
// ⭐ 機能 2: 個別アイテム名出力機能 (ファイル名修正) ⭐
// ------------------------------------------------------------------

/**
 * クリックされたアイテム名と日時を記録したテキストファイルをダウンロードする関数
 * @param {string} itemName - クリックされたアイテムの名前
 */
function downloadItemName(itemName) {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    });
    
    const outputText = `アイテム名: ${itemName}\nクリック日時: ${now.toLocaleDateString('ja-JP')} ${formattedTime}\n`;

    const blob = new Blob([outputText], { type: 'text/plain' });
    const a = document.createElement('a');
    
    const timestamp = generateTimestamp();
    
    // ⭐ 修正: ファイル名に使用できない文字のみを除去し、それ以外（日本語を含む）は残す ⭐
    // Windows/Macで問題となる主要な記号 (\ / : * ? " < > |) と制御文字をアンダースコアに置換する
    const safeItemName = itemName.replace(/[\\/:*?"<>|]/g, '_'); 
    
    // ファイル名: アイテム名_YYYYMMDDhhmmss.txt
    a.download = `${safeItemName}_${timestamp}.txt`; 
    
    a.href = window.URL.createObjectURL(blob);
    a.click();
    window.URL.revokeObjectURL(a.href);

    outputArea.textContent = `アイテム「${itemName}」の記録ファイル「${a.download}」をダウンロードしました。`;
}


// ------------------------------------------------------------------
// 機能 3: カウント一覧出力機能
// ------------------------------------------------------------------

/**
 * カウント一覧をテキスト形式で整形し、ファイルとしてダウンロードさせる関数
 */
function outputCountList() {
    let outputText = '=== カウント一覧表 ===\n\n';
    
    const maxNameLength = counters.reduce((max, item) => Math.max(max, item.name.length), 0);
    
    counters.forEach(item => {
        const padding = ' '.repeat(maxNameLength - item.name.length + 3);
        outputText += `${item.name}${padding}: ${item.count} 回\n`;
    });

    const blob = new Blob([outputText], { type: 'text/plain' });
    const a = document.createElement('a');
    
    const timestamp = generateTimestamp();
                      
    // ファイル名: all_YYYYMMDDhhmmss.txt
    a.download = `all_${timestamp}.txt`;
    
    a.href = window.URL.createObjectURL(blob);
    a.click();
    window.URL.revokeObjectURL(a.href);

    outputArea.textContent = `ファイル「${a.download}」のダウンロードを開始しました。`;
}

// 出力ボタンにイベントリスナーを設定
outputButton.addEventListener('click', outputCountList);


// ------------------------------------------------------------------
// アプリケーションの初期化
// ------------------------------------------------------------------

/**
 * アプリのメイン初期化関数
 */
function initializeApp() {
    loadCounters(); // 永続化データからロード
    renderButtons(); // ボタンを描画
}

initializeApp();
