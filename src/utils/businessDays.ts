
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let businessDays = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
}

export function addBusinessDays(startDate: Date, daysToAdd: number): Date {
  let result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return result;
}

export function getDeadlineStatus(deadline: string | null, isReady: boolean) {
  if (!deadline || !isReady) return null;
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const isPastDeadline = now > deadlineDate;
  
  if (isPastDeadline) {
    return {
      status: 'expired',
      message: 'Taxa de R$ 100,00',
      daysRemaining: 0
    };
  }
  
  const daysRemaining = calculateBusinessDays(now, deadlineDate);
  
  return {
    status: 'active',
    message: `${daysRemaining} dias úteis restantes`,
    daysRemaining
  };
}
