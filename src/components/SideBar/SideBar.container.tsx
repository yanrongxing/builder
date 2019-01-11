import { connect } from 'react-redux'

import { RootState, RootDispatch, Vector3 } from 'modules/common/types'
import { getCategories, isLoading } from 'modules/category/selectors'
import { addAsset, AddAssetAction } from 'modules/scene/actions'
import { AssetResource } from 'modules/asset/types'
import { MapStateProps, MapDispatchProps } from './SideBar.types'
import SideBar from './SideBar'

const mapState = (state: RootState): MapStateProps => ({
  categories: getCategories(state),
  isLoading: isLoading(state)
})

const mapDispatch = (dispatch: RootDispatch<AddAssetAction>): MapDispatchProps => ({
  onAddAsset: (asset: AssetResource, position: Vector3) => dispatch(addAsset(asset, position))
})

export default connect(
  mapState,
  mapDispatch
)(SideBar)
