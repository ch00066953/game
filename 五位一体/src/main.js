// 五位一体 - 3D游戏主脚本
import { CharacterManager } from './characters/CharacterManager.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { GameUI } from './ui/GameUI.js';

class FiveElementsGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsWorld = null;
        this.characterManager = null;
        this.ui = null;
        
        this.init();
    }

    init() {
        // 初始化Three.js场景
        this.initScene();
        
        // 初始化物理世界
        this.physicsWorld = new PhysicsWorld();
        
        // 初始化角色管理器
        this.characterManager = new CharacterManager(this.scene, this.physicsWorld);
        
        // 初始化UI
        this.ui = new GameUI();
        
        // 设置UI事件监听
        this.setupEventListeners();
        
        // 隐藏加载界面
        document.getElementById('loading-screen').style.display = 'none';
        
        // 开始游戏循环
        this.gameLoop();
    }

    initScene() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);

        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 添加光源
        this.addLights();

        // 添加基础环境
        this.createEnvironment();

        // 处理窗口大小调整
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    addLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // 方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }

    createEnvironment() {
        // 创建地面
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2E8B57,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // 创建一些基础几何体作为障碍物
        this.createObstacles();
    }

    createObstacles() {
        // 创建几个立方体作为示例障碍物
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff 
            });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 20,
                1,
                (Math.random() - 0.5) * 20
            );
            cube.castShadow = true;
            cube.receiveShadow = true;
            this.scene.add(cube);
            
            // 在物理世界中也添加对应的刚体
            this.physicsWorld.addBox(
                cube.position.x, 
                cube.position.y, 
                cube.position.z,
                2, 2, 2
            );
        }
    }

    setupEventListeners() {
        // 角色选择按钮事件
        document.getElementById('warrior-btn').addEventListener('click', () => {
            this.characterManager.switchCharacter('warrior');
            this.updateCharacterUI('warrior');
        });

        document.getElementById('mage-btn').addEventListener('click', () => {
            this.characterManager.switchCharacter('mage');
            this.updateCharacterUI('mage');
        });

        document.getElementById('thief-btn').addEventListener('click', () => {
            this.characterManager.switchCharacter('thief');
            this.updateCharacterUI('thief');
        });

        document.getElementById('artisan-btn').addEventListener('click', () => {
            this.characterManager.switchCharacter('artisan');
            this.updateCharacterUI('artisan');
        });

        document.getElementById('merchant-btn').addEventListener('click', () => {
            this.characterManager.switchCharacter('merchant');
            this.updateCharacterUI('merchant');
        });

        // 键盘控制（绑定到 window 以确保能接收到键盘事件）
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        window.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }

    updateCharacterUI(activeCharacter) {
        // 更新UI显示当前角色
        const buttons = document.querySelectorAll('.char-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const buttonMap = {
            'warrior': '#warrior-btn',
            'mage': '#mage-btn',
            'thief': '#thief-btn',
            'artisan': '#artisan-btn',
            'merchant': '#merchant-btn'
        };
        
        document.querySelector(buttonMap[activeCharacter]).classList.add('active');
    }

    handleKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                event.preventDefault();
                this.characterManager.moveForward(true);
                break;
            case 'KeyS':
            case 'ArrowDown':
                event.preventDefault();
                this.characterManager.moveBackward(true);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                event.preventDefault();
                this.characterManager.moveLeft(true);
                break;
            case 'KeyD':
            case 'ArrowRight':
                event.preventDefault();
                this.characterManager.moveRight(true);
                break;
            case 'Space':
                event.preventDefault();
                this.characterManager.jump();
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.characterManager.moveForward(false);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.characterManager.moveBackward(false);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.characterManager.moveLeft(false);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.characterManager.moveRight(false);
                break;
        }
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        // 更新物理世界
        this.physicsWorld.update();
        
        // 更新角色
        this.characterManager.update();
        
        // 更新相机跟随角色
        this.updateCamera();
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }

    updateCamera() {
        // 相机始终跟随在角色背后
        const playerPosition = this.characterManager.getCurrentCharacterPosition();
        const playerRotation = this.characterManager.getCurrentCharacterRotation();
        if (playerPosition) {
            const distance = 8;
            const height = 5;
            // 相机位于角色朝向的反方向（背后）
            const camX = playerPosition.x + Math.sin(playerRotation) * distance;
            const camZ = playerPosition.z + Math.cos(playerRotation) * distance;

            this.camera.position.lerp(new THREE.Vector3(
                camX,
                playerPosition.y + height,
                camZ
            ), 0.1);
            
            // 看向角色头部位置
            this.camera.lookAt(playerPosition.x, playerPosition.y + 1.5, playerPosition.z);
        }
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new FiveElementsGame();
});