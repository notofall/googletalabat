
import React, { useState, useEffect } from 'react';
import { Receipt, FileCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { dbService } from '../services/databaseService';
import { User } from '../types';

const InvoicesView: React.FC<{ user: User }> = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [readyPOs, setReadyPOs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState(0);

  const loadData = async () => {
    setInvoices(await dbService.getInvoices());
    const allPos = await dbService.getAllPOs();
    setReadyPOs(allPos.filter(p => p.status === 'RECEIVED' || p.status === 'PARTIALLY_RECEIVED'));
  };

  useEffect(() => { loadData(); }, [showModal]);

  const handleCreateInvoice = async () => {
     try {
        await dbService.createInvoice({
           poId: selectedPO,
           supplierInvoiceNumber: invoiceNumber,
           totalAmount: Number(amount)
        });
        alert("Invoice Registered & Matched!");
        setShowModal(false);
        loadData();
     } catch (e) { alert("Failed to register invoice"); }
  };

  const handleRematch = async (id: string) => {
     try {
        await dbService.matchInvoice(id);
        alert("Match procedure executed.");
        loadData();
     } catch(e) { alert("Match failed"); }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-800">Invoices & Payments</h2>
          <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
             <Receipt size={18} /> Register Invoice
          </button>
       </div>

       <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <table className="w-full text-left">
             <thead>
                <tr className="border-b">
                   <th className="p-4">Invoice #</th>
                   <th className="p-4">PO Ref</th>
                   <th className="p-4">Amount</th>
                   <th className="p-4">Match Status</th>
                   <th className="p-4">Details</th>
                   <th className="p-4">Action</th>
                </tr>
             </thead>
             <tbody>
                {invoices.map(inv => (
                   <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-4 font-bold">{inv.supplier_invoice_number}</td>
                      <td className="p-4 text-xs font-mono">{inv.po_id.slice(0,8)}</td>
                      <td className="p-4 font-black">{inv.total_amount.toLocaleString()}</td>
                      <td className="p-4">
                         {inv.status === 'MATCHED' ? (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 size={14}/> MATCHED</span>
                         ) : (
                            <span className="flex items-center gap-1 text-amber-600 font-bold text-xs"><AlertTriangle size={14}/> {inv.status}</span>
                         )}
                      </td>
                      <td className="p-4 text-xs text-slate-500 max-w-xs truncate">{inv.match_status_details}</td>
                      <td className="p-4">
                         {inv.status !== 'MATCHED' && (
                            <button onClick={() => handleRematch(inv.id)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full" title="Re-Run Match">
                               <RefreshCw size={16} />
                            </button>
                         )}
                      </td>
                   </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No invoices registered.</td></tr>}
             </tbody>
          </table>
       </div>

       {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-6 animate-scaleUp">
                <h3 className="text-xl font-black">Register Supplier Invoice</h3>
                
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Select Purchase Order</label>
                   <select className="w-full p-4 bg-slate-50 rounded-xl" onChange={e => setSelectedPO(e.target.value)}>
                      <option value="">Select PO...</option>
                      {readyPOs.map(p => <option key={p.id} value={p.id}>PO #{p.id.slice(0,8)} - {p.total_amount}</option>)}
                   </select>
                </div>
                
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Supplier Invoice #</label>
                   <input type="text" className="w-full p-4 bg-slate-50 rounded-xl" onChange={e => setInvoiceNumber(e.target.value)} />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-slate-500">Total Amount</label>
                   <input type="number" className="w-full p-4 bg-slate-50 rounded-xl" onChange={e => setAmount(Number(e.target.value))} />
                </div>

                <div className="flex justify-end gap-3">
                   <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500">Cancel</button>
                   <button onClick={handleCreateInvoice} className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white">Submit for Matching</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
export default InvoicesView;
