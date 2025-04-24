import { useState } from 'react';

interface DateFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    const now = new Date();
    let startDate: Date | null = null;

    switch (filter) {
      case 'week':
        // Get Monday of current week
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        monday.setHours(0, 0, 0, 0);
        startDate = monday;
        break;
      case 'month':
        // First day of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '6months':
        // 6 months ago from today
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        // 1 year ago from today
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = null;
    }

    onFilterChange(startDate, now);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => handleFilterChange('all')}
      >
        All Time
      </button>
      <button
        className={`btn btn-sm ${activeFilter === 'week' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => handleFilterChange('week')}
      >
        This Week
      </button>
      <button
        className={`btn btn-sm ${activeFilter === 'month' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => handleFilterChange('month')}
      >
        This Month
      </button>
      <button
        className={`btn btn-sm ${activeFilter === '6months' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => handleFilterChange('6months')}
      >
        Last 6 Months
      </button>
      <button
        className={`btn btn-sm ${activeFilter === 'year' ? 'btn-primary' : 'btn-ghost'}`}
        onClick={() => handleFilterChange('year')}
      >
        Last 1 Year
      </button>
    </div>
  );
};

export default DateFilter;