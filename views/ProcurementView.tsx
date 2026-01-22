
import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileText, CheckCircle2, X, DollarSign, ListFilter } from 'lucide-react';
import { User } from '../types';
import { dbService } from '../services/databaseService';

const ProcurementView: React.FC<{ user: User }> = ({ user }) => {
  const [pos, setPos] = useState<any[]>([]);

  useEffect(() => {
     loadData();
  }, []);

  const loadData = async () => {
      setPos(await dbService.getAllPOs());
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-black text-slate-800">Purchase Orders</h2>
             <p className="text-slate-500">Manage issued POs and track status.</p>
          </div>
       </div>

       <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
          <table className="w-full text-left">
             <thead><tr><th className="p-3">PO #</th><th className="p-3">Project</th><th className="p-3">Supplier</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
             <tbody>
                {pos.map(p => (
                   <tr key={p.id} className="border-b">
                      <td className="p-3 font-mono text-sm">{p.id.slice(0,8)}</td>
                      <td className="p-3">{p.projectId}</td>
                      <td className="p-3">{p.supplier_id?.slice(0,8)}</td>
                      <td className="p-3 font-bold">{p.total_amount.toLocaleString()}</td>
                      <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase">{p.status}</span></td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};
export default ProcurementView;
