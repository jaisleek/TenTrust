import { Property, TenantApplication, FinancialMetric } from './types';

export const mockProperties: Property[] = [
  {
    id: 'p1',
    title: '4 Bedroom Exquisite Duplex',
    location: 'Lekki Phase 1, Lagos',
    type: 'Rent', /* updated type */
    rentAmount: 8500000,
    currency: 'NGN',
    status: 'Occupied',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600',
    tenantId: 't1'
  },
  {
    id: 'p2',
    title: 'Luxury 2 Bedroom Apartment',
    location: 'Victoria Island, Lagos',
    type: 'Shortlet', /* updated type */
    rentAmount: 150000,
    currency: 'NGN',
    status: 'Vacant',
    coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p3',
    title: 'Commercial Office Space',
    location: 'Ikeja GRA, Lagos',
    type: 'Sale', /* updated type */
    rentAmount: 120000000,
    currency: 'NGN',
    status: 'Vacant',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'p4',
    title: 'Cozy Studio Apartment',
    location: 'Yaba, Lagos',
    type: 'Rent',
    rentAmount: 1200000,
    currency: 'NGN',
    status: 'Vacant',
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'
  }
];

export const mockApplications: TenantApplication[] = [
  {
    id: 'a1',
    name: 'Chukwudi Okafor',
    propertyTitle: 'Luxury 2 Bedroom Apartment',
    dateApplied: '2023-10-24',
    trustScore: 840,
    kycStatus: 'Verified',
    financialStatus: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=150',
    creditDetails: {
      paymentHistory: '100% On-Time',
      evictionRecord: 'Clean',
      casiecPreApprovedLimit: 5000000,
      incomeVerified: true
    }
  },
  {
    id: 'a2',
    name: 'Amina Bello',
    propertyTitle: 'Luxury 2 Bedroom Apartment',
    dateApplied: '2023-10-25',
    trustScore: 610,
    kycStatus: 'Pending',
    financialStatus: 'Reviewing',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=150',
    creditDetails: {
      paymentHistory: '85% On-Time',
      evictionRecord: 'Clean',
      casiecPreApprovedLimit: 1200000,
      incomeVerified: false
    }
  },
  {
    id: 'a3',
    name: 'Oluwaseun Adeyemi',
    propertyTitle: '4 Bedroom Exquisite Duplex',
    dateApplied: '2023-10-18',
    trustScore: 920,
    kycStatus: 'Verified',
    financialStatus: 'Approved',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    creditDetails: {
      paymentHistory: '100% On-Time',
      evictionRecord: 'Clean',
      casiecPreApprovedLimit: 15000000,
      incomeVerified: true
    }
  }
];

export const mockFinancials: any[] = [
  { month: 'May', paid: 12.5, expected: 12.5 },
  { month: 'Jun', paid: 14.2, expected: 14.5 },
  { month: 'Jul', paid: 18.0, expected: 18.0 },
  { month: 'Aug', paid: 21.5, expected: 22.0 },
  { month: 'Sep', paid: 24.0, expected: 24.7 },
  { month: 'Oct', paid: 24.7, expected: 28.5 },
];
