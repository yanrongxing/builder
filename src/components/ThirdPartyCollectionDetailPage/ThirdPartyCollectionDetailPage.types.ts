import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Wallet } from 'decentraland-dapps/dist/modules/wallet/types'
import { Authorization } from 'decentraland-dapps/dist/modules/authorization/types'
import { openModal, OpenModalAction } from 'modules/modal/actions'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { FetchItemCurationsRequestAction } from 'modules/curations/itemCuration/actions'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { fetchThirdPartyAvailableSlotsRequest, FetchThirdPartyAvailableSlotsRequestAction } from 'modules/thirdParty/actions'
import { FetchCollectionItemsRequestAction } from 'modules/item/actions'
import { PaginatedResource } from 'modules/item/reducer'

export type Props = {
  wallet: Wallet
  collection: Collection | null
  thirdParty: ThirdParty | null
  itemsTotal: number | null
  currentPage: number
  paginatedData: PaginatedResource | null
  items: Item[]
  itemCurations: ItemCuration[]
  isOnSaleLoading: boolean
  authorizations: Authorization[]
  isLoading: boolean
  isLoadingAvailableSlots: boolean
  onNavigate: (path: string) => void
  onOpenModal: typeof openModal
  onFetchAvailableSlots: typeof fetchThirdPartyAvailableSlotsRequest
  onPageChange: (collectionId: string, page: number) => void
}

export type State = {
  itemSelectionState: Record<string, boolean>
  searchText: string
  page: number
  fetchAllPages: boolean
  isAuthModalOpen: boolean
  showSelectAllPages: boolean
}

export type MapStateProps = Pick<
  Props,
  | 'wallet'
  | 'collection'
  | 'thirdParty'
  | 'isLoading'
  | 'isLoadingAvailableSlots'
  | 'authorizations'
  | 'currentPage'
  | 'itemsTotal'
  | 'items'
  | 'paginatedData'
>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onOpenModal' | 'onFetchAvailableSlots' | 'onPageChange'>
export type MapDispatch = Dispatch<
  | CallHistoryMethodAction
  | OpenModalAction
  | FetchItemCurationsRequestAction
  | FetchThirdPartyAvailableSlotsRequestAction
  | FetchCollectionItemsRequestAction
>
