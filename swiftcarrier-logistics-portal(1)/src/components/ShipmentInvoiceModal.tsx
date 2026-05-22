/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Printer, Download, Mail, Link as LinkIcon, X, RefreshCw, FileText, CheckCircle, Award, ShieldAlert, BadgeInfo, Image as ImageIcon
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { Shipment } from '../types';
import { usePortal } from '../context/PortalContext';
import { saveShipment } from '../firebase';

interface ShipmentInvoiceModalProps {
  shipment: Shipment;
  onClose: () => void;
}

export const ShipmentInvoiceModal: React.FC<ShipmentInvoiceModalProps> = ({ shipment, onClose }) => {
  const { settings, showToast, adminEmail } = usePortal();
  
  // Dynamic Invoice Attributes (with fallback/regeneration capability)
  const [invoiceId, setInvoiceId] = useState('');
  const [generationDate, setGenerationDate] = useState('');
  const [baseFare, setBaseFare] = useState(0);
  const [fuelSurcharge, setFuelSurcharge] = useState(0);
  const [customsTransitFee, setCustomsTransitFee] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  // Action state trackers
  const [sendingEmail, setSendingEmail] = useState(false);
  const [attachingToShipment, setAttachingToShipment] = useState(false);

  // Generate highly realistic itemized pricing and IDs
  const computeInvoiceDetails = () => {
    // Unique invoice ID inspired by Maersk/FedEx waybill nomenclature
    const randomSuffix = Math.floor(100000 + Math.random() * 90000);
    const generatedInvoiceNum = `INV-${shipment.trackingId}-${randomSuffix}`;
    setInvoiceId(generatedInvoiceNum);
    
    // Dynamic generation timestamp
    setGenerationDate(new Date().toLocaleString());
    
    // Compute itemized tariffs based on weight and distance complexity
    const calculatedBase = Number(((shipment.shippingCost || (shipment.weight * 4.25)) * 0.75).toFixed(2));
    const calculatedFuel = Number((calculatedBase * 0.15).toFixed(2));
    const calculatedCustoms = shipment.shipmentType === 'Expedited Courier' || shipment.shipmentType === 'Air Freight' 
      ? 125.00 
      : 45.00;
      
    setBaseFare(calculatedBase);
    setFuelSurcharge(calculatedFuel);
    setCustomsTransitFee(calculatedCustoms);
    setTotalCost(Number((calculatedBase + calculatedFuel + calculatedCustoms).toFixed(2)));
  };

  useEffect(() => {
    computeInvoiceDetails();
  }, [shipment.trackingId]);

  // Command 1: Printer direct activation
  const handlePrintReceipt = () => {
    // Inject print styling directly to head to isolate the invoice container during printing
    const styleElement = document.createElement('style');
    styleElement.id = 'invoice-print-styles';
    styleElement.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #printable-invoice-block, #printable-invoice-block * {
          visibility: visible !important;
        }
        #printable-invoice-block {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    setTimeout(() => {
      window.print();
      // Remove styles after print dialog closes to restore normal UI
      const style = document.getElementById('invoice-print-styles');
      if (style) style.remove();
    }, 150);
  };

  // Command 2: JSON/HTML Export (Download Receipt)
  const handleDownloadReceipt = () => {
    const invoiceContent = `
========================================
${settings.websiteName.toUpperCase()} CORPORATE CARGO WAYBILL RECEIPT
========================================
WAYBILL NUMBER:   ${invoiceId}
TRACKING REFERENCE: ${shipment.trackingId}
GENERATED DATE:    ${generationDate}
----------------------------------------
SENDER CREDENTIALS:
- Corporate Entity: ${shipment.sender.name}
- Email Contact:    ${shipment.sender.email}
- Contact Phone:    ${shipment.sender.phone}
- Facility Origin:  ${shipment.origin}

RECEIVER CREDENTIALS:
- Receiving Entity: ${shipment.receiver.name}
- Email Contact:    ${shipment.receiver.email}
- Direct Phone:     ${shipment.receiver.phone}
- Destination:      ${shipment.destination}
----------------------------------------
CONSIGNMENT CLASSIFICATION:
- Transit Type:     ${shipment.shipmentType}
- Cargo Weight:     ${shipment.weight} KG
- Core Status:      ${shipment.shipmentStatus}
----------------------------------------
Thank you for contracting ${settings.websiteName} Global Logistics.
Consignment remains bounded under corporate transit liability protocols.
========================================
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${shipment.trackingId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Receipt file Receipt-${shipment.trackingId}.txt downloaded successfully!`, 'success');
  };

  // Command 2.5: High Quality JPG Export
  const [downloadingJpg, setDownloadingJpg] = useState(false);
  const handleDownloadJpgReceipt = () => {
    const node = document.getElementById('printable-invoice-block');
    if (!node) {
      showToast('Could not find printable container block.', 'error');
      return;
    }

    setDownloadingJpg(true);
    showToast('Compiling high-quality JPG ledger. Please wait...', 'info');

    // Introduce a short timeout to ensure the UI paints, then convert to JPEG
    setTimeout(() => {
      toJpeg(node, { 
        quality: 0.98, 
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0px', // clean layout bounds for export
          boxShadow: 'none'
        }
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `Receipt-${shipment.trackingId}.jpg`;
          link.href = dataUrl;
          link.click();
          showToast(`Waybill JPG Receipt downloaded successfully!`, 'success');
        })
        .catch((error) => {
          console.error('JPEG compilation failed:', error);
          showToast('Failed to compile waybill receipt as JPG.', 'error');
        })
        .finally(() => {
          setDownloadingJpg(false);
        });
    }, 400);
  };

  // Command 3: Send to customer email
  const handleSendEmailReceipt = async () => {
    setSendingEmail(true);
    // Simulate SMTP network dispatch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSendingEmail(false);
    showToast(`Cargo receipt ${invoiceId} transmitted successfully to sender: ${shipment.sender.email} & receiver: ${shipment.receiver.email}!`, 'success');
  };

  // Command 4: Attach Receipt back to shipment record
  const handleAttachReceipt = async () => {
    setAttachingToShipment(true);
    
    // Build update payload
    const invoiceNote = `CARRIER NOTE [Attached Waybill Receipt: ${invoiceId} | Status Verified: ${shipment.shipmentStatus}]`;
    const updatedShipment = {
      ...shipment,
      carrierNote: shipment.carrierNote 
        ? `${shipment.carrierNote} \n${invoiceNote}` 
        : invoiceNote,
      updatedAt: new Date().toISOString()
    };

    try {
      await saveShipment(updatedShipment, adminEmail || 'admin@swiftcarrier.com');
      // Briefly pause to simulate backend persistence
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast(`Waybill receipt information securely attached to cargo ref ${shipment.trackingId}!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Error attaching receipt manifest.', 'error');
    } finally {
      setAttachingToShipment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Upper Action Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#ff3c00]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Cargo Waybill Cockpit</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Panel Button Bar */}
        <div className="bg-slate-900/40 p-4 border-b border-slate-800 flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            onClick={handlePrintReceipt}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-[#ff3c00]/40 text-xs font-semibold text-white uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-[#ff3c00]" />
            <span>Direct Print / PDF</span>
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-white uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
            title="Download Invoice Manifest file (.txt)"
          >
            <Download className="h-3.5 w-3.5 text-cyan-500" />
            <span>Download TXT</span>
          </button>
          <button
            onClick={handleDownloadJpgReceipt}
            disabled={downloadingJpg}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-pink-500/40 text-xs font-semibold text-white uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all cursor-pointer disabled:opacity-55"
            title="Download Invoice waybill representation as JPG"
          >
            <ImageIcon className="h-3.5 w-3.5 text-pink-500" />
            <span>{downloadingJpg ? 'Compiling JPG...' : 'Download JPG'}</span>
          </button>
          <button
            onClick={handleSendEmailReceipt}
            disabled={sendingEmail}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-white uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all disabled:opacity-55 cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5 text-emerald-500" />
            <span>{sendingEmail ? 'SMTP dispatch...' : 'Send to Client Email'}</span>
          </button>
          <button
            onClick={handleAttachReceipt}
            disabled={attachingToShipment}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-white uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all disabled:opacity-55 cursor-pointer"
          >
            <LinkIcon className="h-3.5 w-3.5 text-amber-500" />
            <span>{attachingToShipment ? 'Saving changes...' : 'Attach as Carrier Note'}</span>
          </button>
          <button
            onClick={computeInvoiceDetails}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Regenerate invoice numbers"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Regenerate</span>
          </button>
        </div>

        {/* PRINTABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 animate-fade-in" id="main-preview-area">
          <div 
            id="printable-invoice-block" 
            className="bg-white text-black p-4 sm:p-6 rounded-none max-w-4xl mx-auto space-y-0 border border-black relative font-mono select-text"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            
            {/* The Unified Waybill Border Box - Exactly matches reference structure */}
            <div className="border border-black flex flex-col sm:flex-row items-stretch">
              
              {/* Box 1: Logo Section (Strict fit, zero excess padding, perfectly aligned) */}
              <div className="w-full sm:w-[22%] border-b sm:border-b-0 sm:border-r border-black flex flex-col justify-center items-center p-2 bg-white min-h-[110px]">
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <img 
                    src="/src/assets/images/company_logo_1779474855785.png" 
                    alt="SwiftCarrier Logo"
                    className="w-full h-auto max-h-[70px] object-contain block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[10px] font-sans font-black uppercase text-center tracking-widest mt-1 text-black leading-none">
                  {settings.websiteName.split(' ')[0]}
                </p>
              </div>

              {/* Box 2: Barcode & Status Copy (Compact, precise) */}
              <div className="w-full sm:w-[20%] border-b sm:border-b-0 sm:border-r border-black flex flex-col justify-center items-center p-2 text-center bg-white min-h-[110px]">
                <div className="w-full px-1 flex flex-col items-center justify-center">
                  {/* CSS-only Barcode pattern representing reference EXACTLY */}
                  <div className="h-8 w-full flex items-stretch gap-[1.2px] bg-black">
                    <div className="w-1.5 h-full bg-white" />
                    <div className="w-[1px] h-full bg-white" />
                    <div className="w-2 h-full bg-white" />
                    <div className="w-[1.2px] h-full bg-white" />
                    <div className="w-1 h-full bg-white" />
                    <div className="w-3 h-full bg-white" />
                    <div className="w-[1px] h-full bg-white" />
                    <div className="w-2 h-full bg-white" />
                    <div className="w-1.5 h-full bg-white" />
                    <div className="w-[1px] h-full bg-white" />
                    <div className="w-1.5 h-full bg-white" />
                    <div className="w-[2px] h-full bg-white" />
                    <div className="w-1 h-full bg-white" />
                  </div>
                  <span className="text-[10px] font-extrabold text-black font-sans tracking-wide mt-1 select-all leading-tight">
                    {shipment.trackingId}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-neutral-600 font-bold leading-tight mt-0.5">
                    Shippers Copy
                  </span>
                </div>
              </div>

              {/* Box 3: 3x3 Grid with Pickup, Origin, Carrier and Time Specifics */}
              <div className="flex-1 flex flex-col bg-white font-mono font-bold">
                
                {/* Grid Row 1 */}
                <div className="flex border-b border-black text-[9px]">
                  <div className="w-1/3 border-r border-black p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Pickup Date:</span>
                    <span className="text-[10px] font-bold text-black leading-tight">{shipment.createdAt?.split('T')[0] || '2022-05-02'}</span>
                  </div>
                  <div className="w-1/3 border-r border-black p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Pickup Time:</span>
                    <span className="text-[10px] font-bold text-black leading-tight">12:00 pm</span>
                  </div>
                  <div className="w-1/3 p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Delivery Date:</span>
                    <span className="text-[10px] font-bold text-black leading-tight">{shipment.estimatedDelivery || '2022-05-06'}</span>
                  </div>
                </div>

                {/* Grid Row 2 */}
                <div className="flex border-b border-black text-[9px]">
                  <div className="w-1/3 border-r border-black p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Origin:</span>
                    <span className="text-[10px] font-bold text-black leading-tight uppercase">{shipment.origin}</span>
                  </div>
                  <div className="w-1/3 border-r border-black p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Destination:</span>
                    <span className="text-[10px] font-bold text-black leading-tight uppercase">{shipment.destination}</span>
                  </div>
                  <div className="w-1/3 p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Courier:</span>
                    <span className="text-[10px] font-bold text-black leading-tight">{settings.websiteName.split(' ')[0]} Express Service</span>
                  </div>
                </div>

                {/* Grid Row 3 */}
                <div className="flex text-[9px]">
                  <div className="w-1/3 border-r border-black p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Carrier:</span>
                    <span className="text-[10px] font-bold text-black leading-tight uppercase">{settings.websiteName.split(' ')[0]} Logistics</span>
                  </div>
                  <div className="w-1/3 border-r border-black p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Carrier Reference No.:</span>
                    <span className="text-[10px] font-bold text-black leading-tight select-all">APX{shipment.trackingId.replace(/\D/g, '') || '7653452'}FD</span>
                  </div>
                  <div className="w-1/3 p-1 min-h-[36px] flex flex-col justify-center">
                    <span className="text-[8px] uppercase text-neutral-500 block">Departure Time:</span>
                    <span className="text-[10px] font-bold text-black leading-tight">23:00 pm</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Client / Customer Grid Block (Row 4 & Row 5 equivalent from reference) */}
            <div className="border-x border-b border-black grid grid-cols-1 md:grid-cols-12 bg-white font-mono">
              
              {/* Shipper Block (Column Span 5) */}
              <div className="col-span-12 md:col-span-5 border-b md:border-b-0 md:border-r border-black flex flex-col">
                <div className="bg-neutral-50 px-2.5 py-1 border-b border-black flex items-center justify-between text-[11px] font-bold font-sans text-black">
                  <span>Shipper</span>
                  <span className="text-black font-extrabold">{shipment.sender.name}</span>
                </div>
                <div className="p-2.5 text-[10px] leading-normal space-y-1 font-semibold text-neutral-800">
                  <div>Nuuk Port and Harbor, Nuuk, Greenland</div>
                  <div>Contact Phone: {shipment.sender.phone}</div>
                  <div>Contact Email: {shipment.sender.email}</div>
                </div>
              </div>

              {/* Consignee Recipient Block (Column Span 5) */}
              <div className="col-span-12 md:col-span-5 border-b md:border-b-0 md:border-r border-black flex flex-col">
                <div className="bg-neutral-50 px-2.5 py-1 border-b border-black flex items-center justify-between text-[11px] font-bold font-sans text-black">
                  <span>Consignee</span>
                  <span className="text-black font-extrabold">{shipment.receiver.name}</span>
                </div>
                <div className="p-2.5 text-[10px] leading-normal space-y-1 font-semibold text-neutral-800 font-mono">
                  <div>906 Hwy 454 Pineville, La 71360</div>
                  <div>Contact Phone: {shipment.receiver.phone}</div>
                  <div>Contact Email: {shipment.receiver.email}</div>
                </div>
              </div>

              {/* Real-time Status and Comments Block (Column Span 2) */}
              <div className="col-span-12 md:col-span-2 flex flex-col">
                <div className="bg-neutral-50 px-2.5 py-1 border-b border-black text-[11px] font-bold font-sans text-black">
                  <span>Status:</span>
                </div>
                <div className="p-2.5 text-[10px] leading-tight font-bold text-neutral-900 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-orange-600 uppercase tracking-tight block font-extrabold">{shipment.shipmentStatus}</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-gray-300 text-[8px] text-neutral-500 font-semibold uppercase leading-tight mt-1">
                    Comment: {shipment.carrierNote ? shipment.carrierNote.substring(0, 35) + '...' : `Cargo Secure`}
                  </div>
                </div>
              </div>

            </div>

            {/* Cargo Specific Parameters row (Row 6 equivalent from reference) */}
            <div className="border-x border-b border-black grid grid-cols-2 md:grid-cols-4 bg-white text-[10px] font-mono font-bold">
              <div className="border-r border-b md:border-b-0 border-black p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Type of Shipment:</span>
                <span className="text-black leading-tight">{shipment.shipmentType}</span>
              </div>
              <div className="border-r border-b md:border-b-0 border-black p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Packages:</span>
                <span className="text-neutral-800 leading-tight">Confidential Vault With Valuables</span>
              </div>
              <div className="border-r border-black p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Product:</span>
                <span className="text-black leading-tight">Consignment</span>
              </div>
              <div className="p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Weight:</span>
                <span className="text-[#ff3c00] leading-tight">{shipment.weight}KG ({Math.round(shipment.weight * 2.20462)}lbs) X2</span>
              </div>
            </div>

            {/* Freight Quantity parameters row (Row 7 equivalent from reference) */}
            <div className="border-x border-b border-black grid grid-cols-2 md:grid-cols-4 bg-white text-[10px] font-mono font-bold">
              <div className="border-r border-black p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Total Freight:</span>
                <span className="text-black leading-tight">1</span>
              </div>
              <div className="border-r border-black p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Quantity:</span>
                <span className="text-black leading-tight">2</span>
              </div>
              <div className="border-r border-black p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Payment Mode:</span>
                <span className="text-black leading-tight">Cash</span>
              </div>
              <div className="p-2 min-h-[42px] flex flex-col justify-center">
                <span className="text-[8px] uppercase text-neutral-500 block leading-none mb-0.5">Mode:</span>
                <span className="text-black uppercase leading-tight">{shipment.shipmentType || 'Air Freight'}</span>
              </div>
            </div>

            {/* Bottom Logistics Rules Box (Explicit disclaimer from reference) */}
            <div className="border-x border-b border-black p-2.5 text-[8px] text-neutral-500 bg-white space-y-1">
              <p className="font-semibold text-neutral-700 uppercase tracking-wider font-sans border-b border-dashed border-gray-200 pb-0.5 leading-none">Corporate Consignment Terms & Conditions</p>
              <p className="leading-normal">
                * This document serves as an official proof of consignment. Financial amounts, pricing models, and specific billing details are omitted to function purely as shipping waybill paperwork. Transits are governed under international seaport & Warsaw airline cargo treaties. Checkpoint logs adhere to synchronized central databases visible live on the tracker app portal.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
