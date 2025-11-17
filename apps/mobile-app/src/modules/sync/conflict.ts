export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge';
  merged?: any;
}

export function resolveConflict(
  serverData: any,
  clientData: any,
  strategy: ConflictResolution['strategy'] = 'server-wins'
): ConflictResolution {
  switch (strategy) {
    case 'server-wins':
      return {
        strategy: 'server-wins',
        merged: serverData,
      };
    
    case 'client-wins':
      return {
        strategy: 'client-wins',
        merged: clientData,
      };
    
    case 'merge':
      return {
        strategy: 'merge',
        merged: {
          ...clientData,
          ...serverData,
          // 对于数量类字段，使用服务器值（权威）
          actualQty: serverData.actualQty ?? clientData.actualQty,
          updatedAt: Math.max(
            serverData.updatedAt || 0,
            clientData.updatedAt || 0
          ),
        },
      };
    
    default:
      return {
        strategy: 'server-wins',
        merged: serverData,
      };
  }
}

