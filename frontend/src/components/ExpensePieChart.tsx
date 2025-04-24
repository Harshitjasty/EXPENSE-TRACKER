import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';
import { ExpenseDocument } from '@shared/types/types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

interface ExpensePieChartProps {
  expenses: ExpenseDocument[];
}

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses }) => {
  // Define colors for each category
  const categoryColors = {
    'Food & Dining': '#FF6384',
    'Transportation': '#36A2EB',
    'Shopping': '#FFCE56',
    'Bills & Utilities': '#4BC0C0',
    'Entertainment': '#9966FF',
    'Healthcare': '#FF9F40',
    'Education': '#FF99CC',
    'Housing': '#66FF99',
    'Other': '#999999'
  };

  // Calculate total amount for each category (only expenses, not income)
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (expense.type === 'expense') {
      acc[expense.text] = (acc[expense.text] || 0) + expense.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          category => categoryColors[category as keyof typeof categoryColors] || '#999999'
        ),
        borderColor: Object.keys(categoryTotals).map(() => '#FFFFFF'),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Only render if there are expenses
  if (Object.keys(categoryTotals).length === 0) {
    return (
      <div className="text-center p-4">
        <p>No expense data available for the pie chart</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4 text-center">Expense Distribution by Category</h3>
      <div className="h-[400px]">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default ExpensePieChart;