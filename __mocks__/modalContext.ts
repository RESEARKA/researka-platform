// Mock for the ModalContext
export const mockModalContext = {
  isOpen: false,
  modalContent: null,
  modalTitle: '',
  openModal: jest.fn(),
  closeModal: jest.fn(),
};

// Mock the useModal hook
export const mockUseModal = jest.fn().mockReturnValue(mockModalContext);
