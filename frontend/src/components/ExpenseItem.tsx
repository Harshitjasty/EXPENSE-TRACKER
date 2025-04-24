import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteExpense } from "../features/expenses/expenseSlice";
import { AppDispatch } from "../app/store";
import { ExpenseDocument } from "@shared/types/types";
import { FaTrash, FaPencil } from "react-icons/fa6";
import { formatCurrency } from "../utils/currencyFormatter";
// Remove this duplicate import
// import { useState } from "react";
import UpdateExpenseModal from "./UpdateExpenseModal";

interface ExpenseItemProps {
  expense: ExpenseDocument;
}

function ExpenseItem({ expense }: ExpenseItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Format the date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayDate = expense.customDate 
    ? formatDate(expense.customDate)
    : formatDate(expense.createdAt);

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="card-title text-lg">{expense.text}</h2>
            <p className="text-sm text-base-content/70">{displayDate}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="btn btn-ghost btn-sm"
            >
              <FaPencil />
            </button>
            <button
              onClick={() => dispatch(deleteExpense(expense._id))}
              className="btn btn-ghost btn-sm text-error"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        <div className={`text-lg font-semibold ${
          expense.type === "expense" ? "text-error" : "text-success"
        }`}>
          {expense.type === "expense" ? "-" : "+"}
          {formatCurrency(expense.amount)}
        </div>
      </div>
      <UpdateExpenseModal
        expense={expense}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
}

export default ExpenseItem;
