import { connect } from 'react-redux'
import { getLocation, push } from 'connected-react-router'
import { isPending } from 'decentraland-dapps/dist/modules/transaction/utils'
import { getData as getProfiles } from 'decentraland-dapps/dist/modules/profile/selectors'
import { getAddress } from 'decentraland-dapps/dist/modules/wallet/selectors'

import { RootState } from 'modules/common/types'
import { logout } from 'modules/identity/actions'
import { isLoggedIn, isLoggingIn } from 'modules/identity/selectors'
import { getTransactions } from 'modules/transaction/selectors'
import { MapStateProps, MapDispatch, MapDispatchProps } from './UserMenu.types'
import UserMenu from './UserMenu'

const mapState = (state: RootState): MapStateProps => {
  const address = getAddress(state)
  return {
    address,
    profile: getProfiles(state)[address!],
    isLoggedIn: isLoggedIn(state),
    isLoggingIn: isLoggingIn(state),
    pathname: getLocation(state).pathname,
    hasPendingTransactions: getTransactions(state).some(tx => isPending(tx.status))
  }
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onLogout: () => dispatch(logout()),
  onNavigate: path => dispatch(push(path))
})

export default connect(mapState, mapDispatch)(UserMenu)
