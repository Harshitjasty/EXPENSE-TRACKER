import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../app/store";
import { getExpenses, reset } from "../features/expenses/expenseSlice";
import ExpenseItem from "../components/ExpenseItem";
import Loading from "../components/Loading";
import { ExpenseDocument } from "@shared/types/types";
import { FaPlus, FaWallet } from "react-icons/fa6";
import { formatCurrency } from "../utils/currencyFormatter";
import WeeklyChart from "../components/WeeklyChart";
import DateFilter from '../components/DateFilter';
// Add this import at the top with other imports
import ExpensePieChart from '../components/ExpensePieChart';

function Home() {
  const n = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseDocument[]>([]);

  const { user } = useSelector((state: RootState) => state.auth);
  const { expenses, isLoading, isError, message } = useSelector(
    (state: RootState) => state.expenses,
  );

  useEffect(() => {
    if (!user) {
      n("/login");
    }
    dispatch(getExpenses({} as ExpenseDocument));
    return () => {
      dispatch(reset());
    };
  }, [user, n, isError, dispatch, message]);

  useEffect(() => {
    if (expenses) {
      setFilteredExpenses(expenses as ExpenseDocument[]);
    }
  }, [expenses]);

  if (isLoading) {
    return <Loading />;
  }

  if (!expenses) {
    return <Loading />;
  }

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = new Date(a.customDate || a.createdAt);
    const dateB = new Date(b.customDate || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate total income for all time
  const totalIncome = filteredExpenses
    .filter((expense) => expense.type === "income")
    .reduce((total, expense) => total + (expense.amount || 0), 0);

  // Calculate total expenses for all time
  const totalExpenses = filteredExpenses
    .filter((expense) => expense.type === "expense")
    .reduce((total, expense) => total + (expense.amount || 0), 0);

  // Calculate actual balance
  const actualBalance = totalIncome - totalExpenses;

  const handleDateFilter = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !expenses) {
      setFilteredExpenses(expenses as ExpenseDocument[]);
      return;
    }

    const filtered = (expenses as ExpenseDocument[]).filter(expense => {
      const expenseDate = new Date(expense.customDate || expense.createdAt);
      return expenseDate >= startDate && expenseDate <= endDate!;
    });

    setFilteredExpenses(filtered);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8">
        <h3 className="text-3xl font-bold">Hello, {user && user.name} 👋</h3>

        <div
          className={`flex items-center justify-between gap-8 w-full max-w-md h-24 p-4 rounded-xl shadow-lg ${
            actualBalance >= 0 ? "bg-primary" : "bg-error"
          } text-primary-content`}
        >
          <div>
            <p>My Balance</p>
            <p className="text-2xl font-semibold">{formatCurrency(actualBalance)}</p>
          </div>
          <div>
            <FaWallet className="text-3xl" />
          </div>
        </div>

        <DateFilter onFilterChange={handleDateFilter} />

        {/* Charts container - side by side layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Bar Chart */}
          <div className="bg-base-200 rounded-lg shadow-lg p-6">
            <WeeklyChart expenses={filteredExpenses} />
          </div>

          {/* Pie Chart */}
          <div className="bg-base-200 rounded-lg shadow-lg p-6">
            <ExpensePieChart expenses={filteredExpenses} />
          </div>
        </div>

        <div>
          <p className="mb-2 ml-2">Recent Transactions</p>
          {filteredExpenses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExpenses.map((expense) => (
                <ExpenseItem key={expense._id} expense={expense} />
              ))}
            </div>
          ) : (
            <p className="text-center">No expenses found for the selected period</p>
          )}
        </div>

        <Link to="/add">
          <button
            className="fixed bottom-5 right-5 btn btn-circle btn-primary btn-lg tooltip tooltip-left"
            data-tip="Add New Expense"
          >
            <div className="flex items-center justify-center w-full h-full">
              <FaPlus />
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
