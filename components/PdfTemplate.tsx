import React, { forwardRef } from 'react';
import { DesignRequestData } from '../type';
import { Check } from 'lucide-react';
import { LOGO_BASE64 } from '../constants';

interface PdfTemplateProps {
  data: DesignRequestData;
}

// Helper to format date YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateStr: string) => {
  if(!dateStr) return "";
  const parts = dateStr.split('-');
  if(parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

const CheckBox = ({ checked, label, className = "" }: { checked: boolean; label?: string; className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="w-5 h-5 border border-black flex items-center justify-center bg-white shrink-0 relative">
      {checked && <Check size={16} strokeWidth={4} className="text-black" />}
    </div>
    {label && <span className="text-sm font-bold pt-0.5">{label}</span>}
  </div>
);

// Checkbox without label, for custom layouts
const CheckBoxOnly = ({ checked }: { checked: boolean }) => (
    <div className="w-5 h-5 border border-black flex items-center justify-center bg-white shrink-0 relative">
      {checked && <Check size={16} strokeWidth={4} className="text-black" />}
    </div>
);

// Improved LineField: Supports multiline stacking within the template layout
const LineField = ({ 
  label, 
  value = "", 
  width = "flex-1", 
  className = "",
  labelClass = "font-bold",
  multiline = false
}: { 
  label?: string; 
  value?: string; 
  width?: string; 
  className?: string;
  labelClass?: string;
  multiline?: boolean;
}) => {
    // Dynamic font size logic to keep text inside the box
    let fontSize = "text-sm";
    
    if (multiline && value) {
        const len = value.length;
        // More aggressive scaling to prevent overflow
        if (len > 250) fontSize = "text-[7px]";
        else if (len > 180) fontSize = "text-[8px]";
        else if (len > 130) fontSize = "text-[9px]";
        else if (len > 90) fontSize = "text-[10px]";
        else if (len > 50) fontSize = "text-xs";
    }

    return (
      <div className={`flex items-end gap-1 ${className}`}>
         {label && <span className={`${labelClass} whitespace-nowrap mb-1 shrink-0`}>{label} :</span>}
         <div className={`${width} border-b border-black relative min-h-[1.5rem]`}>
            {/* 
              Standard flow div to allow text to wrap ("stack") naturally.
              We use leading-none and small padding to keep it tight and prevent layout breakage.
            */}
            <div className={`w-full text-blue-900 font-bold ${fontSize} uppercase leading-none whitespace-pre-wrap break-words pl-2 pb-0.5`} 
                 style={{ fontFamily: 'Calibri, sans-serif' }}>
                {value}
            </div>
         </div>
      </div>
    );
};

// We use forwardRef so parent can access the DOM element for html2canvas
export const PdfTemplate = forwardRef<HTMLDivElement, PdfTemplateProps>(({ data }, ref) => {
  return (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-black text-sm font-sans box-border relative leading-tight p-[10mm] select-none" style={{ fontFamily: 'Calibri, sans-serif' }}>
       
       {/* Main Content Border */}
       <div className="border-2 border-black h-full flex flex-col">
          
          {/* Header */}
          <div className="flex border-b-2 border-black h-24">
             {/* Logo Column */}
             <div className="w-[30%] border-r-2 border-black p-2 flex items-center justify-center relative">
                <div className="w-26 h-26 flex items-center justify-center">
                  <img src={LOGO_BASE64} className="w-full h-full object-contain" alt="Halagel Logo" />
                </div>
             </div>
             {/* Title Column */}
             <div className="w-[70%] flex flex-col">
                <div className="flex-[1.2] flex items-center justify-center border-b border-black bg-gray-50/30">
                    <h1 className="text-xl font-extrabold uppercase tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>HALAGEL GROUP OF COMPANIES</h1>
                </div>
                <div className="flex-1 flex items-center justify-center bg-gray-200/50 print:bg-gray-200">
                    <h2 className="text-lg font-bold uppercase tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>ARTWORK & DESIGN REQUEST</h2>
                </div>
             </div>
          </div>

          {/* Meta Data Row */}
          <div className="flex border-b-2 border-black divide-x-2 divide-black h-16">
             <div className="flex-1 p-2 flex flex-col justify-between">
               <span className="font-bold text-xs">Date :</span>
               <div className="pl-2 text-blue-900 font-bold" style={{ fontFamily: 'Calibri, sans-serif' }}>{formatDate(data.date)}</div>
             </div>
             <div className="flex-1 p-2 flex flex-col justify-between">
               <span className="font-bold text-xs">Deadline :</span>
               <div className="pl-2 text-blue-900 font-bold" style={{ fontFamily: 'Calibri, sans-serif' }}>{formatDate(data.deadline)}</div>
             </div>
             <div className="flex-1 p-2 flex flex-col justify-between relative">
               <span className="font-bold text-xs">ADR No :</span>
               <div className="pl-2 text-blue-900 font-bold" style={{ fontFamily: 'Calibri, sans-serif' }}>{data.adrNo}</div>
               <span className="absolute bottom-1 right-2 text-[9px] italic">(To be filled by designer)</span>
             </div>
          </div>

          {/* Section A */}
          <div className="border-b-2 border-black">
            <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm">
                A) REQUESTOR DETAILS
            </div>
            <div className="p-3 space-y-3">
               <div className="flex gap-4">
                  <div className="w-[60%]">
                     <LineField label="From" value={data.requestorFrom} />
                  </div>
                  <div className="w-[40%]">
                     <LineField label="Department" value={data.department} />
                  </div>
               </div>
               
               {/* Email Field Removed from PDF Template as requested */}

               <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold w-16 shrink-0">Category :</span>
                  <div className="flex items-center gap-6">
                     <CheckBox checked={data.category === 'Halagel'} label="Halagel" />
                     <div className="flex items-center gap-2">
                        <CheckBox checked={data.category === 'OEM'} label="OEM" />
                        <div className="w-[220px] ml-1">
                           <LineField label="(please specify)" value={data.oemSpecify} labelClass="italic text-xs" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Section B */}
          <div className="border-b-2 border-black flex-1 flex flex-col">
             <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm">
                B) DETAILS REQUISITION <span className="text-[10px] font-normal italic ml-1 align-baseline">(as per registration/ notification)</span>
             </div>
             
             <div className="p-3 space-y-3 flex-1">
                {/* Product Name */}
                <LineField label="Product Name" value={data.productName} className="w-full" multiline />

                {/* Job Request */}
                <div className="flex items-start gap-2 pt-1">
                    <span className="font-bold w-24 shrink-0 mt-1">Job Request</span>
                    <span className="shrink-0 mt-1">:</span>
                    <div className="flex-1 flex gap-8">
                        <CheckBox checked={data.jobRequest.newDesign} label="New design" />
                        <div className="flex items-center gap-2">
                            <CheckBox checked={data.jobRequest.amendment} label="Amendment" />
                            <span className="text-[10px] italic text-gray-500 pt-1">(Please attach the amendment)</span>
                        </div>
                    </div>
                </div>

                {/* Intended For */}
                <div className="flex items-start gap-2 pt-1">
                    <span className="font-bold w-24 shrink-0 mt-1">Intended for</span>
                    <span className="shrink-0 mt-1">:</span>
                    <div className="flex-1 grid grid-cols-3 gap-y-2 gap-x-2">
                        <CheckBox checked={data.intendedFor.softgel} label="Softgel" />
                        <CheckBox checked={data.intendedFor.toothpaste} label="Toothpaste" />
                        <CheckBox checked={data.intendedFor.cosmetics} label="Cosmetics" />
                        <div className="col-span-3 flex items-center gap-2">
                            <CheckBox checked={data.intendedFor.fnb} label="F&B" />
                            <div className="w-4"></div>
                            <CheckBox checked={data.intendedFor.others} label="Others" />
                            <div className="flex-1">
                                <LineField label="(please specify)" value={data.intendedFor.othersSpecify} labelClass="italic text-xs" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Type */}
                <div className="flex items-start gap-2 pt-1">
                    <span className="font-bold w-24 shrink-0 mt-1">Type</span>
                    <span className="shrink-0 mt-1">:</span>
                    <div className="flex-1 flex flex-col gap-1">
                        <CheckBox checked={data.type.designArtwork} label="Design / Artwork" />
                        <CheckBox checked={data.type.sampleLabel} label="Sample Label" />
                        <CheckBox checked={data.type.mockup} label="Mockup" />
                    </div>
                </div>
                
                <div className="h-px bg-black my-1"></div>

                {/* Specs Grid */}
                <div className="flex flex-col gap-3 mt-1">
                    {/* Row 1: Colour Scheme (Full width) */}
                    <LineField label="Colour Scheme" value={data.colourScheme} multiline className="w-full" />
                    
                    {/* Row 2: Material and Dimension (Side-by-side) */}
                    <div className="flex gap-4">
                         <div className="w-1/2">
                            <LineField label="Type of Material" value={data.typeOfMaterial} multiline />
                         </div>
                         <div className="w-1/2">
                            <LineField label="Dimension" value={data.dimension} multiline />
                         </div>
                    </div>

                    {/* Row 3: Product Concept (Full width) */}
                    <LineField label="Product Concept" value={data.productConcept} multiline className="w-full" />
                </div>
                
                <div className="mt-1">
                     <LineField label="Type of Design" value={data.typeOfDesign} />
                </div>
                <div className="mt-2">
                     <LineField label="End User Target" value={data.endUserTarget} />
                </div>

                <div className="h-px bg-black my-2"></div>

                {/* Information Required */}
                <div className="flex items-start gap-2">
                   <div className="w-28 shrink-0 font-bold leading-none pt-1">Information Required on Artwork</div>
                   <span className="pt-1 shrink-0">:</span>
                   <div className="flex-1 space-y-2">
                      {/* Barcode Row */}
                      <div className="flex items-center gap-2">
                         <CheckBoxOnly checked={data.infoRequired.barcode} />
                         <span className="font-bold text-sm">
                            Barcode (Provide by{' '}
                            <span className={data.infoRequired.barcodeProvider === 'Halagel' ? 'underline decoration-2 underline-offset-2' : ''}>Halagel</span>
                            {' / '}
                            <span className={data.infoRequired.barcodeProvider === 'Customer' ? 'underline decoration-2 underline-offset-2' : ''}>Customer</span>
                            )
                         </span>
                         <span className="mx-1">:</span>
                         <div className="border-b border-dotted border-black w-48 h-5 relative flex items-center justify-center">
                             <span className="absolute bottom-[10px] text-blue-900 font-bold text-xs uppercase" style={{ fontFamily: 'Calibri, sans-serif' }}>
                                {data.infoRequired.barcode ? data.infoRequired.barcodeProviderName : ''}
                             </span>
                         </div>
                      </div>

                      {/* QR Code Row */}
                      <div className="flex items-center gap-2">
                         <CheckBoxOnly checked={data.infoRequired.qrCode} />
                         <span className="font-bold text-sm">
                            QR Code (Provide by{' '}
                            <span className={data.infoRequired.qrCodeProvider === 'Halagel' ? 'underline decoration-2 underline-offset-2' : ''}>Halagel</span>
                            {' / '}
                            <span className={data.infoRequired.qrCodeProvider === 'Customer' ? 'underline decoration-2 underline-offset-2' : ''}>Customer</span>
                            )
                         </span>
                         <span className="mx-1">:</span>
                         <div className="border-b border-dotted border-black w-48 h-5 relative flex items-center justify-center">
                             <span className="absolute bottom-[10px] text-blue-900 font-bold text-xs uppercase" style={{ fontFamily: 'Calibri, sans-serif' }}>
                                {data.infoRequired.qrCode ? data.infoRequired.qrCodeProviderName : ''}
                             </span>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 w-full">
                         <CheckBox checked={data.infoRequired.others} label="Others" />
                         <div className="flex-1">
                             <LineField label="(Please specify)" value={data.infoRequired.othersSpecify} labelClass="italic text-xs" />
                         </div>
                      </div>
                      <div className="text-[9px] italic text-gray-500 pl-6">(Kindly attach the information if not enough space)</div>
                   </div>
                </div>

                 <div className="h-px bg-black my-2"></div>
                 
                 {/* Certification */}
                 <div>
                    <div className="flex gap-2 mb-2 items-center">
                        <span className="font-bold">Certification Logo :</span>
                        <span className="italic text-xs text-gray-600">(Please mark at appropriate box)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-3 px-2">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-6 border border-black flex items-center justify-center relative bg-white">
                              {data.certificationLogo.jakim && <Check size={20} strokeWidth={4} className="text-black" />}
                           </div>
                           <span className="font-bold text-sm">JAKIM</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-6 border border-black flex items-center justify-center relative bg-white">
                              {data.certificationLogo.mesti && <Check size={20} strokeWidth={4} className="text-black" />}
                           </div>
                           <span className="font-bold text-sm">MeSTI</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-6 border border-black flex items-center justify-center relative bg-white">
                              {data.certificationLogo.malaysiaBrand && <Check size={20} strokeWidth={4} className="text-black" />}
                           </div>
                           <span className="font-bold text-sm">MALAYSIA BRAND</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-6 border border-black flex items-center justify-center relative bg-white">
                              {data.certificationLogo.sahabatZakat && <Check size={20} strokeWidth={4} className="text-black" />}
                           </div>
                           <span className="font-bold text-sm">SAHABAT ZAKAT</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-6 border border-black flex items-center justify-center relative bg-white">
                              {data.certificationLogo.goGreen && <Check size={20} strokeWidth={4} className="text-black" />}
                           </div>
                           <span className="font-bold text-sm">GO GREEN LOGO</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-6 border border-black flex items-center justify-center relative bg-white">
                              {data.certificationLogo.others && <Check size={20} strokeWidth={4} className="text-black" />}
                           </div>
                           <div className="flex flex-col w-full">
                               <span className="font-bold text-sm underline">OTHERS:</span>
                               <div className="w-full border-b border-gray-400 relative h-6 mt-1">
                                    <span className="absolute bottom-[10px] left-0 text-blue-900 font-bold text-xs uppercase leading-none whitespace-nowrap overflow-visible z-10" style={{ fontFamily: 'Calibri, sans-serif' }}>
                                        {data.certificationLogo.others ? data.certificationLogo.othersSpecify : ''}
                                    </span>
                               </div>
                           </div>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold mt-3 pl-1">
                        **Please attached necessary document for artwork/design (photo, product information, etc.)
                    </div>
                 </div>
             </div>
          </div>

          {/* Section C */}
          <div className="border-b-2 border-black">
             <div className="bg-gray-200 border-b border-black px-2 py-1 font-bold text-sm">
                C) DECLARATION
             </div>
             <div className="grid grid-cols-2 divide-x-2 divide-black">
                {/* Left Column - Increased height to h-52 for bigger box */}
                <div className="p-4 flex flex-col h-52">
                   <div className="font-bold mb-6">Requested by,</div>
                   
                   <div className="flex flex-col gap-5 mt-auto">
                       <LineField label="Name" value={data.requestedByName} width="flex-1" />
                       <LineField label="Position" value={data.requestedByPosition} width="flex-1" />
                       <LineField label="Date" value={formatDate(data.date)} width="flex-1" />
                   </div>
                </div>

                {/* Right Column - Increased height to h-52 for bigger box */}
                <div className="p-4 flex flex-col h-52">
                   <div className="font-bold mb-6">Received by,</div>
                   
                   <div className="flex flex-col gap-5 mt-auto">
                       <LineField label="Name" value="" width="flex-1" />
                       <LineField label="Position" value="" width="flex-1" />
                       <LineField label="Date" value="" width="flex-1" />
                   </div>
                </div>
             </div>
          </div>
          
       </div>
       
       {/* Footer */}
       <div className="mt-2 text-[10px] text-gray-500 font-sans leading-tight">
          <p>FM-QA-35 Rev:2, 02nd Dec 2025</p>
          <p>Ref WI-QA-16, DCM</p>
          <p>HALAGEL GROUP OF COMPANIES</p>
       </div>
    </div>
  );
});

PdfTemplate.displayName = "PdfTemplate";
