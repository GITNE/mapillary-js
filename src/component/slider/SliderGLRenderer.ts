import {
    IBBoxShaderMaterial,
    IShaderMaterial,
    MeshFactory,
    MeshScene,
} from "../../Component";
import {Node} from "../../Graph";
import {
    ICurrentState,
    IFrame,
} from "../../State";

export class SliderGLRenderer {
    private _factory: MeshFactory;
    private _scene: MeshScene;

    private _currentKey: string;
    private _previousKey: string;
    private _currentPano: boolean;

    private _curtain: number;
    private _frameId: number;
    private _needsRender: boolean;

    constructor() {
        this._factory = new MeshFactory();
        this._scene = new MeshScene();

        this._currentKey = null;
        this._previousKey = null;
        this._currentPano = false;

        this._curtain = 1;
        this._frameId = 0;
        this._needsRender = false;
    }

    public get disabled(): boolean {
        return this._currentKey == null ||
            this._previousKey == null ||
            this._currentPano;
    }

    public get frameId(): number {
        return this._frameId;
    }

    public get needsRender(): boolean {
        return this._needsRender;
    }

    public update(frame: IFrame): void {
        this._updateFrameId(frame.id);
        this._updateImagePlanes(frame.state);
    }

    public updateCurtain(curtain: number): void {
        if (this.disabled || Math.abs(this._curtain - curtain) < 0.001) {
            return;
        }

        this._curtain = curtain;
        this._updateBbox();

        this._needsRender = true;
    }

    public updateTexture(image: HTMLImageElement, node: Node): void {
        let imagePlanes: THREE.Mesh[] = node.key === this._currentKey ?
            this._scene.imagePlanes :
            node.key === this._previousKey ?
                this._scene.imagePlanesOld :
                [];

        if (imagePlanes.length === 0) {
            return;
        }

        this._needsRender = true;

        for (let plane of imagePlanes) {
            let material: IShaderMaterial = <IShaderMaterial>plane.material;
            let texture: THREE.Texture = <THREE.Texture>material.uniforms.projectorTex.value;

            texture.image = image;
            texture.needsUpdate = true;
        }
    }

    public render(
        perspectiveCamera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer): void {

        if (!this.disabled) {
            renderer.render(this._scene.sceneOld, perspectiveCamera);
        }

        renderer.render(this._scene.scene, perspectiveCamera);

        this._needsRender = false;
    }

    public dispose(): void {
        this._scene.clear();
    }

    private _updateBbox(): void {
        for (let plane of this._scene.imagePlanes) {
            let shaderMaterial: IBBoxShaderMaterial = <IBBoxShaderMaterial>plane.material;
            let bbox: THREE.Vector4 = <THREE.Vector4>shaderMaterial.uniforms.bbox.value;

            bbox.z = this._curtain;
        }
    }

    private _updateFrameId(frameId: number): void {
        this._frameId = frameId;
    }

    private _updateImagePlanes(state: ICurrentState): void {
        if (state.currentNode == null) {
            return;
        }

        if (state.previousNode != null && this._previousKey !== state.previousNode.key) {
            this._needsRender = true;

            this._previousKey = state.previousNode.key;
            this._scene.setImagePlanesOld([
                this._factory.createMesh(state.previousNode, state.previousTransform),
            ]);
        }

        if (this._currentKey !== state.currentNode.key) {
            this._needsRender = true;

            this._currentKey = state.currentNode.key;
            this._currentPano = state.currentNode.pano;
            this._scene.setImagePlanes([
                this._factory.createCurtainMesh(state.currentNode, state.currentTransform),
            ]);

            if (!this.disabled) {
                this._updateBbox();
            }
        }
    }
}

export default SliderGLRenderer;
