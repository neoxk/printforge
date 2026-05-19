import { PrintAreasDesigner } from './PrintAreasDesigner'

type Props = React.ComponentProps<typeof PrintAreasDesigner>

export function PrintAreasTab(props: Props) {
  return <PrintAreasDesigner {...props} />
}
