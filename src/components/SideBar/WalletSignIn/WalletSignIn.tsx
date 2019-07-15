import React from 'react'
import { WalletIcon, Button } from 'decentraland-ui'
import { T, t } from 'decentraland-dapps/dist/modules/translation/utils'

import { Props } from './WalletSignIn.types'
import './WalletSignIn.css'

const ethereum = (window as any)['ethereum']

export default class WalletSignIn extends React.PureComponent<Props> {
  handleConnect = () => {
    this.props.onConnect!()
  }

  handlePromoClick = () => {
    this.props.onOpenModal('AdBlockModal', { origin: 'Wallet Connect Dapper CTA' })
  }

  render() {
    const { hasError, isConnecting } = this.props
    const shouldRenderPromo = !ethereum || !ethereum.isDapper
    let errorClasses = 'error'

    if (hasError) {
      errorClasses += ' visible'
    }
    return (
      <div className="WalletSignIn">
        <div className="main">
          <WalletIcon />
          <span className="message">{t('wallet.title')}</span>
          <Button className="connect" primary onClick={this.handleConnect} disabled={isConnecting}>
            {isConnecting ? <T id="@dapps.sign_in.connecting" /> : <T id="@dapps.sign_in.connect" />}
          </Button>

          <p className={errorClasses}>
            <T id="@dapps.sign_in.error" />
          </p>
        </div>
        {shouldRenderPromo && (
          <div className="promo">
            <div className="logo" />
            <span className="header">{t('wallet.promo_title')}</span>
            <span className="message">
              <T
                id="wallet.promo_body"
                values={{
                  cta: <a onClick={this.handlePromoClick}>{t('wallet.promo_cta')}</a>
                }}
              />
            </span>
          </div>
        )}
      </div>
    )
  }
}