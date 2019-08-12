import { utils } from 'decentraland-commons'
import { Omit } from 'decentraland-dapps/dist/lib/types'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { takeLatest, put, select, call, take } from 'redux-saga/effects'
import { getCurrentProject, getData as getProjects } from 'modules/project/selectors'
import { Coordinate, Rotation, Deployment, ContentServiceValidation } from 'modules/deployment/types'
import { Project } from 'modules/project/types'

import { api } from 'lib/api'
import {
  DEPLOY_TO_POOL_REQUEST,
  deployToPoolFailure,
  deployToPoolSuccess,
  setProgress,
  DEPLOY_TO_LAND_REQUEST,
  deployToLandFailure,
  DeployToLandRequestAction,
  DeployToPoolRequestAction,
  deployToLandSuccess,
  markDirty,
  CLEAR_DEPLOYMENT_REQUEST,
  ClearDeploymentRequestAction,
  clearDeploymentFailure,
  clearDeploymentSuccess,
  QUERY_REMOTE_CID,
  QueryRemoteCIDAction,
  LOAD_DEPLOYMENTS_REQUEST,
  LoadDeploymentsRequestAction,
  loadDeploymentsFailure,
  loadDeploymentsSuccess,
  loadDeploymentsRequest
} from './actions'
import { store } from 'modules/common/store'
import { Media } from 'modules/media/types'
import { getMedia } from 'modules/media/selectors'
import { createFiles, EXPORT_PATH, createGameFileBundle } from 'modules/project/export'
import { recordMediaRequest, RECORD_MEDIA_SUCCESS, RecordMediaSuccessAction } from 'modules/media/actions'
import { ADD_ITEM, DROP_ITEM, RESET_ITEM, DUPLICATE_ITEM, DELETE_ITEM, SET_GROUND, UPDATE_TRANSFORM } from 'modules/scene/actions'
import { makeContentFile, getFileManifest, buildUploadRequestMetadata, getCID } from './utils'
import { ContentServiceFile, ProgressStage } from './types'
import { getCurrentDeployment, getDeployment } from './selectors'
import { SET_PROJECT } from 'modules/project/actions'
import { signMessage } from 'modules/wallet/sagas'
import { objectURLToBlob } from 'modules/media/utils'
import { AUTH_SUCCESS, AuthSuccessAction } from 'modules/auth/actions'
import { getSub } from 'modules/auth/selectors'
import { getSceneByProjectId } from 'modules/scene/utils'

const blacklist = ['.dclignore', 'Dockerfile', 'builder.json', 'src/game.ts']

const handleProgress = (type: ProgressStage) => (args: { loaded: number; total: number }) => {
  const { loaded, total } = args
  const progress = ((loaded / total) * 100) | 0
  store.dispatch(setProgress(type, progress))
}

export function* deploymentSaga() {
  yield takeLatest(DEPLOY_TO_POOL_REQUEST, handleDeployToPoolRequest)
  yield takeLatest(DEPLOY_TO_LAND_REQUEST, handleDeployToLandRequest)
  yield takeLatest(CLEAR_DEPLOYMENT_REQUEST, handleClearDeploymentRequest)
  yield takeLatest(QUERY_REMOTE_CID, handleQueryRemoteCID)
  yield takeLatest(ADD_ITEM, handleMarkDirty)
  yield takeLatest(DROP_ITEM, handleMarkDirty)
  yield takeLatest(RESET_ITEM, handleMarkDirty)
  yield takeLatest(DUPLICATE_ITEM, handleMarkDirty)
  yield takeLatest(DELETE_ITEM, handleMarkDirty)
  yield takeLatest(SET_GROUND, handleMarkDirty)
  yield takeLatest(UPDATE_TRANSFORM, handleMarkDirty)
  yield takeLatest(SET_PROJECT, handleMarkDirty)
  yield takeLatest(LOAD_DEPLOYMENTS_REQUEST, handleFetchDeploymentsRequest)
  yield takeLatest(AUTH_SUCCESS, handleAuthSuccess)
}

function* handleMarkDirty() {
  const project: Project | null = yield select(getCurrentProject)
  const deployment: Deployment | null = yield select(getCurrentDeployment)
  if (project && deployment && !deployment.isDirty) {
    yield put(markDirty(project.id))
  }
}

function* handleDeployToPoolRequest(_: DeployToPoolRequestAction) {
  const rawProject: Project | null = yield select(getCurrentProject)

  if (rawProject) {
    const project: Omit<Project, 'thumbnail'> = utils.omit(rawProject, ['thumbnail'])

    try {
      yield put(recordMediaRequest())
      const successAction: RecordMediaSuccessAction = yield take(RECORD_MEDIA_SUCCESS)
      const { north, east, south, west, preview } = successAction.payload.media

      if (!north || !east || !south || !west || !preview) {
        throw new Error('Failed to capture scene preview')
      }

      yield call(() =>
        api.uploadMedia(rawProject.id, preview, { north, east, south, west }, handleProgress(ProgressStage.UPLOAD_RECORDING))
      )
      yield call(() => api.deployToPool(project.id))

      yield put(deployToPoolSuccess(window.URL.createObjectURL(preview)))
    } catch (e) {
      yield put(deployToPoolFailure(e.message))
    }
  } else {
    yield put(deployToPoolFailure('Unable to Publish: Invalid project'))
  }
}

