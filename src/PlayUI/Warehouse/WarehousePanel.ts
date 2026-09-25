import { TacticalInventoryPanel } from '../CommonUI/TacticalInventoryPanel';
const {regClass}=Laya;
@regClass()
export class WarehousePanel extends TacticalInventoryPanel {
    protected warehouseMode=true;
}
