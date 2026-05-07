// Account details management

export interface AccountDetails {
  id: string;
  userId: string;
  bankName: string;
  bankAccountNumber: string;
  ageGroup?: string;
  course?: string;
  yearsExperience?: number;
  certificates?: string;
  coveringLetter?: string;
  updatedAt: string;
}

const ACCOUNT_DETAILS_KEY = 'tavonlex_account_details';

// Initialize account details storage
export function initializeAccountDetails() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(ACCOUNT_DETAILS_KEY)) {
    localStorage.setItem(ACCOUNT_DETAILS_KEY, JSON.stringify([]));
  }
}

// Get all account details
function getAllAccountDetails(): AccountDetails[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ACCOUNT_DETAILS_KEY);
  return data ? JSON.parse(data) : [];
}

// Get account details for a user
export function getUserAccountDetails(userId: string): AccountDetails | null {
  const details = getAllAccountDetails();
  return details.find(d => d.userId === userId) || null;
}

// Create or update account details
export function saveAccountDetails(
  userId: string,
  bankName: string,
  bankAccountNumber: string,
  additionalData?: Partial<AccountDetails>
): AccountDetails {
  const details = getAllAccountDetails();
  const existingIndex = details.findIndex(d => d.userId === userId);

  const accountDetails: AccountDetails = {
    id: existingIndex !== -1 ? details[existingIndex].id : `account_${Date.now()}`,
    userId,
    bankName,
    bankAccountNumber,
    ...additionalData,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    details[existingIndex] = { ...details[existingIndex], ...accountDetails };
  } else {
    details.push(accountDetails);
  }

  localStorage.setItem(ACCOUNT_DETAILS_KEY, JSON.stringify(details));
  return accountDetails;
}

// Update account details
export function updateAccountDetails(userId: string, updates: Partial<AccountDetails>): AccountDetails {
  const details = getAllAccountDetails();
  const index = details.findIndex(d => d.userId === userId);

  if (index === -1) {
    throw new Error('Account details not found');
  }

  const updatedDetails = {
    ...details[index],
    ...updates,
    userId, // Ensure userId doesn't change
    updatedAt: new Date().toISOString(),
  };

  details[index] = updatedDetails;
  localStorage.setItem(ACCOUNT_DETAILS_KEY, JSON.stringify(details));

  return updatedDetails;
}

// Delete account details
export function deleteAccountDetails(userId: string): void {
  const details = getAllAccountDetails();
  const filtered = details.filter(d => d.userId !== userId);
  localStorage.setItem(ACCOUNT_DETAILS_KEY, JSON.stringify(filtered));
}

// Delete all data for a user (for account deletion)
export function deleteAllUserData(userId: string): void {
  deleteAccountDetails(userId);
}
