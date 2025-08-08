interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = '';
  let badgeText = '';

  if (score > 70) {
    badgeColor = 'bg-badge-green text-green-700 dark:text-green-600 border-green-600/20';
    badgeText = 'Strong';
  } else if (score > 49) {
    badgeColor = 'bg-badge-yellow text-yellow-700 dark:text-yellow-600 border-yellow-600/20';
    badgeText = 'Good Start';
  } else {
    badgeColor = 'bg-badge-red text-red-700 dark:text-red-600 border-red-600/20';
    badgeText = 'Needs Work';
  }

  return (
    <div className={`score-badge ${badgeColor}`}>
      <p className="font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;
