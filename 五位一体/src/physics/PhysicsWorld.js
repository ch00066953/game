// 物理世界管理器
export class PhysicsWorld {
    constructor() {
        // 创建物理世界
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0); // 标准重力
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // 存储物理刚体
        this.bodies = [];
        
        // 创建地面平面
        this.createGround();
    }

    createGround() {
        // 创建地面刚体
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 }); // 质量为0表示静态物体
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(1, 0, 0),
            -Math.PI / 2
        ); // 旋转平面使其朝上
        this.world.addBody(groundBody);
        this.bodies.push(groundBody);
    }

    addBox(x, y, z, width, height, depth) {
        // 创建盒子形状
        const shape = new CANNON.Box(
            new CANNON.Vec3(width / 2, height / 2, depth / 2)
        );
        
        // 创建刚体
        const body = new CANNON.Body({
            mass: 5, // 给一个质量，使它成为动态物体
            position: new CANNON.Vec3(x, y, z)
        });
        
        body.addShape(shape);
        this.world.addBody(body);
        this.bodies.push(body);
        
        return body;
    }

    addSphere(x, y, z, radius) {
        // 创建球形形状
        const shape = new CANNON.Sphere(radius);
        
        // 创建刚体
        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(x, y, z)
        });
        
        body.addShape(shape);
        this.world.addBody(body);
        this.bodies.push(body);
        
        return body;
    }

    update() {
        // 更新物理世界，dt为时间步长
        this.world.step(1/60); // 使用固定的步长以确保稳定性
    }

    // 获取所有物理刚体，用于同步Three.js视觉对象
    getBodies() {
        return this.bodies;
    }
}