import { Item } from 'modules/item/types'
import { Props as BadgeProps } from '../ItemBadge/ItemBadge.types'

export type Props = {
  className?: string
  item: Item
  src?: string
  hasBadge?: boolean
  badgeSize?: BadgeProps['size']
}
