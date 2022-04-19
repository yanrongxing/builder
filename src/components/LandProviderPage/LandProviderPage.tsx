import * as React from 'react'
import { Page, Loader, Center } from 'decentraland-ui'
import Navbar from '../Navbar'
import Footer from '../Footer'
import NotFound from '../NotFound'
import LandProvider from '../LandProvider'
import { Props } from './LandProviderPage.types'
import './LandProviderPage.css'

export default class LandProviderPage extends React.PureComponent<Props> {
  renderLoading() {
    return (
      <Center>
        <Loader active size="large" />
      </Center>
    )
  }

  renderNotFound() {
    return <NotFound />
  }

  render() {
    const { className, children } = this.props
    const classes = ['LandProviderPage']
    if (className) {
      classes.push(className)
    }
    return (
      <>
        <Navbar isFullscreen />
        <Page className={classes.join(' ')}>
          <LandProvider>
            {(id, land, deployments, isLoading) => (
              <>
                {isLoading ? this.renderLoading() : null}
                {!isLoading && !(id && land) ? this.renderNotFound() : null}
                {id && land ? children(land, deployments) : null}
              </>
            )}
          </LandProvider>
        </Page>
        <Footer />
      </>
    )
  }
}
