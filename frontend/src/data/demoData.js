export const demoAccount = {
  accountId: 1001,
  accountName: "Primary Savings",
  accountType: "SAVINGS",
  balance: 84500.75,
};

export const demoRecipients = [
  { name: "Rahul", upiId: "rahul@hcl", bankName: "HCL Bank", accountId: 2001 },
  { name: "Anjali", upiId: "anjali@hcl", bankName: "HCL Bank", accountId: 2002 },
  { name: "Vikram", upiId: "vikram@hcl", bankName: "HCL Bank", accountId: 2003 },
  { name: "Sneha", upiId: "sneha@hcl", bankName: "HCL Bank", accountId: 2004 },
  { name: "Amit", upiId: "amit@hcl", bankName: "HCL Bank", accountId: 2005 },
  { name: "Priya", upiId: "priya@hcl", bankName: "HCL Bank", accountId: 2006 },
];

export const demoTransactions = [
  {
    date: "2026-02-15T10:32:00",
    amount: 2500,
    type: "DEBIT",
    otherParty: "Rahul's Savings",
    status: "SUCCESS",
  },
  {
    date: "2026-02-14T16:18:00",
    amount: 12000,
    type: "CREDIT",
    otherParty: "Salary Credit",
    status: "SUCCESS",
  },
  {
    date: "2026-02-13T09:05:00",
    amount: 799,
    type: "DEBIT",
    otherParty: "Utility Bill",
    status: "SUCCESS",
  },
  {
    date: "2026-02-12T20:44:00",
    amount: 560,
    type: "DEBIT",
    otherParty: "Priya's Savings",
    status: "SUCCESS",
  },
  {
    date: "2026-02-11T11:50:00",
    amount: 1800,
    type: "CREDIT",
    otherParty: "Refund",
    status: "SUCCESS",
  },
];

export const demoAdminUsers = [
  { userId: 1, userName: "admin", email: "admin@hcl.com", upiId: "admin@hcl", role: "ADMIN", kycCompleted: true },
  { userId: 2, userName: "rahul", email: "rahul@hcl.com", upiId: "rahul@hcl", role: "CUSTOMER", kycCompleted: true },
  { userId: 3, userName: "anjali", email: "anjali@hcl.com", upiId: "anjali@hcl", role: "CUSTOMER", kycCompleted: true },
  { userId: 4, userName: "vikram", email: "vikram@hcl.com", upiId: "vikram@hcl", role: "CUSTOMER", kycCompleted: false },
];
