import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders'

type Options = {
  width: number
  height: number
  extension: string
  mappings?: Record<string, string>
  thumbnailType: ThumbnailType
}

export enum ThumbnailType {
  DEFAULT = 'default',
  TOP = 'top',
  FRONT = 'front'
}

const defaults: Options = {
  width: 512,
  height: 512,
  thumbnailType: ThumbnailType.DEFAULT,
  extension: 'gltf'
}

export async function getModelData2(url: string, options: Partial<Options> = {}) {
  // add defaults to options
  const { width, height, extension } = {
    ...defaults,
    ...options
  }

  const canvas = document.createElement('Canvas') as HTMLCanvasElement
  canvas.width = width
  canvas.height = height
  canvas.hidden = true

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true
  })
  // GLTFFileLoader.IncrementalLoading = false
  // console.log(OBJFileLoader.name)
  // Create a basic BJS Scene object
  let scene = new BABYLON.Scene(engine)
  scene.autoClear = true
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)

  let pluginName = ''

  BABYLON.SceneLoader.OnPluginActivatedObservable.add(plugin => {
    pluginName = plugin.name
  })

  // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
  // var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
  // let ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false)
  // Return the created scene
  scene = await new Promise<BABYLON.Scene>((res, rej) => BABYLON.SceneLoader.Append(url, '', scene, res, null, rej, '.' + extension))
  prepareCamera(scene, pluginName)
  prepareLighting(scene)

  const image = await new Promise<string>((res, _) =>
    scene.onReadyObservable.addOnce(() => {
      for (let material of scene.materials) {
        if (material.name.toLowerCase().includes('hair_mat')) {
          material.alpha = 0
          scene.removeMaterial(material)
        }
      }

      for (let texture of scene.textures) {
        if (texture.name.toLowerCase().includes('hair_mat')) {
          texture.dispose()
          scene.removeTexture(texture)
        }
      }

      BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, scene.activeCamera!, 1024, res, undefined, undefined, true)
    })
  )

  return {
    info: {
      triangles: 0,
      materials: 0,
      textures: 0,
      meshes: 0,
      bodies: 0,
      entities: 1
    },
    image
  }
}

function prepareCamera(scene: BABYLON.Scene, pluginName: string) {
  // Attach camera to canvas inputs
  if (!scene.activeCamera) {
    scene.createDefaultCamera(true)

    const camera = scene.activeCamera! as BABYLON.ArcRotateCamera

    if (pluginName === 'gltf') {
      // glTF assets use a +Z forward convention while the default camera faces +Z. Rotate the camera to look at the front of the asset.
      camera.alpha += Math.PI
    }

    // Enable camera's behaviors
    camera.useFramingBehavior = true

    let framingBehavior = camera.getBehaviorByName('Framing') as BABYLON.FramingBehavior

    framingBehavior.framingTime = 0
    framingBehavior.elevationReturnTime = -1

    if (scene.meshes.length) {
      camera.lowerRadiusLimit = null

      let worldExtends = scene.getWorldExtends((mesh: BABYLON.AbstractMesh) => {
        return mesh.isVisible && mesh.isEnabled()
      })
      framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max)
    }

    // camera.useAutoRotationBehavior = true

    // if (this.props.cameraPosition) {
    //  camera.setPosition(this.props.cameraPosition)
    // }

    camera.pinchPrecision = 200 / camera.radius
    camera.upperRadiusLimit = 5 * camera.radius

    camera.wheelDeltaPercentage = 0.01
    camera.pinchDeltaPercentage = 0.01
  }

  scene.activeCamera!.attachControl()
}

function prepareLighting(scene: BABYLON.Scene) {
  scene.createDefaultLight()
}
