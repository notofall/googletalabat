
import React, { useState, useEffect } from 'react';
import { FileText, Plus, DollarSign, ListFilter, Calendar, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { dbService } from '../services/databaseService';

const QuotationsView: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'rfqs' | 'quotes'>('rfqs');
  
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Modal States
  const [showCreateRFQ, setShowCreateRFQ] = useState(false);
  const [showAddQuote, setShowAddQuote] = useState(false);
  
  // Selection
  const [selectedReq, setSelectedReq] = useState<string>('');
  const [selectedRfq, setSelectedRfq] = useState<string>('');
  
  // Form Data
  const [rfqDeadline, setRfqDeadline] = useState('');
  const [quoteData, setQuoteData] = useState({ supplierId: '', amount: 0, currency: 'SAR', validUntil: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setRfqs(await dbService.getRFQs());
    setQuotes(await dbService.getQuotations());
    setApprovedRequests((await dbService.getAllMaterialRequests()).filter(r => r.status === 'APPROVED_TECHNICAL'));
    setSuppliers(await dbService.getSuppliers());
  };

  const handleCreateRFQ = async () => {
    if(!selectedReq || !rfqDeadline) return;
    try {
      await dbService.createRFQ({ materialRequestId: selectedReq, deadline: new Date(rfqDeadline).toISOString() });
      alert("RFQ Created");
      setShowCreateRFQ(false);
      loadData();
    } catch(e) { alert("Error creating RFQ"); }
  };

  const handleCreateQuote = async () => {
    if(!selectedRfq || !quoteData.supplierId) return;
    try {
       await dbService.createQuotation({
         rfqId: selectedRfq,
         supplierId: quoteData.supplierId,
         totalAmount: Number(quoteData.amount),
         currency: quoteData.currency,
         validUntil: quoteData.validUntil ? new Date(quoteData.validUntil).toISOString() : null
       });
       alert("Quotation Added");
       setShowAddQuote(false);
       loadData();
    } catch(e) { alert("Error adding quote"); }
  };

  const handleAward = async (quote: any) => {
    if (!confirm("Confirm Award? This will close the RFQ and create a PO draft.")) return;
    try {
        // Fetch Request Details to map items
        const rfq = rfqs.find(r => r.id === quote.rfq_id);
        const req = approvedRequests.find(r => r.id === rfq?.material_request_id) || (await dbService.getAllMaterialRequests()).find(r => r.id === rfq?.material_request_id);

        if (!req) { alert("Original request not found"); return; }

        await dbService.createPurchaseOrder({
           projectId: req.projectId,
           supplierId: quote.supplier_id,
           quotationId: quote.id,
           materialRequestId: req.id,
           items: req.items.map((i:any) => ({
              itemId: i.item_id || i.itemId,
              quantity: i.quantity,
              price: quote.total_amount / req.items.length // Simple allocation
           }))
        });
        alert("Awarded Successfully! PO Draft Created.");
        loadData();
    } catch(e) { alert("Awarding failed"); }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Sourcing & Quotations</h2>
            <p className="text-slate-500">Manage RFQs and Supplier Bids</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
             <button onClick={() => setActiveTab('rfqs')} className={`px-6 py-2 rounded-xl font-bold ${activeTab==='rfqs' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>RFQs</button>
             <button onClick={() => setActiveTab('quotes')} className={`px-6 py-2 rounded-xl font-bold ${activeTab==='quotes' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Quotations</button>
          </div>
       </div>

       {activeTab === 'rfqs' && (
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between mb-4">
               <h3 className="font-bold flex items-center gap-2"><ListFilter size={18}/> Active RFQs</h3>
               <button onClick={() => setShowCreateRFQ(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={16}/> New RFQ</button>
            </div>
            <table className="w-full text-left">
               <thead><tr><th className="p-3">RFQ ID</th><th className="p-3">Status</th><th className="p-3">Deadline</th><th className="p-3">Actions</th></tr></thead>
               <tbody>
                  {rfqs.map(r => (
                     <tr key={r.id} className="border-b">
                        <td className="p-3 font-mono text-sm">{r.id.slice(0,8)}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${r.status==='OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>{r.status}</span></td>
                        <td className="p-3 text-sm">{new Date(r.deadline).toLocaleDateString()}</td>
                        <td className="p-3">
                           {r.status === 'OPEN' && <button onClick={() => { setSelectedRfq(r.id); setShowAddQuote(true); }} className="text-blue-600 font-bold text-xs hover:underline">Add Quote</button>}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
       )}

       {activeTab === 'quotes' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
             <h3 className="font-bold mb-4">Received Quotations</h3>
             <table className="w-full text-left">
               <thead><tr><th className="p-3">Quote ID</th><th className="p-3">RFQ Ref</th><th className="p-3">Supplier</th><th className="p-3">Amount</th><th className="p-3">Awarded</th><th className="p-3">Actions</th></tr></thead>
               <tbody>
                  {quotes.map(q => (
                     <tr key={q.id} className="border-b">
                        <td className="p-3 font-mono text-xs">{q.id.slice(0,8)}</td>
                        <td className="p-3 font-mono text-xs">{q.rfq_id?.slice(0,8)}</td>
                        <td className="p-3 text-sm">{suppliers.find(s=>s.id===q.supplier_id)?.name || q.supplier_id.slice(0,8)}</td>
                        <td className="p-3 font-bold">{q.total_amount.toLocaleString()} {q.currency}</td>
                        <td className="p-3">{q.is_selected ? <CheckCircle2 size={16} className="text-emerald-500"/> : '-'}</td>
                        <td className="p-3">
                           {!q.is_selected && <button onClick={() => handleAward(q)} className="text-emerald-600 font-bold text-xs hover:underline">Award</button>}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
          </div>
       )}

       {/* Create RFQ Modal */}
       {showCreateRFQ && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
             <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
                <h3 className="font-bold text-lg">Create New RFQ</h3>
                <div>
                   <label className="text-xs font-bold text-slate-500">Select Approved Request</label>
                   <select className="w-full p-3 border rounded-xl" onChange={e => setSelectedReq(e.target.value)}>
                      <option value="">Select PR...</option>
                      {approvedRequests.map(r => <option key={r.id} value={r.id}>PR #{r.id.slice(0,6)} - {r.projectId}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500">Submission Deadline</label>
                   <input type="date" className="w-full p-3 border rounded-xl" onChange={e => setRfqDeadline(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                   <button onClick={() => setShowCreateRFQ(false)} className="px-4 py-2">Cancel</button>
                   <button onClick={handleCreateRFQ} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">Create RFQ</button>
                </div>
             </div>
          </div>
       )}

       {/* Add Quote Modal */}
       {showAddQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
             <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4">
                <h3 className="font-bold text-lg">Add Supplier Quotation</h3>
                <select className="w-full p-3 border rounded-xl" onChange={e => setQuoteData({...quoteData, supplierId: e.target.value})}>
                   <option value="">Select Supplier...</option>
                   {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="flex gap-2">
                   <input type="number" placeholder="Amount" className="flex-1 p-3 border rounded-xl" onChange={e => setQuoteData({...quoteData, amount: Number(e.target.value)})} />
                   <select className="w-24 p-3 border rounded-xl" onChange={e => setQuoteData({...quoteData, currency: e.target.value})}>
                      <option>SAR</option><option>USD</option><option>EUR</option>
                   </select>
                </div>
                <input type="date" className="w-full p-3 border rounded-xl" onChange={e => setQuoteData({...quoteData, validUntil: e.target.value})} />
                <div className="flex justify-end gap-2 pt-4">
                   <button onClick={() => setShowAddQuote(false)} className="px-4 py-2">Cancel</button>
                   <button onClick={handleCreateQuote} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold">Save Quote</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
export default QuotationsView;