function* handleDeployToLandRequest(action: DeployToLandRequestAction) {
  const { placement, projectId } = action.payload
  const ethAddress = yield select(getAddress)
  const userId = yield select(getSub)
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const project = projects[projectId]

  if (project) {
    try {
      const contentFiles: ContentServiceFile[] = yield getContentServiceFiles(project, placement.point, placement.rotation)
      const rootCID = yield call(() => getCID(contentFiles, true))
      const manifest = yield call(() => getFileManifest(contentFiles))
      const timestamp = Math.round(Date.now() / 1000)
      const signature = yield signMessage(`${rootCID}.${timestamp}`)
      const metadata = buildUploadRequestMetadata(rootCID, signature, ethAddress, timestamp, userId)
      const media: Media | null = yield select(getMedia)
      if (media) {
        const north: Blob = yield call(() => objectURLToBlob(media.north))
        const east: Blob = yield call(() => objectURLToBlob(media.east))
        const south: Blob = yield call(() => objectURLToBlob(media.south))
        const west: Blob = yield call(() => objectURLToBlob(media.west))
        const thumbnail: Blob = yield call(() => objectURLToBlob(media.preview))

        yield call(() =>
          api.uploadMedia(project.id, thumbnail, { north, east, south, west }, handleProgress(ProgressStage.UPLOAD_RECORDING))
        )
      } else {
        console.warn('Failed to upload scene preview')
      }

      yield call(() => api.uploadContent(rootCID, manifest, metadata, contentFiles, handleProgress(ProgressStage.UPLOAD_SCENE_ASSETS)))

      // generate new deployment
      const deployment: Deployment = {
        id: project.id,
        lastPublishedCID: rootCID,
        placement,
        isDirty: false,
        userId: yield select(getSub),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // notify success
      yield put(deployToLandSuccess(deployment))
    } catch (e) {
      yield put(deployToLandFailure(e.message.split('\n')[0]))
    }
  } else {
    yield put(deployToLandFailure('Unable to Publish: Invalid project'))
  }
}

function* handleQueryRemoteCID(action: QueryRemoteCIDAction) {
  const { projectId } = action.payload
  const deployment: Deployment | null = yield select(getDeployment(projectId))
  if (!deployment) return
  const { x, y } = deployment.placement.point
  try {
    const res: ContentServiceValidation = yield call(() => api.fetchValidation(x, y))
    const lastPublishedCID: string | null = deployment.lastPublishedCID
    const remoteCID = res.root_cid

    if (!deployment.isDirty) {
      const isSynced = remoteCID === lastPublishedCID
      yield put(markDirty(projectId, !isSynced))
    }
  } catch (e) {
    // error handling
  }
}

function* handleClearDeploymentRequest(action: ClearDeploymentRequestAction) {
  const { projectId } = action.payload
  const ethAddress = yield select(getAddress)
  const userId = yield select(getSub)
  const deployment: Deployment | null = yield select(getDeployment(projectId))
  const projects: ReturnType<typeof getProjects> = yield select(getProjects)
  const project = projects[projectId]

  if (project && deployment) {
    try {
      const { placement } = deployment
      const contentFiles: ContentServiceFile[] = yield getContentServiceFiles(project, placement.point, placement.rotation, true)
      const rootCID = yield call(() => getCID(contentFiles, true))
      const manifest = yield call(() => getFileManifest(contentFiles))
      const timestamp = Math.round(Date.now() / 1000)
      const signature = yield signMessage(`${rootCID}.${timestamp}`)
      const metadata = buildUploadRequestMetadata(rootCID, signature, ethAddress, timestamp, userId)

      yield call(() => api.uploadContent(rootCID, manifest, metadata, contentFiles, handleProgress(ProgressStage.UPLOAD_SCENE_ASSETS)))
      yield put(clearDeploymentSuccess(projectId))
    } catch (e) {
      yield put(clearDeploymentFailure(e.message))
    }
  } else {
    yield put(clearDeploymentFailure('Unable to Publish: Invalid project'))
  }
}

function* getContentServiceFiles(project: Project, point: Coordinate, rotation: Rotation, createEmptyGame: boolean = false) {
  const scene = yield getSceneByProjectId(project.id)

  const files = yield call(() =>
    createFiles({
      project,
      scene,
      point,
      rotation,
      onProgress: handleProgress(ProgressStage.CREATE_FILES)
    })
  )

  let contentFiles: ContentServiceFile[] = []

  for (const fileName of Object.keys(files)) {
    if (blacklist.includes(fileName)) continue
    let file: ContentServiceFile
    if (fileName === EXPORT_PATH.BUNDLED_GAME_FILE && createEmptyGame) {
      file = yield call(() => makeContentFile(fileName, createGameFileBundle('')))
    } else {
      file = yield call(() => makeContentFile(fileName, files[fileName]))
    }
    contentFiles.push(file)
  }

  return contentFiles
}

function* handleFetchDeploymentsRequest(_action: LoadDeploymentsRequestAction) {
  try {
    const deployments: Deployment[] = yield call(() => api.fetchDeployments())
    yield put(loadDeploymentsSuccess(deployments))
  } catch (e) {
    yield put(loadDeploymentsFailure(e.message))
  }
}

function* handleAuthSuccess(_action: AuthSuccessAction) {
  yield put(loadDeploymentsRequest())
}
