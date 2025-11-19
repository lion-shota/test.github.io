// アイテム数を20個に増やす
const counters = [];
for (let i = 1; i <= 20; i++) {
    counters.push({ name: `アイテム${i}`, count: 0 });
}

const container = document.querySelector('.button-container');
const resetButton = document.getElementById('reset-button');
const outputButton = document.getElementById('output-button');
const outputArea = document.getElementById('output-area');

/**
 * すべてのボタン要素を生成し、DOMに追加する関数
 */
function renderButtons() {
    container.innerHTML = ''; 

    counters.forEach((item, index) => {
        // 1. 全体を包むラッパー要素を作成
        const wrapper = document.createElement('div');
        wrapper.classList.add('counter-wrapper');
        
        // 2. 項目名
        const nameSpan = document.createElement('div');
        nameSpan.classList.add('item-name');
        nameSpan.textContent = item.name;
        
        // 3. カウント表示
        const countDisplay = document.createElement('div');
        countDisplay.classList.add('count-display');
        countDisplay.id = `count-${index}`; 
        countDisplay.textContent = item.count;

        // 4. コントロールパネル (増減ボタンのコンテナ)
        const controlPanel = document.createElement('div');
        controlPanel.classList.add('control-panel');

        // 5. カウントダウン (-) ボタン
        const decrementButton = document.createElement('button');
        decrementButton.classList.add('count-control-button', 'decrement');
        decrementButton.textContent = '－';
        decrementButton.addEventListener('click', () => {
            // カウントを -1 する
            updateCounter(index, -1);
        });

        // 6. カウントアップ (+) ボタン
        const incrementButton = document.createElement('button');
        incrementButton.classList.add('count-control-button', 'increment');
        incrementButton.textContent = '＋';
        incrementButton.addEventListener('click', () => {
            // カウントを +1 する
            updateCounter(index, 1);
        });
        
        // 要素を組み立て
        controlPanel.appendChild(decrementButton);
        controlPanel.appendChild(incrementButton);
        
        wrapper.appendChild(nameSpan);
        wrapper.appendChild(countDisplay);
        wrapper.appendChild(controlPanel);

        // コンテナにラッパーを追加
        container.appendChild(wrapper);
    });
}

/**
 * 指定されたインデックスのカウンタを指定量更新し、表示を更新する関数
 * @param {number} index - 更新するカウンタのインデックス
 * @param {number} amount - 更新量 (1:プラス, -1:マイナス)
 */
function updateCounter(index, amount) {
    // データの更新
    counters[index].count += amount;
    
    // マイナス値にならないように制限 (オプション)
    if (counters[index].count < 0) {
        counters[index].count = 0;
    }
    
    // DOM（表示）の更新
    const countDisplay = document.getElementById(`count-${index}`);
    if (countDisplay) {
        countDisplay.textContent = counters[index].count;
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
        return; // キャンセルされたら処理を中断
    }
    
    // データの更新 (全てを0にする)
    counters.forEach(item => {
        item.count = 0;
    });

    // DOM（表示）の更新
    counters.forEach((item, index) => {
        const countDisplay = document.getElementById(`count-${index}`);
        if (countDisplay) {
            countDisplay.textContent = item.count;
        }
    });

    // 出力エリアもクリアする
    outputArea.textContent = '';
    alert("全てのカウントをリセットしました。");
}

// リセットボタンにイベントリスナーを設定
resetButton.addEventListener('click', resetAllCounters);


// ------------------------------------------------------------------
// 機能 2: カウント一覧をテキストファイルとしてダウンロードする機能
// ------------------------------------------------------------------

/**
 * カウント一覧をテキスト形式で整形し、ファイルとしてダウンロードさせる関数
 */
function outputCountList() {
    let outputText = '=== カウント一覧表 ===\n\n';
    
    // 最大の項目名長を計算し、整形のために使う
    const maxNameLength = counters.reduce((max, item) => Math.max(max, item.name.length), 0);
    
    // 各項目の名前とカウントをテキストに追加
    counters.forEach(item => {
        // 項目名の後にスペースを挿入してカウントの桁を揃える
        const padding = ' '.repeat(maxNameLength - item.name.length + 3);
        outputText += `${item.name}${padding}: ${item.count} 回\n`;
    });

    // 1. Blob（バイナリラージオブジェクト）を生成
    const blob = new Blob([outputText], { type: 'text/plain' });
    
    // 2. ダウンロードリンク要素を一時的に作成
    const a = document.createElement('a');
    
    // 3. ダウンロードするファイル名を設定 (タイムスタンプを追加)
    const now = new Date();
    // 例: 2025-11-19_155702 の形式でタイムスタンプを生成
    const timestamp = now.getFullYear() + 
                      '-' + String(now.getMonth() + 1).padStart(2, '0') + 
                      '-' + String(now.getDate()).padStart(2, '0') + 
                      '_' + String(now.getHours()).padStart(2, '0') + 
                      String(now.getMinutes()).padStart(2, '0') + 
                      String(now.getSeconds()).padStart(2, '0');
                      
    a.download = `count_list_${timestamp}.txt`; // ファイル名にタイムスタンプを追加
    
    // 4. BlobからURLを生成し、リンクのhref属性に設定
    a.href = window.URL.createObjectURL(blob);
    
    // 5. リンクをシミュレート的にクリックしてダウンロードを開始
    a.click();
    
    // 6. 不要になったURLを解放
    window.URL.revokeObjectURL(a.href);

    // 出力エリアにメッセージを表示
    outputArea.textContent = `ファイル「${a.download}」のダウンロードを開始しました。`;
}

// 出力ボタンにイベントリスナーを設定
outputButton.addEventListener('click', outputCountList);


// アプリケーションの開始
renderButtons();
