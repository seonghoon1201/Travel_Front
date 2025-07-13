import PlanCard from './PlanCard';

const DayScheduleSection = ({ day, dayIndex }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <p className="text-sm text-[#9CA3AF] mr-2">day {dayIndex + 1}</p>
        <p className="text-sm font-medium">{day.date}</p>
        <button className="ml-auto text-sm text-[#9CA3AF]">편집</button>
      </div>

      <div className="space-y-3">
        {day.plans.map((plan, idx) => (
          <PlanCard key={plan.id} plan={plan} index={idx} isLast={idx === day.plans.length - 1} />
        ))}
      </div>
    </div>
  );
};

export default DayScheduleSection;