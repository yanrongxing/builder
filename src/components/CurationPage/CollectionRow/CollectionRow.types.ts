import { Dispatch } from 'redux'
import { CallHistoryMethodAction } from 'connected-react-router'
import { Item } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { CollectionCuration } from 'modules/curations/collectionCuration/types'
import { FetchCollectionItemsRequestAction } from 'modules/item/actions'

export type Props = {
  collection: Collection
  curation: CollectionCuration | null
  items: Item[]
  onNavigate: (path: string) => void
  onFetchCollectionItems: (collectionId: string) => void
}

export type MapStateProps = Pick<Props, 'items'>
export type MapDispatchProps = Pick<Props, 'onNavigate' | 'onFetchCollectionItems'>
export type MapDispatch = Dispatch<CallHistoryMethodAction | FetchCollectionItemsRequestAction>
export type OwnProps = Pick<Props, 'collection' | 'curation'>
