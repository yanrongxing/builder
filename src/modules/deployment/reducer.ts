import { loadingReducer, LoadingState } from 'decentraland-dapps/dist/modules/loading/reducer'
import { DataByKey } from 'decentraland-dapps/dist/lib/types'

import { DELETE_PROJECT, DeleteProjectAction } from 'modules/project/actions'
import {
  DEPLOY_TO_POOL_SUCCESS,
  DEPLOY_TO_POOL_FAILURE,
  DeployToPoolRequestAction,
  DeployToPoolSuccessAction,
  DeployToPoolFailureAction,
  SetProgressAction,
  SET_PROGRESS,
  DEPLOY_TO_LAND_SUCCESS,
  DeployToLandSuccessAction,
  MARK_DIRTY,
  MarkDirtyAction,
  ClearDeploymentSuccessAction,
  ClearDeploymentFailureAction,
  CLEAR_DEPLOYMENT_SUCCESS,
  CLEAR_DEPLOYMENT_FAILURE,
  DEPLOY_TO_LAND_FAILURE,
  DeployToLandFailureAction,
  DEPLOY_TO_POOL_REQUEST,
  DEPLOY_TO_LAND_REQUEST,
  DeployToLandRequestAction,
  CLEAR_DEPLOYMENT_REQUEST,
  ClearDeploymentRequestAction
} from './actions'
import { ProgressStage, Deployment } from './types'

export type DeploymentState = {
  data: DataByKey<Deployment>
  progress: {
    stage: ProgressStage
    value: number
  }
  loading: LoadingState
  error: string | null
}

const INITIAL_STATE: DeploymentState = {
  data: {},
  progress: {
    stage: ProgressStage.NONE,
    value: 0
  },
  loading: [],
  error: null
}

export type DeploymentReducerAction =
  | DeployToPoolRequestAction
  | DeployToPoolSuccessAction
  | DeployToPoolFailureAction
  | SetProgressAction
  | DeployToLandRequestAction
  | DeployToLandSuccessAction
  | DeployToLandFailureAction
  | MarkDirtyAction
  | ClearDeploymentRequestAction
  | ClearDeploymentSuccessAction
  | ClearDeploymentFailureAction
  | DeleteProjectAction

export const deploymentReducer = (state = INITIAL_STATE, action: DeploymentReducerAction): DeploymentState => {
  switch (action.type) {
    case DEPLOY_TO_POOL_REQUEST: {
      return {
        ...state,
        error: null
      }
    }
    case DEPLOY_TO_POOL_SUCCESS: {
      return {
        ...state,
        data: {
          ...state.data
        },
        progress: {
          stage: ProgressStage.NONE,
          value: 0
        },
        error: null
      }
    }
    case DEPLOY_TO_POOL_FAILURE: {
      return {
        ...state,
        data: {
          ...state.data
        },
        error: action.payload.error
      }
    }
    case DEPLOY_TO_LAND_REQUEST: {
      return {
        ...state,
        error: null
      }
    }
    case DEPLOY_TO_LAND_SUCCESS: {
      const { projectId, cid, placement } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [projectId]: {
            ...state.data[projectId],
            lastPublishedCID: cid,
            placement: { ...placement },
            isDirty: false
          }
        },
        progress: {
          stage: ProgressStage.NONE,
          value: 0
        }
      }
    }
    case DEPLOY_TO_LAND_FAILURE: {
      return {
        ...state,
        data: {
          ...state.data
        },
        error: action.payload.error
      }
    }
    case SET_PROGRESS: {
      const { stage, progress } = action.payload

      return {
        ...state,
        progress: {
          ...state.progress,
          stage,
          value: progress
        }
      }
    }
    case MARK_DIRTY: {
      const { projectId, isDirty } = action.payload
      return {
        ...state,
        data: {
          ...state.data,
          [projectId]: {
            ...state.data[projectId],
            isDirty: isDirty
          }
        }
      }
    }
    case CLEAR_DEPLOYMENT_REQUEST: {
      return {
        ...state,
        error: null
      }
    }
    case CLEAR_DEPLOYMENT_SUCCESS: {
      const { projectId } = action.payload
      const newState = {
        ...state,
        data: {
          ...state.data
        },
        progress: {
          stage: ProgressStage.NONE,
          value: 0
        }
      }
      delete newState.data[projectId]
      return newState
    }
    case CLEAR_DEPLOYMENT_FAILURE: {
      return {
        ...state,
        data: {
          ...state.data
        },
        loading: loadingReducer(state.loading, action),
        error: action.payload.error
      }
    }
    case DELETE_PROJECT: {
      const { project } = action.payload
      const newState = {
        ...state,
        data: {
          ...state.data
        },
        progress: {
          stage: ProgressStage.NONE,
          value: 0
        }
      }
      delete newState.data[project.id]
      return newState
    }
    default:
      return state
  }
}