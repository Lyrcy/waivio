// eslint-disable-next-line import/prefer-default-export
export const mockData = {
  authUserName: 'vallon',
  getUserInBlackList: () => {},
  isBlackListUser: false,
  isAuthenticated: true,
  isGuest: false,
  confirmRules: () => {},
  rejectRules: () => {},
  userReferralInfo: () => {},
  referralStatus: 'rejected',
  isStartChangeRules: false,
  isStartGetReferralInfo: false,
};

export const mockDataView = {
  isBlackListUser: false,
  isAuthenticated: true,
  rejectRules: jest.fn(),
  isStartChangeRules: false,
  isStartGetReferralInfo: false,
  handleAgreeRulesCheckbox: jest.fn(),
  handleOkButton: jest.fn(),
  handleCancelButton: jest.fn(),
  currentCopyText: '',
  authUserName: 'vallon',
  isModal: false,
  isGuest: false,
  currentStatus: false,
  setIsCopyButton: jest.fn(),
};

export const mockDataConfirm = {
  isBlackListUser: false,
  isAuthenticated: true,
  rejectRules: jest.fn(),
  isStartChangeRules: false,
  isStartGetReferralInfo: false,
  handleAgreeRulesCheckbox: jest.fn(),
  handleOkButton: jest.fn(),
  handleCancelButton: jest.fn(),
  currentCopyText: '',
  authUserName: 'vallon',
  isModal: false,
  isGuest: false,
  currentStatus: true,
  setIsCopyButton: jest.fn(),
};

export const mockDataIsModal = {
  isBlackListUser: false,
  isAuthenticated: true,
  rejectRules: jest.fn(),
  isStartChangeRules: false,
  isStartGetReferralInfo: false,
  handleAgreeRulesCheckbox: jest.fn(),
  handleOkButton: jest.fn(),
  handleCancelButton: jest.fn(),
  currentCopyText: '',
  authUserName: 'vallon',
  isModal: true,
  isGuest: false,
  currentStatus: true,
  setIsCopyButton: jest.fn(),
};

export const mockDataIsBlackListUser = {
  isBlackListUser: true,
  isAuthenticated: true,
  rejectRules: jest.fn(),
  isStartChangeRules: false,
  isStartGetReferralInfo: false,
  handleAgreeRulesCheckbox: jest.fn(),
  handleOkButton: jest.fn(),
  handleCancelButton: jest.fn(),
  currentCopyText: '',
  authUserName: 'vallon',
  isModal: false,
  isGuest: false,
  currentStatus: false,
  setIsCopyButton: jest.fn(),
};

export const mockDataIsLoadingState = {
  isBlackListUser: false,
  isAuthenticated: true,
  rejectRules: jest.fn(),
  isStartChangeRules: true,
  isStartGetReferralInfo: false,
  handleAgreeRulesCheckbox: jest.fn(),
  handleOkButton: jest.fn(),
  handleCancelButton: jest.fn(),
  currentCopyText: '',
  authUserName: 'vallon',
  isModal: false,
  isGuest: false,
  currentStatus: false,
  setIsCopyButton: jest.fn(),
};
