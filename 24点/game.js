// 24点游戏逻辑
class Game24 {
    constructor() {
        this.currentNumbers = [];
        this.correctCount = 0;
        this.wrongCount = 0;
        this.solution = null;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.cardsContainer = document.getElementById('cards-container');
        this.messageEl = document.getElementById('message');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.startBtn = document.getElementById('start-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.correctCountEl = document.getElementById('correct-count');
        this.wrongCountEl = document.getElementById('wrong-count');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.nextBtn.addEventListener('click', () => this.startGame());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
    }

    startGame() {
        // 生成4个随机数字
        this.currentNumbers = this.generateNumbers();
        
        // 查找解决方案
        this.solution = this.findSolution(this.currentNumbers);
        
        // 如果无解，重新生成
        while (!this.solution) {
            this.currentNumbers = this.generateNumbers();
            this.solution = this.findSolution(this.currentNumbers);
        }

        this.displayCards();
        this.enableInput();
        this.showMessage(`请使用数字 ${this.currentNumbers.join('、')} 计算出 24`, 'info');
        this.answerInput.value = '';
        this.answerInput.focus();
    }

    generateNumbers() {
        const numbers = [];
        for (let i = 0; i < 4; i++) {
            numbers.push(Math.floor(Math.random() * 13) + 1);
        }
        return numbers;
    }

    displayCards() {
        this.cardsContainer.innerHTML = '';
        this.currentNumbers.forEach(num => {
            const card = document.createElement('div');
            card.className = 'card';
            card.textContent = num;
            this.cardsContainer.appendChild(card);
        });
    }

    enableInput() {
        this.answerInput.disabled = false;
        this.submitBtn.disabled = false;
        this.hintBtn.disabled = false;
        this.skipBtn.disabled = false;
        this.nextBtn.disabled = false;
    }

    disableInput() {
        this.answerInput.disabled = true;
        this.submitBtn.disabled = true;
        this.hintBtn.disabled = true;
        this.skipBtn.disabled = true;
    }

    submitAnswer() {
        const answer = this.answerInput.value.trim();
        
        if (!answer) {
            this.showMessage('请输入算式', 'error');
            return;
        }

        const validation = this.validateAnswer(answer);
        
        if (validation.valid) {
            this.correctCount++;
            this.correctCountEl.textContent = this.correctCount;
            this.showMessage(`✅ 恭喜！${answer} = 24，回答正确！`, 'success');
            this.disableInput();
            this.nextBtn.focus();
        } else {
            this.wrongCount++;
            this.wrongCountEl.textContent = this.wrongCount;
            this.showMessage(`❌ ${validation.message}`, 'error');
        }
    }

    validateAnswer(answer) {
        // 检查是否只包含允许的字符
        if (!/^[\d+\-*/().\s]+$/.test(answer)) {
            return { valid: false, message: '算式包含非法字符' };
        }

        // 提取算式中的所有数字
        const numbersInAnswer = answer.match(/\d+/g);
        if (!numbersInAnswer || numbersInAnswer.length !== 4) {
            return { valid: false, message: '必须使用全部4个数字' };
        }

        // 将字符串数字转换为整数并排序
        const sortedAnswer = numbersInAnswer.map(Number).sort((a, b) => a - b);
        const sortedCurrent = [...this.currentNumbers].sort((a, b) => a - b);

        // 检查数字是否匹配
        if (!this.arraysEqual(sortedAnswer, sortedCurrent)) {
            return { valid: false, message: '必须使用给定的数字，每个数字仅使用一次' };
        }

        // 计算结果
        try {
            const result = this.safeEval(answer);
            if (Math.abs(result - 24) < 0.0001) {
                return { valid: true };
            } else {
                return { valid: false, message: `计算结果是 ${result}，不等于24` };
            }
        } catch (error) {
            return { valid: false, message: '算式计算错误，请检查格式' };
        }
    }

    safeEval(expression) {
        // 安全的表达式计算
        // 移除所有空格
        expression = expression.replace(/\s/g, '');
        
        // 使用Function构造器进行安全计算
        try {
            const result = Function('"use strict"; return (' + expression + ')')();
            return result;
        } catch (error) {
            throw new Error('Invalid expression');
        }
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    showHint() {
        if (this.solution) {
            // 给出一个分解提示
            const hints = [
                '试试先计算两个数的结果',
                '考虑使用括号改变运算顺序',
                '想想24可以分解成哪些数相乘',
                `提示：考虑 24 = 3 × 8 或 24 = 4 × 6 的形式`,
                `其中一个可能的答案开头是: ${this.solution.substring(0, 2)}...`
            ];
            const hint = hints[Math.floor(Math.random() * hints.length)];
            this.showMessage(`💡 ${hint}`, 'info');
        }
    }

    skipQuestion() {
        if (this.solution) {
            this.showMessage(`本题答案：${this.solution}`, 'info');
            this.disableInput();
            this.nextBtn.focus();
        }
    }

    showMessage(text, type = 'info') {
        this.messageEl.textContent = text;
        this.messageEl.className = `message message-${type}`;
    }

    // 查找24点的解决方案
    findSolution(numbers) {
        const solutions = [];
        this.solve([...numbers], '', solutions);
        return solutions.length > 0 ? solutions[0] : null;
    }

    solve(nums, expr, solutions) {
        if (solutions.length > 0) return; // 已找到解决方案
        
        if (nums.length === 1) {
            if (Math.abs(nums[0] - 24) < 0.0001) {
                solutions.push(expr || nums[0].toString());
            }
            return;
        }

        const operators = ['+', '-', '*', '/'];
        
        for (let i = 0; i < nums.length; i++) {
            for (let j = 0; j < nums.length; j++) {
                if (i === j) continue;
                
                const a = nums[i];
                const b = nums[j];
                
                const remaining = nums.filter((_, idx) => idx !== i && idx !== j);
                
                for (const op of operators) {
                    let result;
                    let newExpr;
                    
                    switch(op) {
                        case '+':
                            result = a + b;
                            newExpr = `(${a}+${b})`;
                            break;
                        case '-':
                            result = a - b;
                            newExpr = `(${a}-${b})`;
                            break;
                        case '*':
                            result = a * b;
                            newExpr = `(${a}*${b})`;
                            break;
                        case '/':
                            if (b === 0) continue;
                            result = a / b;
                            newExpr = `(${a}/${b})`;
                            break;
                    }
                    
                    this.solve([...remaining, result], newExpr, solutions);
                }
            }
        }
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Game24();
});
