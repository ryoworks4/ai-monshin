var symptomInput = document.getElementById('symptom-input');
var charCount = document.getElementById('char-count');
var generateBtn = document.getElementById('generate-btn');
var resultArea = document.getElementById('result-area');
var copyBtn = document.getElementById('copy-btn');
var deptButtons = document.querySelectorAll('.dept-btn');
var exampleTags = document.querySelectorAll('.example-tag');

var selectedDept = 'internal';

// 文字数カウント
symptomInput.addEventListener('input', function () {
    charCount.textContent = this.value.length;
});

// 診療科切替
deptButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        deptButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedDept = this.dataset.dept;
    });
});

// サンプルタグクリック
exampleTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
        symptomInput.value = this.textContent;
        charCount.textContent = this.textContent.length;
        symptomInput.focus();
    });
});

// 生成実行
generateBtn.addEventListener('click', async function () {
    var symptom = symptomInput.value.trim();

    if (!symptom) {
        resultArea.innerHTML = '<p class="error-text">症状を入力してください</p>';
        return;
    }

    if (symptom.length > 500) {
        resultArea.innerHTML = '<p class="error-text">500文字以内で入力してください</p>';
        return;
    }

    // ローディング表示
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    copyBtn.style.display = 'none';
    resultArea.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';

    try {
        var response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptom: symptom, dept: selectedDept })
        });

        var responseText = await response.text();

        if (!response.ok) {
            var errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: '通信エラーが発生しました' };
            }
            resultArea.innerHTML = '<p class="error-text">' + escapeHtml(errorData.error) + '</p>';
            return;
        }

        var data = JSON.parse(responseText);
        var deptLabel = {
            internal: '内科', orthopedic: '整形外科', dermatology: '皮膚科',
            ent: '耳鼻咽喉科', ophthalmology: '眼科', pediatrics: '小児科'
        };
        resultArea.innerHTML = '<div class="result-content">' +
            '<div class="result-header">' +
            '<span class="result-label">AI問診票</span>' +
            '<span class="result-dept">' + deptLabel[selectedDept] + '</span>' +
            '</div>' +
            '<div class="result-text">' + escapeHtml(data.result) + '...</div>' +
            '<p class="demo-note">※ デモ版のため文字数に制限があります</p>' +
            '</div>';
        copyBtn.style.display = 'block';
    } catch (error) {
        resultArea.innerHTML = '<p class="error-text">通信エラーが発生しました。もう一度お試しください。</p>';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '問診票を生成する';
    }
});

// コピー
copyBtn.addEventListener('click', function () {
    var resultText = document.querySelector('.result-text');
    if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(function () {
            copyBtn.textContent = 'コピーしました！';
            setTimeout(function () {
                copyBtn.textContent = 'コピー';
            }, 2000);
        });
    }
});

// HTMLエスケープ
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
