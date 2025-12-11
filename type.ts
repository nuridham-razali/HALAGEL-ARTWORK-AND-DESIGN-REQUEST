
export interface DesignRequestData {
  date: string;
  deadline: string;
  adrNo: string;
  
  // Section A
  requestorFrom: string;
  department: string;
  category: 'Halagel' | 'OEM' | '';
  oemSpecify: string;

  // Section B
  productName: string;
  jobRequest: {
    newDesign: boolean;
    amendment: boolean;
  };
  intendedFor: {
    softgel: boolean;
    toothpaste: boolean;
    cosmetics: boolean;
    fnb: boolean;
    others: boolean;
    othersSpecify: string;
  };
  type: {
    designArtwork: boolean;
    sampleLabel: boolean;
    mockup: boolean;
  };
  colourScheme: string;
  typeOfMaterial: string;
  dimension: string;
  productConcept: string;
  typeOfDesign: string; // Label / Box / Pamphlet / Others
  endUserTarget: string;
  
  infoRequired: {
    barcode: boolean;
    barcodeProvider: string;
    qrCode: boolean;
    qrCodeProvider: string;
    others: boolean;
    othersSpecify: string;
    othersProvider: string;
  };
  
  certificationLogo: {
    jakim: boolean;
    mesti: boolean;
    malaysiaBrand: boolean;
    sahabatZakat: boolean;
    goGreen: boolean;
    others: boolean;
    othersSpecify: string;
  };

  // Section C
  requestedByName: string;
  requestedByPosition: string;
  requestedByDate: string;
}

export const INITIAL_DATA: DesignRequestData = {
  date: new Date().toISOString().split('T')[0],
  deadline: '',
  adrNo: '',
  requestorFrom: '',
  department: '',
  category: 'Halagel',
  oemSpecify: '',
  productName: '',
  jobRequest: { newDesign: false, amendment: false },
  intendedFor: { softgel: false, toothpaste: false, cosmetics: false, fnb: false, others: false, othersSpecify: '' },
  type: { designArtwork: false, sampleLabel: false, mockup: false },
  colourScheme: '',
  typeOfMaterial: '',
  dimension: '',
  productConcept: '',
  typeOfDesign: '',
  endUserTarget: '',
  infoRequired: { 
    barcode: false, 
    barcodeProvider: '', 
    qrCode: false, 
    qrCodeProvider: '', 
    others: false, 
    othersSpecify: '',
    othersProvider: ''
  },
  certificationLogo: { jakim: false, mesti: false, malaysiaBrand: false, sahabatZakat: false, goGreen: false, others: false, othersSpecify: '' },
  requestedByName: '',
  requestedByPosition: '',
  requestedByDate: new Date().toISOString().split('T')[0],
};
