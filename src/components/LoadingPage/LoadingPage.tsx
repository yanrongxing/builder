import * as React from 'react'
import { Loader, Page } from 'decentraland-ui'
// import Ad from 'decentraland-ad/lib/Ad/Ad'

import Navbar from '../Navbar'
import Footer from '../Footer'

export default class LoadingPage extends React.PureComponent {
  render() {
    return (
      <>
        {/* <Ad slot="BUILDER_TOP_BANNER" type="full" /> */}
        <Navbar isFullscreen />
        <Page isFullscreen>
          <Loader active size="huge" />
        </Page>
        <Footer isFullscreen />
      </>
    )
  }
}
