import { OPEN_EDITOR, OpenEditorAction } from 'modules/editor/actions'
import {
  SearchAssetsAction,
  SEARCH_ASSETS,
  SetSidebarViewAction,
  SET_SIDEBAR_VIEW,
  SELECT_CATEGORY,
  SelectCategoryAction,
  SelectAssetPackAction,
  SELECT_ASSET_PACK
} from './actions'
import { SidebarView } from './types'

export type SidebarState = {
  selectedAssetPackId: string | null
  selectedCategory: string | null
  search: string
  view: SidebarView
}

const INITIAL_STATE: SidebarState = {
  selectedAssetPackId: null,
  selectedCategory: null,
  search: '',
  view: SidebarView.GRID
}

export type SidebarReducerAction =
  | SearchAssetsAction
  | OpenEditorAction
  | SetSidebarViewAction
  | SelectCategoryAction
  | SelectAssetPackAction

export const sidebarReducer = (state = INITIAL_STATE, action: SidebarReducerAction): SidebarState => {
  switch (action.type) {
    case SEARCH_ASSETS: {
      return {
        ...state,
        search: action.payload.search.toLowerCase().trim()
      }
    }
    case SET_SIDEBAR_VIEW: {
      return {
        ...state,
        view: action.payload.view,
        selectedCategory: null
      }
    }
    case SELECT_CATEGORY: {
      return {
        ...state,
        search: '',
        selectedCategory: action.payload.category
      }
    }
    case SELECT_ASSET_PACK: {
      return {
        ...state,
        search: '',
        selectedAssetPackId: action.payload.assetPackId
      }
    }
    case OPEN_EDITOR: {
      return {
        ...INITIAL_STATE
      }
    }

    default:
      return state
  }
}
