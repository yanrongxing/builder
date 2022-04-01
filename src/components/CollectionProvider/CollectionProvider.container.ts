import { connect } from 'react-redux'
import { isLoadingType } from 'decentraland-dapps/dist/modules/loading/selectors'
import { isConnected } from 'decentraland-dapps/dist/modules/wallet/selectors'
import { RootState } from 'modules/common/types'
import { getCollectionId } from 'modules/location/selectors'
import { getPaginatedCollectionItems, getLoading as getLoadingItems, getCollectionItems } from 'modules/item/selectors'
import {
  fetchAllCollectionItemsRequest,
  fetchCollectionItemsRequest,
  FETCH_ALL_COLLECTION_ITEMS_REQUEST,
  FETCH_COLLECTION_ITEMS_REQUEST
} from 'modules/item/actions'
import { getLoading, getCollection } from 'modules/collection/selectors'
import { FETCH_COLLECTION_REQUEST, fetchCollectionRequest } from 'modules/collection/actions'
import { getItemCurations, getLoading as getLoadingItemCurations } from 'modules/curations/itemCuration/selectors'
import {
  MapStateProps,
  MapDispatchProps,
  MapDispatch,
  OwnProps,
  DEFAULT_ITEMS_PAGE_SIZE,
  DEFAULT_ITEMS_PAGE
} from './CollectionProvider.types'
import CollectionProvider from './CollectionProvider'
import { getCuration } from 'modules/curations/collectionCuration/selectors'
import { FETCH_ITEM_CURATIONS_REQUEST } from 'modules/curations/itemCuration/actions'

const mapState = (state: RootState, ownProps: OwnProps): MapStateProps => {
  const id = ownProps.id || getCollectionId(state)
  const collection = id ? getCollection(state, id) : null
  const pagesAsked = ownProps.itemsPage
    ? Array.isArray(ownProps.itemsPage)
      ? ownProps.itemsPage
      : [ownProps.itemsPage]
    : [DEFAULT_ITEMS_PAGE]

  const items = collection ? getCollectionItems(state, collection.id) : []
  const paginatedItems = collection
    ? getPaginatedCollectionItems(state, collection.id, pagesAsked, ownProps.itemsPageSize || DEFAULT_ITEMS_PAGE_SIZE)
    : []
  const itemCurations = collection ? getItemCurations(state, collection.id) : []
  const curation = id ? getCuration(state, id) : null
  return {
    id,
    collection,
    items,
    paginatedItems,
    itemCurations,
    curation,
    isConnected: isConnected(state),
    isLoading:
      isLoadingType(getLoading(state), FETCH_COLLECTION_REQUEST) ||
      isLoadingType(getLoadingItemCurations(state), FETCH_ITEM_CURATIONS_REQUEST) ||
      isLoadingType(getLoadingItems(state), FETCH_COLLECTION_ITEMS_REQUEST) ||
      isLoadingType(getLoadingItems(state), FETCH_ALL_COLLECTION_ITEMS_REQUEST)
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onFetchCollection: id => dispatch(fetchCollectionRequest(id)),
  onFetchCollectionItems: (id, page, limit) => dispatch(fetchCollectionItemsRequest(id, page, limit)),
  onFetchAllCollectionItems: (id, pages, limit) => dispatch(fetchAllCollectionItemsRequest(id, pages, limit))
})

export default connect(mapState, mapDispatch)(CollectionProvider)
