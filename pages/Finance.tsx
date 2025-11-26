
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Tag, Banknote, Trash2 } from 'lucide-react';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { useApp } from '../context/AppContext';

const Finance: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Transaction Form State
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Aggregate by day of week for chart
  const daysMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const chartData = daysMap.map(day => ({ name: day, amount: 0 }));

  const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
  
  incomeTransactions.forEach(t => {
    const d = new Date(t.date);
    const dayIndex = d.getDay(); 
    chartData[dayIndex].amount += t.amount;
  });

  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  
  // Average Ticket Calculation (Total Income / Number of Service Income Transactions)
  const serviceTransactionsCount = incomeTransactions.filter(t => t.category === 'Serviço').length;
  const averageTicket = serviceTransactionsCount > 0 ? totalIncome / serviceTransactionsCount : 0;

  const handleAddTransaction = () => {
    if (!amount || !description) return;
    
    addTransaction({
      type,
      amount: parseFloat(amount),
      description,
      category: category || (type === 'INCOME' ? 'Serviço' : 'Outros'),
      date: new Date().toISOString()
    });

    setIsModalOpen(false);
    setAmount('');
    setDescription('');
    setCategory('');
    setType('EXPENSE');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Excluir esta transação?')) {
        deleteTransaction(id);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mt-2">
        <h1 className="text-xl font-bold text-stone-800">Financeiro</h1>
        <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>Nova Transação</Button>
      </div>

      {/* Balance Card */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet size={100} />
        </div>
        <p className="text-stone-400 text-sm mb-1">Saldo Atual</p>
        <h2 className="text-3xl font-bold mb-6">R$ {(totalIncome - totalExpense).toFixed(2)}</h2>
        
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-500/20 rounded-full text-green-400">
              <ArrowUpCircle size={16} />
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Entradas</p>
              <p className="font-semibold text-sm">R$ {totalIncome.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-red-500/20 rounded-full text-red-400">
              <ArrowDownCircle size={16} />
            </div>
            <div>
              <p className="text-[10px] text-stone-400">Saídas</p>
              <p className="font-semibold text-sm">R$ {totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Medio Card */}
      <Card className="flex items-center justify-between bg-primary-50 border-primary-100">
         <div>
            <p className="text-primary-800 font-bold text-lg">R$ {averageTicket.toFixed(2)}</p>
            <p className="text-primary-600 text-xs font-medium uppercase tracking-wide">Ticket Médio</p>
         </div>
         <div className="bg-white p-2 rounded-full text-primary-500 shadow-sm">
           <Banknote size={24} />
         </div>
      </Card>

      {/* Chart */}
      <div>
        <h3 className="text-sm font-bold text-stone-700 mb-4">Faturamento da Semana</h3>
        <div className="h-48 w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#a8a29e'}} 
                dy={10}
              />
              <Tooltip 
                cursor={{fill: '#f5f5f4'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.amount > 600 ? '#ec4899' : '#fbcfe8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-stone-700">Extrato Recente</h3>
          <button className="text-xs text-primary-600 font-medium">Ver tudo</button>
        </div>
        <div className="space-y-3 pb-20">
          {transactions.map(t => (
            <Card key={t.id} className="flex justify-between items-center py-3 px-4 group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {t.type === 'INCOME' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{t.description}</p>
                  <p className="text-xs text-stone-400">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  <span className={`font-bold text-sm ${t.type === 'INCOME' ? 'text-green-600' : 'text-stone-800'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </span>
                  <button 
                    onClick={(e) => handleDelete(t.id, e)}
                    className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                      <Trash2 size={16} />
                  </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Movimentação"
      >
        <div className="space-y-4">
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-stone-500'
              }`}
            >
              Entrada
            </button>
            <button 
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-500'
              }`}
            >
              Saída
            </button>
          </div>

          <Input 
            label="Valor (R$)" 
            type="number" 
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input 
            label="Descrição" 
            placeholder={type === 'INCOME' ? "Ex: Unha Gel Maria" : "Ex: Compra Esmaltes"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
             <label className="block text-xs font-medium text-stone-500 mb-1 ml-1 flex items-center gap-1">
               <Tag size={12} /> Categoria
             </label>
             <Select value={category} onChange={(e) => setCategory(e.target.value)}>
               <option value="">Selecione...</option>
               {type === 'INCOME' ? (
                 <>
                   <option value="Serviço">Serviço</option>
                   <option value="Produto">Venda de Produto</option>
                 </>
               ) : (
                 <>
                   <option value="Material">Material</option>
                   <option value="Aluguel">Aluguel/Contas</option>
                   <option value="Marketing">Marketing</option>
                   <option value="Outros">Outros</option>
                 </>
               )}
             </Select>
          </div>

          <div className="pt-2">
            <Button fullWidth onClick={handleAddTransaction}>
              Confirmar {type === 'INCOME' ? 'Entrada' : 'Saída'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Finance;
