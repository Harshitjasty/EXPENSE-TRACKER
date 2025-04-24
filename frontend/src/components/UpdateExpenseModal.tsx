import { useState } from "react";
import { Expense, ExpenseDocument } from "@shared/types/types";
import { useDispatch } from "react-redux";
import { updateExpense } from "../features/expenses/expenseSlice";
import toast from "react-hot-toast";
import { AppDispatch } from "src/app/store";

interface UpdateExpenseModalProps {
  expense: ExpenseDocument;
  isOpen: boolean;
  onClose: () => void;
}

const UpdateExpenseModal: React.FC<UpdateExpenseModalProps> = ({ expense, isOpen, onClose }) => {
  // Add console log to debug
  console.log('Modal props:', { expense, isOpen });

  // Ensure expense exists before accessing its properties
  if (!expense) {
    console.error('Expense object is undefined');
    return null;
  }

  const [text, setText] = useState(expense.text || '');
  const [amount, setAmount] = useState(expense.amount || 0);
  const [type, setType] = useState<Expense["type"]>(expense.type || "expense");
  const dispatch = useDispatch<AppDispatch>();

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

  const handleUpdate = async () => {
    try {
      if (!text || amount === undefined) {
        toast.error("Please fill in all fields");
        return;
      }
      
      await dispatch(updateExpense({ ...expense, text, amount, type }));
      toast.success("Expense updated successfully!");
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error("Failed to update expense.");
    }
  };

  // Add a check for isOpen
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="font-bold text-lg">Update Expense</h2>
        <div className="mt-4">
          <select
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="select select-bordered w-full mt-2"
          >
            <option value="">Select a category</option>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="input input-bordered w-full mt-2"
          placeholder="Amount"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Expense["type"])}
          className="select select-bordered w-full mt-2"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleUpdate}>
            Update
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateExpenseModal;
