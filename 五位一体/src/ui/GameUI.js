// 游戏UI管理器
export class GameUI {
    constructor() {
        this.healthBar = document.getElementById('health-value');
        this.scoreDisplay = document.getElementById('score-value');
        this.characterSelector = document.getElementById('character-selector');
        
        this.health = 100;
        this.score = 0;
    }

    updateHealth(value) {
        this.health = Math.max(0, Math.min(100, value));
        this.healthBar.textContent = this.health;
        
        // 根据生命值改变颜色
        if (this.health < 30) {
            this.healthBar.style.color = '#ff0000'; // 红色
        } else if (this.health < 60) {
            this.healthBar.style.color = '#ffff00'; // 黄色
        } else {
            this.healthBar.style.color = '#ffffff'; // 白色
        }
    }

    updateScore(value) {
        this.score = value;
        this.scoreDisplay.textContent = this.score;
    }

    addScore(points) {
        this.score += points;
        this.scoreDisplay.textContent = this.score;
    }

    getHealth() {
        return this.health;
    }

    getScore() {
        return this.score;
    }
}