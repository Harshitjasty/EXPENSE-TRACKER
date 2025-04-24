import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { createExpense } from "../features/expenses/expenseSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Expense } from "../../../shared/types/types";
import Papa from 'papaparse';

function Add() {
  const [text, setText] = useState<string>("");
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [type, setType] = useState<Expense["type"]>("expense");
  const [date, setDate] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(true);
  const [csvData, setCsvData] = useState<Expense[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Healthcare",
    "Education",
    "Housing",
    "Other"
  ];

  const handleCategoryChange = (selectedCategory: string) => {
    setText(selectedCategory);
  };

  const dispatch = useDispatch<AppDispatch>();
  const n = useNavigate();

  const { settings } = useSelector((state: RootState) => state.settings);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isoDate = "";
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        isoDate = parsedDate.toISOString();
      } else {
        toast.error("Invalid date");
        return;
      }
    }

    //FIXME: negative amount should be handled

    await dispatch(createExpense({ text, amount, type, customDate: isoDate } as Expense));
    toast.success(`Added ${type}: ` + text);
    setText("");
    setAmount(0);
    n("/");
    setDate(null);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedData = results.data.slice(1).map((row: any) => ({
          text: row[1], // Category
          amount: parseFloat(row[2]), // Amount
          type: "expense",
          customDate: new Date(row[0]).toISOString() // Date
        }));
        setCsvData(parsedData);
        setShowCsvPreview(true);
      },
      header: false
    });
  };

  const handleCsvSubmit = async () => {
    try {
      for (const expense of csvData) {
        await dispatch(createExpense(expense as Expense));
      }
      toast.success(`Added ${csvData.length} expenses successfully`);
      n("/");
    } catch (error) {
      toast.error("Failed to add expenses from CSV");
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = "Date,Category,Amount,Description\n2025-04-01,Food & Dining,250,Dinner with friends\n2025-04-03,Transportation,120,Bus fare\n2025-04-05,Shopping,999,T-shirt\n2025-04-06,Bills & Utilities,400,Electricity Bill";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-base-200 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Add New Expense</h2>
        
        <div className="flex justify-center gap-4 mb-6">
          <button 
            className={`btn ${showManualForm ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setShowManualForm(true);
              setShowCsvPreview(false);
            }}
          >
            Manual Entry
          </button>
          <button 
            className={`btn ${!showManualForm ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowManualForm(false)}
          >
            Upload CSV
          </button>
        </div>

        {showManualForm ? (
          <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              name="category"
              id="category"
              value={text}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="select select-bordered w-full max-w-xs"
              required
            >
              <option value="">Select a category</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={`Enter amount (${settings.currency})`}
              className="input input-bordered w-full max-w-xs"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Custom Date
            </label>
            <input
              id="default-datepicker"
              type="date"
              placeholder="Select date"
              value={date || ""}
              onChange={(e) => setDate(e.target.value)}
              className="input input-bordered w-full max-w-xs"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Type
            </label>
            <select
              name="type"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as Expense["type"])}
              className="select select-bordered w-full max-w-xs"
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn w-full btn-primary"
            disabled={!text || !amount || !type}
          >
            Add Expense
          </button>
        </form>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <button 
                className="btn btn-outline btn-info"
                onClick={downloadSampleCsv}
              >
                Download Sample CSV
              </button>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="file-input file-input-bordered w-full"
              />
            </div>

            {showCsvPreview && csvData.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Preview ({csvData.length} expenses)</h3>
                <div className="max-h-60 overflow-y-auto">
                  {csvData.map((expense, index) => (
                    <div key={index} className="bg-base-300 p-2 rounded mb-2">
                      <p>Category: {expense.text}</p>
                      <p>Amount: {expense.amount}</p>
                      <p>Date: {new Date(expense.customDate!).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
                <button 
                  className="btn btn-primary w-full mt-4"
                  onClick={handleCsvSubmit}
                >
                  Save All Expenses
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Add;
