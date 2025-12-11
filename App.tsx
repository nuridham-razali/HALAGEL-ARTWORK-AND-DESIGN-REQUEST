import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer, FileText, CheckSquare, Palette, Info } from 'lucide-react';
import { DesignRequestData, INITIAL_DATA } from './type';
import { PdfTemplate } from './components/PdfTemplate';
import { FormInput, CheckboxGroup, SectionTitle } from './components/FormControls';
import { LOGO_BASE64 } from './constants';

export default function App() {
  const [data, setData] = useState<DesignRequestData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Two refs: one for the visible preview, one for the hidden print version
  const templateRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof DesignRequestData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section: keyof DesignRequestData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const generatePdf = async () => {
    // We use printRef (the unscaled, off-screen version) for generation
    if (!printRef.current) {
        console.error("Print template reference not found");
        return;
    }
    
    setIsGenerating(true);
    try {
      // Small timeout to ensure DOM is ready and images are loaded
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(printRef.current, {
        scale: 4, // High scale for very sharp text and precise alignment
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff', // Ensure white background
        onclone: (clonedDoc) => {
             const element = clonedDoc.getElementById('print-container');
             if(element) {
                 element.style.display = 'block';
             }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Halagel_Artwork-&-Design_Request_${data.productName || 'Draft'}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar: Form Input */}
      <div className="w-full lg:w-5/12 bg-white shadow-2xl overflow-y-auto h-full border-r border-gray-200 z-10 custom-scrollbar">
        
        {/* Header with Logo */}
        <div className="sticky top-0 bg-emerald-700 text-white z-20 px-8 py-6 shadow-md">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                   <img src={LOGO_BASE64} alt="Halagel Logo" className="w-full h-full object-contain filter brightness-0 invert" />
                </div>
                <div>
                  <h1 className="text-m font-bold text-white leading-tight">ARTWORK & DESIGN REQUEST</h1>
                  <p className="text-xs text-emerald-100 font-medium opacity-90">Halagel Group of Companies</p>
                </div>
             </div>
             <div className="p-2 bg-emerald-600 text-emerald-100 rounded-full">
                <FileText size={20} />
             </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8 pb-32">
           {/* Section A */}
           <div className="bg-white rounded-xl">
             <SectionTitle title="A) Requestor Details" color="text-emerald-700" borderColor="border-emerald-200" />

             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <FormInput label="Date" type="date" value={data.date} onChange={(e) => handleInputChange('date', e.target.value)} />
                 <FormInput label="Deadline" type="date" value={data.deadline} onChange={(e) => handleInputChange('deadline', e.target.value)} />
               </div>
               
               <FormInput label="ADR No" value={data.adrNo} onChange={(e) => handleInputChange('adrNo', e.target.value)} placeholder="(To be filled by designer)" />

               <div className="grid grid-cols-2 gap-4">
                 <FormInput label="From (Name)" value={data.requestorFrom} onChange={(e) => handleInputChange('requestorFrom', e.target.value)} />
                 <FormInput label="Department" value={data.department} onChange={(e) => handleInputChange('department', e.target.value)} />
               </div>
               
               <CheckboxGroup label="Category">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors text-black">
                    <input 
                      type="checkbox" 
                      className="accent-emerald-600 w-4 h-4"
                      checked={data.category === 'Halagel'} 
                      onChange={() => handleInputChange('category', 'Halagel')} 
                    />
                    <span className="font-medium">Halagel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors text-black">
                    <input 
                      type="checkbox" 
                      className="accent-emerald-600 w-4 h-4"
                      checked={data.category === 'OEM'} 
                      onChange={() => handleInputChange('category', 'OEM')} 
                    />
                    <span className="font-medium">OEM</span>
                  </label>
                  {data.category === 'OEM' && (
                    <input 
                      type="text" 
                      placeholder="Specify OEM..." 
                      className="mt-1 w-full text-sm border-b-2 border-emerald-100 p-1 bg-transparent outline-none focus:border-emerald-500 ml-6 text-gray-700 transition-all"
                      value={data.oemSpecify}
                      onChange={(e) => handleInputChange('oemSpecify', e.target.value)}
                    />
                  )}
               </CheckboxGroup>
             </div>
           </div>

           {/* Section B */}
           <div>
             <SectionTitle title="B) Details Requisition" color="text-teal-700" borderColor="border-teal-200" />
             <div className="space-y-5">
                <FormInput 
                    label="Product Name" 
                    placeholder="e.g. Omega-3 Gold"
                    value={data.productName} 
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    className="shadow-sm" 
                  />

                  {/* Manual Inputs for Concept and Color - Updated to use textarea */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput 
                          label="Product Concept" 
                          value={data.productConcept} 
                          onChange={(e) => handleInputChange('productConcept', e.target.value)}
                          placeholder="Brief description..."
                          textarea={true}
                      />
                      <FormInput 
                          label="Colour Scheme" 
                          value={data.colourScheme} 
                          onChange={(e) => handleInputChange('colourScheme', e.target.value)} 
                          placeholder="e.g. Blue and White"
                          textarea={true}
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CheckboxGroup label="Job Request">
                      <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.jobRequest.newDesign} onChange={(e) => handleNestedChange('jobRequest', 'newDesign', e.target.checked)} /> New Design</label>
                      <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.jobRequest.amendment} onChange={(e) => handleNestedChange('jobRequest', 'amendment', e.target.checked)} /> Amendment</label>
                    </CheckboxGroup>
                    <CheckboxGroup label="Type">
                      <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.type.designArtwork} onChange={(e) => handleNestedChange('type', 'designArtwork', e.target.checked)} /> Artwork</label>
                      <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.type.sampleLabel} onChange={(e) => handleNestedChange('type', 'sampleLabel', e.target.checked)} /> Sample</label>
                      <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.type.mockup} onChange={(e) => handleNestedChange('type', 'mockup', e.target.checked)} /> Mockup</label>
                    </CheckboxGroup>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Dimension" value={data.dimension} onChange={(e) => handleInputChange('dimension', e.target.value)} />
                    <FormInput label="Material" value={data.typeOfMaterial} onChange={(e) => handleInputChange('typeOfMaterial', e.target.value)} />
                  </div>
                  
                  <FormInput label="Type of Design" placeholder="Label / Box / Pamphlet" value={data.typeOfDesign} onChange={(e) => handleInputChange('typeOfDesign', e.target.value)} />
                  <FormInput label="End User Target" value={data.endUserTarget} onChange={(e) => handleInputChange('endUserTarget', e.target.value)} />

                  <CheckboxGroup label="Information Required on Artwork">
                    <div className="space-y-3">
                      {/* Barcode */}
                      <div>
                          <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.infoRequired.barcode} onChange={(e) => handleNestedChange('infoRequired', 'barcode', e.target.checked)} />
                            <span>Barcode <span className="text-gray-400 text-xs">(Provide by Halagel/Customer)</span></span>
                          </label>
                          {data.infoRequired.barcode && (
                              <div className="flex gap-4 text-xs mt-1 ml-7">
                                  <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                                      <input type="radio" className="accent-teal-600 w-3 h-3" name="barcodeProv" checked={data.infoRequired.barcodeProvider === 'Halagel'} onChange={() => handleNestedChange('infoRequired', 'barcodeProvider', 'Halagel')} /> Halagel
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                                      <input type="radio" className="accent-teal-600 w-3 h-3" name="barcodeProv" checked={data.infoRequired.barcodeProvider === 'Customer'} onChange={() => handleNestedChange('infoRequired', 'barcodeProvider', 'Customer')} /> Customer
                                  </label>
                              </div>
                          )}
                      </div>

                      {/* QR Code */}
                      <div>
                          <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.infoRequired.qrCode} onChange={(e) => handleNestedChange('infoRequired', 'qrCode', e.target.checked)} />
                            <span>QR Code <span className="text-gray-400 text-xs">(Provide by Halagel/Customer)</span></span>
                          </label>
                          {data.infoRequired.qrCode && (
                              <div className="flex gap-4 text-xs mt-1 ml-7">
                                  <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                                      <input type="radio" className="accent-teal-600 w-3 h-3" name="qrProv" checked={data.infoRequired.qrCodeProvider === 'Halagel'} onChange={() => handleNestedChange('infoRequired', 'qrCodeProvider', 'Halagel')} /> Halagel
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                                      <input type="radio" className="accent-teal-600 w-3 h-3" name="qrProv" checked={data.infoRequired.qrCodeProvider === 'Customer'} onChange={() => handleNestedChange('infoRequired', 'qrCodeProvider', 'Customer')} /> Customer
                                  </label>
                              </div>
                          )}
                      </div>

                      {/* Others */}
                      <div>
                          <label className="flex items-center gap-2 text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input type="checkbox" className="accent-teal-600 w-4 h-4" checked={data.infoRequired.others} onChange={(e) => handleNestedChange('infoRequired', 'others', e.target.checked)} />
                            <span>Others</span>
                          </label>
                          {data.infoRequired.others && (
                              <div className="ml-7 mt-1 space-y-2">
                                <input 
                                  className="w-full border-b border-gray-300 text-sm py-1 bg-transparent outline-none focus:border-teal-500 transition-colors placeholder-gray-400"
                                  placeholder="Please specify..."
                                  value={data.infoRequired.othersSpecify}
                                  onChange={(e) => handleNestedChange('infoRequired', 'othersSpecify', e.target.value)}
                                />
                                <div className="flex gap-4 text-xs">
                                    <span className="text-gray-500">Provide by:</span>
                                    <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                                        <input type="radio" className="accent-teal-600 w-3 h-3" name="othersProv" checked={data.infoRequired.othersProvider === 'Halagel'} onChange={() => handleNestedChange('infoRequired', 'othersProvider', 'Halagel')} /> Halagel
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                                        <input type="radio" className="accent-teal-600 w-3 h-3" name="othersProv" checked={data.infoRequired.othersProvider === 'Customer'} onChange={() => handleNestedChange('infoRequired', 'othersProvider', 'Customer')} /> Customer
                                    </label>
                                </div>
                              </div>
                          )}
                      </div>
                    </div>
                  </CheckboxGroup>

                  <CheckboxGroup label="Intended For">
                    <div className="grid grid-cols-2 gap-2">
                      {['softgel', 'toothpaste', 'cosmetics', 'fnb'].map(k => (
                        <label key={k} className="flex items-center gap-2 capitalize text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-teal-600 w-4 h-4"
                            checked={(data.intendedFor as any)[k]} 
                            onChange={(e) => handleNestedChange('intendedFor', k, e.target.checked)} 
                          /> 
                          {k}
                        </label>
                      ))}
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 capitalize text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-teal-600 w-4 h-4"
                            checked={data.intendedFor.others} 
                            onChange={(e) => handleNestedChange('intendedFor', 'others', e.target.checked)} 
                          /> 
                          Others
                        </label>
                        {data.intendedFor.others && (
                          <input 
                            className="ml-7 w-[90%] border-b border-gray-300 text-sm py-1 bg-transparent outline-none focus:border-teal-500 transition-colors" 
                            placeholder="Specify..."
                            value={data.intendedFor.othersSpecify}
                            onChange={(e) => handleNestedChange('intendedFor', 'othersSpecify', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </CheckboxGroup>

                  <CheckboxGroup label="Certification Logos">
                    <div className="grid grid-cols-2 gap-2">
                      {['jakim', 'mesti', 'malaysiaBrand', 'sahabatZakat', 'goGreen'].map(k => (
                        <label key={k} className="flex items-center gap-2 uppercase text-xs font-semibold text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-teal-600 w-4 h-4"
                            checked={(data.certificationLogo as any)[k]} 
                            onChange={(e) => handleNestedChange('certificationLogo', k, e.target.checked)} 
                          /> 
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      ))}
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 uppercase text-xs font-semibold text-black hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="accent-teal-600 w-4 h-4"
                            checked={data.certificationLogo.others} 
                            onChange={(e) => handleNestedChange('certificationLogo', 'others', e.target.checked)} 
                          /> 
                          OTHERS (Please Specify)
                        </label>
                        {data.certificationLogo.others && (
                          <input 
                            className="ml-7 w-[90%] border-b border-gray-300 text-sm py-1 bg-transparent outline-none focus:border-teal-500 transition-colors" 
                            placeholder="Specify..."
                            value={data.certificationLogo.othersSpecify}
                            onChange={(e) => handleNestedChange('certificationLogo', 'othersSpecify', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </CheckboxGroup>
             </div>
           </div>

           {/* Section C */}
           <div>
             <SectionTitle title="C) Declaration" color="text-rose-700" borderColor="border-rose-200" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormInput label="Requested By (Name)" value={data.requestedByName} onChange={(e) => handleInputChange('requestedByName', e.target.value)} />
               <FormInput label="Position" value={data.requestedByPosition} onChange={(e) => handleInputChange('requestedByPosition', e.target.value)} />
             </div>
           </div>
           
        </div>
      </div>

      {/* Main Content: PDF Preview Container */}
      {/* Changed to allow scrolling and better scale presentation */}
      <div className="hidden lg:flex flex-1 bg-slate-100 h-full flex-col relative overflow-hidden">
        
        {/* Floating Controls */}
        <div className="absolute top-6 right-6 z-30 flex gap-3 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-gray-200/50 shadow-lg">
            <button 
              onClick={generatePdf} 
              disabled={isGenerating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Download size={18} />}
              {isGenerating ? 'Saving...' : 'Download'}
            </button>
            <button 
              onClick={() => window.print()} 
              className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2 px-4 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Printer size={18} /> Print
            </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
          <div className="flex flex-col gap-8">
            {/* The Preview scaled to fit comfortably on most screens but large enough to read */}
            <div className="bg-white shadow-2xl origin-top scale-[0.7] sm:scale-[0.8] 2xl:scale-[0.9] transform-gpu transition-transform duration-300">
               <PdfTemplate data={data} ref={templateRef} />
            </div>
            
            <div className="h-10"></div> {/* Bottom spacer */}
          </div>
        </div>

        {/* Hidden Print/Generation Version (Absolute positioned to ensure correct rendering for html2canvas) */}
        <div id="print-container" style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', height: 'auto', zIndex: -100 }}>
             <PdfTemplate data={data} ref={printRef} />
        </div>
      </div>
    </div>
  );
}
