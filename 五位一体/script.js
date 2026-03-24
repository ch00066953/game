(function () {
    const ROLE_CONFIG = {
        warrior: {
            label: '战士',
            color: 0xc9cdd6,
            accent: 0xef4444,
            speed: 7.4,
            ability: '震荡冲击',
            description: '将附近木箱和碎石强力震开。'
        },
        mage: {
            label: '法师',
            color: 0x4f7cff,
            accent: 0x8b5cf6,
            speed: 6.2,
            ability: '召唤方块',
            description: '在前方生成一个可受力的临时方块。'
        },
        thief: {
            label: '盗贼',
            color: 0x1f2937,
            accent: 0x14b8a6,
            speed: 8.8,
            ability: '影遁冲刺',
            description: '快速向前冲刺，适合穿越危险区域。'
        },
        artisan: {
            label: '工匠',
            color: 0x9a6b3f,
            accent: 0xf59e0b,
            speed: 6.4,
            ability: '架设浮桥',
            description: '修复裂谷上的木桥。'
        },
        merchant: {
            label: '商人',
            color: 0x237a3b,
            accent: 0xfacc15,
            speed: 6.6,
            ability: '聚财磁场',
            description: '吸附附近所有金币。'
        }
    };

    class FiveHeroesGame {
        constructor() {
            this.canvas = document.getElementById('game-canvas');
            this.overlay = document.getElementById('overlay');
            this.messageBox = document.getElementById('message-box');
            this.roleName = document.getElementById('role-name');
            this.healthValue = document.getElementById('health-value');
            this.coinValue = document.getElementById('coin-value');
            this.statusValue = document.getElementById('status-value');
            this.objectiveText = document.getElementById('objective-text');
            this.endSummary = document.getElementById('end-summary');
            this.roleButtons = Array.from(document.querySelectorAll('.role-button'));

            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.clock = new THREE.Clock();
            this.world = null;
            this.keys = new Set();
            this.playerBody = null;
            this.playerMesh = null;
            this.currentRole = 'warrior';
            this.playerHealth = 100;
            this.coinCount = 0;
            this.totalCoins = 8;
            this.bridgeBuilt = false;
            this.finished = false;
            this.abilityCooldown = 0;
            this.thiefBoost = 0;
            this.tempObjects = [];
            this.dynamicObjects = [];
            this.coins = [];
            this.bridgeSegments = [];
            this.portal = null;
            this.gateBlocks = [];
            this.lastTime = performance.now();
            this.autoMoveForwardTest = true;

            this.init();
        }

        init() {
            this.createScene();
            this.createPhysics();
            this.createWorld();
            this.createPlayer();
            this.bindEvents();
            this.setRole('warrior');
            this.setMessage('先熟悉能力。工匠修桥，商人收金币，战士清障。');
            this.updateHud();
            this.animate();
        }

        createScene() {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x06131f);
            this.scene.fog = new THREE.Fog(0x06131f, 18, 70);

            this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
            this.camera.position.set(-10, 8, 12);

            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            const hemisphereLight = new THREE.HemisphereLight(0xa5f3fc, 0x10283b, 0.8);
            this.scene.add(hemisphereLight);

            const sun = new THREE.DirectionalLight(0xfff3c4, 1.2);
            sun.position.set(12, 18, 10);
            sun.castShadow = true;
            sun.shadow.mapSize.width = 2048;
            sun.shadow.mapSize.height = 2048;
            sun.shadow.camera.left = -40;
            sun.shadow.camera.right = 40;
            sun.shadow.camera.top = 40;
            sun.shadow.camera.bottom = -40;
            this.scene.add(sun);

            const fill = new THREE.PointLight(0x4f9dff, 0.8, 40);
            fill.position.set(8, 5, -10);
            this.scene.add(fill);
        }

        createPhysics() {
            this.world = new CANNON.World();
            this.world.gravity.set(0, -20, 0);
            this.world.broadphase = new CANNON.NaiveBroadphase();
            this.world.solver.iterations = 10;
            this.world.allowSleep = true;
        }

        createWorld() {
            this.addGroundPlate(-8, 10, 20, 20, 0x365314);
            this.addGroundPlate(18, 10, 20, 20, 0x3f6212);
            this.addGroundPlate(34, 10, 12, 14, 0x1d4ed8);
            this.addCliffDecor();
            this.addCrates();
            this.addCoins();
            this.addPortal();
            this.addGate();
        }

        addGroundPlate(x, z, width, depth, color) {
            const geometry = new THREE.BoxGeometry(width, 2, depth);
            const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.95 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, -1, z);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            this.scene.add(mesh);

            const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(width / 2, 1, depth / 2)) });
            body.position.set(x, -1, z);
            this.world.addBody(body);
        }

        addCliffDecor() {
            const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 1 });
            for (let index = 0; index < 14; index += 1) {
                const size = 0.8 + Math.random() * 1.6;
                const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMaterial);
                rock.position.set(-16 + Math.random() * 56, -0.2 + Math.random() * 0.4, -10 + Math.random() * 40);
                rock.scale.y = 0.7 + Math.random() * 0.7;
                rock.castShadow = true;
                rock.receiveShadow = true;
                this.scene.add(rock);
            }

            const river = new THREE.Mesh(
                new THREE.BoxGeometry(8, 0.3, 24),
                new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x082f49, transparent: true, opacity: 0.82 })
            );
            river.position.set(5, -2.6, 10);
            this.scene.add(river);
        }

        addCrates() {
            const positions = [
                { x: -2, y: 4, z: 8 },
                { x: 0, y: 7, z: 11 },
                { x: 3, y: 5, z: 9 },
                { x: 27, y: 3, z: 11 },
                { x: 29, y: 5, z: 9 },
                { x: 31, y: 3, z: 13 }
            ];

            positions.forEach((position, index) => {
                const color = index < 3 ? 0x8b5a2b : 0x6b4f2a;
                const object = this.createDynamicBox(position.x, position.y, position.z, 1.4, color);
                if (index >= 3) {
                    this.gateBlocks.push(object.body);
                }
            });
        }

        createDynamicBox(x, y, z, size, color) {
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.85 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            const body = new CANNON.Body({
                mass: 2.5,
                shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
                linearDamping: 0.2,
                angularDamping: 0.35
            });
            body.position.set(x, y, z);
            this.world.addBody(body);
            this.dynamicObjects.push({ mesh: mesh, body: body, size: size });
            return { mesh: mesh, body: body };
        }

        addCoins() {
            const coinGeometry = new THREE.TorusGeometry(0.42, 0.16, 12, 18);
            const coinMaterial = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x5b4300, metalness: 0.8, roughness: 0.25 });
            const positions = [
                [14, 1.5, 8], [16, 1.5, 12], [20, 1.5, 8], [22, 1.5, 12],
                [26, 1.5, 9], [28, 1.5, 12], [32, 1.5, 8], [34, 1.5, 11]
            ];

            positions.forEach((position) => {
                const mesh = new THREE.Mesh(coinGeometry, coinMaterial.clone());
                mesh.position.set(position[0], position[1], position[2]);
                mesh.rotation.x = Math.PI / 2;
                mesh.castShadow = true;
                this.scene.add(mesh);
                this.coins.push({ mesh: mesh, collected: false, phase: Math.random() * Math.PI * 2 });
            });
        }

        addPortal() {
            const portalGroup = new THREE.Group();
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1.4, 0.28, 16, 50),
                new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x1d4ed8, metalness: 0.3, roughness: 0.2 })
            );
            ring.rotation.y = Math.PI / 2;
            ring.castShadow = true;
            portalGroup.add(ring);

            const core = new THREE.Mesh(
                new THREE.CircleGeometry(1.1, 32),
                new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.55 })
            );
            core.rotation.y = Math.PI / 2;
            portalGroup.add(core);
            portalGroup.position.set(34, 1.6, 10);
            this.scene.add(portalGroup);
            this.portal = portalGroup;
        }

        addGate() {
            const pillarMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });
            const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5, 1.2), pillarMaterial);
            leftPillar.position.set(30.5, 2.5, 6.5);
            leftPillar.castShadow = true;
            this.scene.add(leftPillar);

            const rightPillar = leftPillar.clone();
            rightPillar.position.z = 13.5;
            this.scene.add(rightPillar);

            const arch = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 8), pillarMaterial);
            arch.position.set(30.5, 5.1, 10);
            arch.castShadow = true;
            this.scene.add(arch);
        }

        createPlayer() {
            this.playerBody = new CANNON.Body({
                mass: 3,
                shape: new CANNON.Sphere(0.65),
                linearDamping: 0.35,
                angularDamping: 1
            });
            this.playerBody.position.set(-12, 2.2, 10);
            this.world.addBody(this.playerBody);

            this.playerMesh = this.buildRoleMesh(this.currentRole);
            this.scene.add(this.playerMesh);
        }

        buildRoleMesh(role) {
            const config = ROLE_CONFIG[role];
            const group = new THREE.Group();
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: config.color, roughness: 0.6 });
            const accentMaterial = new THREE.MeshStandardMaterial({ color: config.accent, emissive: config.accent, emissiveIntensity: 0.15, roughness: 0.4 });
            const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xf3d0a5, roughness: 0.7 });

            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.2, 16), bodyMaterial);
            torso.position.y = 1.02;
            torso.castShadow = true;
            group.add(torso);

            const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), bodyMaterial);
            shoulder.position.y = 1.54;
            shoulder.scale.y = 0.68;
            shoulder.castShadow = true;
            group.add(shoulder);

            const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), skinMaterial);
            head.position.y = 2.02;
            head.castShadow = true;
            group.add(head);

            const accessory = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.95, 0.15), accentMaterial);
            accessory.position.set(0.62, 1.05, 0);
            accessory.castShadow = true;
            group.add(accessory);

            if (role === 'mage') {
                const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), accentMaterial);
                orb.position.set(-0.58, 1.68, 0);
                orb.castShadow = true;
                group.add(orb);
            }

            if (role === 'thief') {
                const hood = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.55, 16), accentMaterial);
                hood.position.y = 2.26;
                hood.castShadow = true;
                group.add(hood);
            }

            if (role === 'artisan') {
                const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.3), accentMaterial);
                pack.position.set(0, 1.15, -0.42);
                pack.castShadow = true;
                group.add(pack);
            }

            if (role === 'merchant') {
                const satchel = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 16), accentMaterial);
                satchel.position.set(-0.55, 0.9, 0.28);
                satchel.castShadow = true;
                group.add(satchel);
            }

            if (role === 'warrior') {
                const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 20), accentMaterial);
                shield.rotation.z = Math.PI / 2;
                shield.position.set(-0.62, 1.1, 0);
                shield.castShadow = true;
                group.add(shield);
            }

            return group;
        }

        bindEvents() {
            window.addEventListener('keydown', (event) => this.handleKeyDown(event));
            window.addEventListener('keyup', (event) => this.keys.delete(event.code));
            window.addEventListener('resize', () => this.handleResize());

            this.roleButtons.forEach((button) => {
                button.addEventListener('click', () => {
                    this.setRole(button.dataset.role);
                });
            });

            document.getElementById('restart-button').addEventListener('click', () => {
                window.location.reload();
            });
        }

        handleKeyDown(event) {
            // 防止方向键和空格键触发页面滚动
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD',
                 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
                event.preventDefault();
            }

            if (event.repeat && event.code !== 'KeyJ') {
                return;
            }

            if (event.code === 'Digit1') this.setRole('warrior');
            if (event.code === 'Digit2') this.setRole('mage');
            if (event.code === 'Digit3') this.setRole('thief');
            if (event.code === 'Digit4') this.setRole('artisan');
            if (event.code === 'Digit5') this.setRole('merchant');
            if (event.code === 'Space') this.jump();
            if (event.code === 'KeyJ') this.useAbility();

            this.keys.add(event.code);
        }

        handleResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        setRole(role) {
            if (!ROLE_CONFIG[role]) {
                return;
            }

            const previousPosition = this.playerMesh ? this.playerMesh.position.clone() : new THREE.Vector3();
            const previousRotation = this.playerMesh ? this.playerMesh.rotation.y : 0;
            if (this.playerMesh) {
                this.scene.remove(this.playerMesh);
            }

            this.currentRole = role;
            this.playerMesh = this.buildRoleMesh(role);
            this.playerMesh.position.copy(previousPosition);
            this.playerMesh.rotation.y = previousRotation;
            this.scene.add(this.playerMesh);

            this.roleButtons.forEach((button) => {
                button.classList.toggle('active', button.dataset.role === role);
            });

            const config = ROLE_CONFIG[role];
            this.setMessage(config.label + '已上场。技能：' + config.ability + '。' + config.description);
            this.updateHud();
        }

        jump() {
            if (this.finished) {
                return;
            }

            if (this.playerBody.position.y <= 1.35) {
                this.playerBody.velocity.y = 8.8;
            }
        }

        useAbility() {
            if (this.finished || this.abilityCooldown > 0) {
                return;
            }

            this.abilityCooldown = 0.7;

            if (this.currentRole === 'warrior') {
                this.warriorShockwave();
            } else if (this.currentRole === 'mage') {
                this.mageSummon();
            } else if (this.currentRole === 'thief') {
                this.thiefDash();
            } else if (this.currentRole === 'artisan') {
                this.artisanBridge();
            } else if (this.currentRole === 'merchant') {
                this.merchantMagnet();
            }
        }

        warriorShockwave() {
            const origin = this.playerBody.position;
            let hits = 0;
            this.dynamicObjects.forEach((object) => {
                const delta = object.body.position.vsub(origin);
                const distance = delta.length();
                if (distance < 6) {
                    delta.normalize();
                    object.body.applyImpulse(new CANNON.Vec3(delta.x * 8, 4, delta.z * 8), object.body.position);
                    hits += 1;
                }
            });
            this.setMessage(hits > 0 ? '战士震荡冲击生效，障碍被掀飞。' : '附近没有可击退的障碍。');
        }

        mageSummon() {
            const direction = this.getFacingDirection();
            const spawnX = this.playerBody.position.x + direction.x * 1.8;
            const spawnZ = this.playerBody.position.z + direction.z * 1.8;
            const object = this.createDynamicBox(spawnX, this.playerBody.position.y + 1.4, spawnZ, 1.2, 0x60a5fa);
            object.body.mass = 1.2;
            object.body.updateMassProperties();
            this.tempObjects.push({ body: object.body, mesh: object.mesh, ttl: 12 });
            this.setMessage('法师召唤了一个临时方块。');
        }

        thiefDash() {
            const direction = this.getFacingDirection();
            this.playerBody.velocity.x += direction.x * 12;
            this.playerBody.velocity.z += direction.z * 12;
            this.thiefBoost = 0.35;
            this.setMessage('盗贼进入冲刺状态。');
        }

        artisanBridge() {
            if (this.bridgeBuilt) {
                this.setMessage('桥已经修好了。');
                return;
            }

            const segments = [4.6, 6.2, 7.8, 9.4];
            segments.forEach((x) => {
                const mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1.35, 0.28, 3.2),
                    new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.92 })
                );
                mesh.position.set(x, 0.55, 10);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.scene.add(mesh);

                const body = new CANNON.Body({
                    mass: 0,
                    shape: new CANNON.Box(new CANNON.Vec3(0.675, 0.14, 1.6))
                });
                body.position.set(x, 0.55, 10);
                this.world.addBody(body);
                this.bridgeSegments.push({ mesh: mesh, body: body });
            });

            this.bridgeBuilt = true;
            this.objectiveText.textContent = '桥已修好。用商人收集 8 枚金币，再去终点传送门。';
            this.setMessage('工匠完成架桥，裂谷已可通行。');
        }

        merchantMagnet() {
            let pulled = 0;
            this.coins.forEach((coin) => {
                if (coin.collected) {
                    return;
                }
                const distance = coin.mesh.position.distanceTo(this.playerMesh.position);
                if (distance < 8.5) {
                    coin.collected = true;
                    coin.mesh.visible = false;
                    pulled += 1;
                    this.coinCount += 1;
                }
            });
            this.setMessage(pulled > 0 ? '商人聚财磁场吸附了 ' + pulled + ' 枚金币。' : '范围内没有金币。');
            this.updateHud();
        }

        getMoveDirection() {
            // 从摄像机实际朝向计算屏幕"前方"
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;  // 投影到水平面
            if (forward.lengthSq() < 0.0001) forward.set(1, 0, 0);
            forward.normalize();

            // 屏幕右方 = forward × world_up = (-fz, 0, fx)
            const right = new THREE.Vector3(-forward.z, 0, forward.x);

            const input = new THREE.Vector3();
            if (this.keys.has('KeyW') || this.keys.has('ArrowUp'))    input.addScaledVector(forward,  1);
            if (this.keys.has('KeyS') || this.keys.has('ArrowDown'))  input.addScaledVector(forward, -1);
            if (this.keys.has('KeyA') || this.keys.has('ArrowLeft'))  input.addScaledVector(right,   -1);
            if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) input.addScaledVector(right,    1);

            // 测试模式：无输入时也持续前进，用于验证移动链路
            if (this.autoMoveForwardTest && input.lengthSq() === 0) {
                input.add(forward);
            }

            if (input.lengthSq() > 0) input.normalize();
            return input;
        }

        getFacingDirection() {
            const input = this.getMoveDirection();
            if (input.lengthSq() > 0) return input;
            // 沿上次角色朝向
            return new THREE.Vector3(
                Math.sin(this.playerMesh.rotation.y),
                0,
                Math.cos(this.playerMesh.rotation.y)
            );
        }

        updatePlayer(delta) {
            const config = ROLE_CONFIG[this.currentRole];
            const input = this.getMoveDirection();
            const speed = config.speed * (this.thiefBoost > 0 ? 1.45 : 1);

            // 直接赋值水平速度，确保立即响应
            this.playerBody.velocity.x = input.x * speed;
            this.playerBody.velocity.z = input.z * speed;

            // rotation.y=θ 时本地+Z朝向世界(sinθ,0,cosθ)，所以用 atan2(dx,dz) 使角色正面朝移动方向
            if (input.lengthSq() > 0.001) {
                this.playerMesh.rotation.y = Math.atan2(input.x, input.z);
            }

            if (this.thiefBoost > 0) {
                this.thiefBoost = Math.max(0, this.thiefBoost - delta);
            }

            // 跌入裂谷则传送回起点
            if (this.playerBody.position.y < -8) {
                this.playerHealth = Math.max(0, this.playerHealth - 15);
                this.playerBody.position.set(-12, 3, 10);
                this.playerBody.velocity.setZero();
                this.setMessage('你跌入裂谷，被传送回起点。');
                this.updateHud();
            }
        }

        updateCoins(elapsed) {
            this.coins.forEach((coin) => {
                if (coin.collected) {
                    return;
                }
                coin.mesh.rotation.z += 0.04;
                coin.mesh.position.y = 1.3 + Math.sin(elapsed * 2 + coin.phase) * 0.25;
                if (coin.mesh.position.distanceTo(this.playerMesh.position) < 1.1) {
                    coin.collected = true;
                    coin.mesh.visible = false;
                    this.coinCount += 1;
                    this.setMessage('获得金币，当前 ' + this.coinCount + ' / ' + this.totalCoins + '。');
                    this.updateHud();
                }
            });
        }

        updateTemporaryObjects(delta) {
            for (let index = this.tempObjects.length - 1; index >= 0; index -= 1) {
                const entry = this.tempObjects[index];
                entry.ttl -= delta;
                if (entry.ttl <= 0) {
                    this.scene.remove(entry.mesh);
                    this.world.remove(entry.body);
                    this.dynamicObjects = this.dynamicObjects.filter((object) => object.body !== entry.body);
                    this.tempObjects.splice(index, 1);
                }
            }
        }

        updatePhysics() {
            this.dynamicObjects.forEach((object) => {
                object.mesh.position.copy(object.body.position);
                object.mesh.quaternion.copy(object.body.quaternion);
            });

            this.playerMesh.position.set(
                this.playerBody.position.x,
                this.playerBody.position.y - 0.65,
                this.playerBody.position.z
            );
        }

        updateCamera() {
            const target = new THREE.Vector3(
                this.playerMesh.position.x - 8,
                this.playerMesh.position.y + 6,
                this.playerMesh.position.z + 10
            );
            this.camera.position.lerp(target, 0.06);
            this.camera.lookAt(this.playerMesh.position.x + 4, this.playerMesh.position.y + 1.2, this.playerMesh.position.z);
        }

        checkVictory(elapsed) {
            this.portal.rotation.y = elapsed * 1.2;
            if (this.finished) {
                return;
            }

            const portalDistance = this.playerMesh.position.distanceTo(this.portal.position);
            if (portalDistance < 2 && this.coinCount >= this.totalCoins) {
                this.finished = true;
                this.statusValue.textContent = '任务完成';
                this.endSummary.textContent = '全部金币已收集，队伍穿过传送门，完成了这场五位一体试炼。';
                this.overlay.classList.remove('hidden');
                this.setMessage('传送门开启，任务完成。');
            } else if (portalDistance < 2) {
                this.setMessage('传送门尚未稳定，先收集全部金币。');
            }
        }

        updateHud() {
            const config = ROLE_CONFIG[this.currentRole];
            this.roleName.textContent = config.label;
            this.healthValue.textContent = String(this.playerHealth);
            this.coinValue.textContent = this.coinCount + ' / ' + this.totalCoins;

            if (this.coinCount < this.totalCoins) {
                this.statusValue.textContent = this.bridgeBuilt ? '收集金币中' : '寻找过桥方法';
            } else {
                this.statusValue.textContent = '前往传送门';
            }
        }

        setMessage(text) {
            this.messageBox.textContent = text;
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            const now = performance.now();
            const delta = Math.min(0.033, (now - this.lastTime) / 1000);
            this.lastTime = now;
            const elapsed = this.clock.getElapsedTime();

            if (!this.finished) {
                this.abilityCooldown = Math.max(0, this.abilityCooldown - delta);
                this.updatePlayer(delta);
                this.world.step(1 / 60, delta, 3);
                this.updateTemporaryObjects(delta);
                this.updateCoins(elapsed);
                this.checkVictory(elapsed);
                this.updateHud();
            }

            this.updatePhysics();
            this.updateCamera();
            this.renderer.render(this.scene, this.camera);
        }
    }

    window.addEventListener('load', function () {
        new FiveHeroesGame();
    });
}());