// 角色管理器
export class CharacterManager {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.characters = {};
        this.currentCharacter = null;
        
        // 移动状态
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };
        
        // 跳跃状态
        this.isJumping = false;
        this.jumpVelocity = 0;
        
        this.initCharacters();
    }

    initCharacters() {
        // 创建五个角色实例
        this.characters.warrior = this.createWarrior();
        this.characters.mage = this.createMage();
        this.characters.thief = this.createThief();
        this.characters.artisan = this.createArtisan();
        this.characters.merchant = this.createMerchant();
        
        // 默认使用战士角色
        this.currentCharacter = this.characters.warrior;
        this.scene.add(this.currentCharacter.model);
    }

    createWarrior() {
        // 创建战士角色
        const group = new THREE.Group();
        
        // 简单的战士模型（用基本几何体代替）
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16),
            new THREE.MeshStandardMaterial({ color: 0xC0C0C0 })
        );
        body.position.y = 0.75;
        body.castShadow = true;
        group.add(body);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFD700 })
        );
        head.position.y = 1.7;
        head.castShadow = true;
        group.add(head);
        
        // 武器
        const weapon = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 1, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        weapon.position.set(0.6, 0.5, 0);
        weapon.castShadow = true;
        group.add(weapon);
        
        return {
            model: group,
            type: 'warrior',
            health: 100,
            speed: 0.1,
            abilities: ['melee_attack', 'shield']
        };
    }

    createMage() {
        // 创建法师角色
        const group = new THREE.Group();
        
        // 简单的法师模型
        const robe = new THREE.Mesh(
            new THREE.ConeGeometry(0.7, 1.5, 16),
            new THREE.MeshStandardMaterial({ color: 0x4169E1 })
        );
        robe.position.y = 0.75;
        robe.castShadow = true;
        group.add(robe);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFD700 })
        );
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);
        
        // 法杖
        const staff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8),
            new THREE.MeshStandardMaterial({ color: 0xDAA520 })
        );
        staff.position.set(-0.5, 1.2, 0);
        staff.castShadow = true;
        group.add(staff);
        
        const crystal = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x00FFFF, emissive: 0x00AAAA })
        );
        crystal.position.set(-0.5, 1.8, 0);
        crystal.castShadow = true;
        group.add(crystal);
        
        return {
            model: group,
            type: 'mage',
            health: 70,
            speed: 0.08,
            abilities: ['magic_missile', 'teleport']
        };
    }

    createThief() {
        // 创建盗贼角色
        const group = new THREE.Group();
        
        // 简单的盗贼模型
        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.4, 1, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0x2F4F4F })
        );
        body.position.y = 0.8;
        body.castShadow = true;
        group.add(body);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xDEB887 })
        );
        head.position.y = 1.65;
        head.castShadow = true;
        group.add(head);
        
        // 匕首
        const dagger = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.6, 0.05),
            new THREE.MeshStandardMaterial({ color: 0xC0C0C0 })
        );
        dagger.position.set(0.4, 0.5, 0);
        dagger.castShadow = true;
        group.add(dagger);
        
        return {
            model: group,
            type: 'thief',
            health: 60,
            speed: 0.15,
            abilities: ['stealth', 'lockpick']
        };
    }

    createArtisan() {
        // 创建工匠角色
        const group = new THREE.Group();
        
        // 简单的工匠模型
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.55, 1.4, 16),
            new THREE.MeshStandardMaterial({ color: 0x8B4513 })
        );
        body.position.y = 0.7;
        body.castShadow = true;
        group.add(body);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xDEB887 })
        );
        head.position.y = 1.5;
        head.castShadow = true;
        group.add(head);
        
        // 工具
        const hammer = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.8, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x696969 })
        );
        hammer.position.set(0.6, 0.4, 0);
        hammer.castShadow = true;
        group.add(hammer);
        
        const apron = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.3, 0.3),
            new THREE.MeshStandardMaterial({ color: 0xA9A9A9 })
        );
        apron.position.y = 0.2;
        apron.castShadow = true;
        group.add(apron);
        
        return {
            model: group,
            type: 'artisan',
            health: 85,
            speed: 0.09,
            abilities: ['craft', 'repair']
        };
    }

    createMerchant() {
        // 创建商人角色
        const group = new THREE.Group();
        
        // 简单的商人模型
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16),
            new THREE.MeshStandardMaterial({ color: 0x228B22 })
        );
        body.position.y = 0.75;
        body.castShadow = true;
        group.add(body);
        
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xFFD700 })
        );
        head.position.y = 1.7;
        head.castShadow = true;
        group.add(head);
        
        // 钱袋
        const pouch = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xDAA520 })
        );
        pouch.position.set(-0.5, 0.5, 0.2);
        pouch.castShadow = true;
        group.add(pouch);
        
        return {
            model: group,
            type: 'merchant',
            health: 75,
            speed: 0.08,
            abilities: ['trade', 'negotiate']
        };
    }

    switchCharacter(characterType) {
        if (!this.characters[characterType]) {
            console.error(`Unknown character type: ${characterType}`);
            return;
        }

        // 从场景中移除当前角色
        this.scene.remove(this.currentCharacter.model);
        
        // 切换到新角色
        this.currentCharacter = this.characters[characterType];
        
        // 将新角色添加到场景中
        this.scene.add(this.currentCharacter.model);
        
        // 保持相同的位置
        this.currentCharacter.model.position.copy(
            this.characters[Object.keys(this.characters).find(key => 
                this.characters[key] === this.currentCharacter
            )].model.position
        );
        
        console.log(`Switched to ${characterType}`);
    }

    moveForward(active) {
        this.movement.forward = active;
    }

    moveBackward(active) {
        this.movement.backward = active;
    }

    moveLeft(active) {
        this.movement.left = active;
    }

    moveRight(active) {
        this.movement.right = active;
    }

    jump() {
        if (this.currentCharacter && !this.isJumping) {
            this.isJumping = true;
            this.jumpVelocity = 0.2;
        }
    }

    update() {
        if (!this.currentCharacter) return;

        const speed = this.currentCharacter.speed;
        const model = this.currentCharacter.model;

        // A/D 控制角色旋转方向
        if (this.movement.left) {
            model.rotation.y += 0.04;
        }
        if (this.movement.right) {
            model.rotation.y -= 0.04;
        }

        // W/S 沿角色朝向前进/后退
        if (this.movement.forward) {
            model.position.x -= Math.sin(model.rotation.y) * speed;
            model.position.z -= Math.cos(model.rotation.y) * speed;
        }
        if (this.movement.backward) {
            model.position.x += Math.sin(model.rotation.y) * speed;
            model.position.z += Math.cos(model.rotation.y) * speed;
        }

        // 跳跃与重力
        if (this.isJumping) {
            model.position.y += this.jumpVelocity;
            this.jumpVelocity -= 0.01;
            if (model.position.y <= 0) {
                model.position.y = 0;
                this.jumpVelocity = 0;
                this.isJumping = false;
            }
        }
    }

    getCurrentCharacterPosition() {
        if (this.currentCharacter && this.currentCharacter.model) {
            return this.currentCharacter.model.position;
        }
        return null;
    }

    getCurrentCharacterRotation() {
        if (this.currentCharacter && this.currentCharacter.model) {
            return this.currentCharacter.model.rotation.y;
        }
        return 0;
    }
}