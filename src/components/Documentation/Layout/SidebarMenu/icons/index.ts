import { ReactComponent as HouseIcon } from './house.svg'

export type SidebarIcons = { [key: string]: React.FC<{ className?: string }> }

const ICONS: SidebarIcons = {
  house: HouseIcon
}

export default ICONS
