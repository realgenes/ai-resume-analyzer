import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
    const textColor = score > 70 ? 'text-green-600'
            : score > 49
        ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="resume-summary">
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback | undefined }) => {
    if (!feedback) {
        return (
            <div className="card w-full p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Your feedback will appear here once the analysis is complete.</p>
            </div>
        );
    }

    return (
    <div className="card w-full">
        <div className="flex flex-row items-center p-4 gap-6">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Your Resume Score</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            {feedback.toneAndStyle?.score !== undefined && <Category title="Tone & Style" score={feedback.toneAndStyle.score} />}
            {feedback.content?.score !== undefined && <Category title="Content" score={feedback.content.score} />}
            {feedback.structure?.score !== undefined && <Category title="Structure" score={feedback.structure.score} />}
            {feedback.skills?.score !== undefined && <Category title="Skills" score={feedback.skills.score} />}
        </div>
    )
}
export default Summary
