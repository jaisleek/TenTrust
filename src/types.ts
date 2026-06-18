export interface Property {
  id: string;
  title: string;
  location: string;
  type: string;
  rentAmount: number;
  currency: string;
  status: 'Occupied' | 'Vacant';
  coverImage: string;
  tenantId?: string;
}

export interface TenantApplication {
  id: string;
  name: string;
  propertyTitle: string;
  dateApplied: string;
  trustScore: number;
  kycStatus: 'Verified' | 'Pending' | 'Failed';
  financialStatus: 'Approved' | 'Reviewing';
  avatar: string;
  creditDetails: {
    paymentHistory: string;
    evictionRecord: 'Clean' | 'Flagged';
    casiecPreApprovedLimit: number;
    incomeVerified: boolean;
  };
}

export interface FinancialMetric {
  month: string;
  revenue: number;
  projected: number;
}
