import { useAllBranches } from "@/services/branch";
import Title from "../Title";
import style from "./Feedback.module.scss";
import { useEffect, useState } from "react";
import { useFeedbackByBranch } from "@/services/feedback";
import Button from "../Button";

const Feedback = () => {
    const { branches } = useAllBranches();
    const [selectedBranch, setSelectedBranch] = useState("");

    const { feedbacks } = useFeedbackByBranch(selectedBranch);
    useEffect(() => {
        if (branches?.length > 0 && !selectedBranch) {
            setSelectedBranch(branches[0]._id);
        }
    }, [branches, selectedBranch]);
    const renderStars = (count) => {
        return (
            <>
                {[...Array(5)].map((_, i) => (
                    <span
                        key={i}
                        className={i < count ? style.filled : style.empty}>
                        ★
                    </span>
                ))}
            </>
        );
    };

    return (
        <div className={style.container}>
            <div className={style.title}>
                <Title>Đánh giá về cơ sở</Title>
                <select
                    className={style.select}
                    value={selectedBranch || ""}
                    onChange={(e) => setSelectedBranch(e.target.value)}>
                    {branches?.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={style.content}>
                <div className={style.feedbackList}>
                    {feedbacks?.map((feedback) => (
                        <div key={feedback._id} className={style.feedbackCard}>
                            <div className={style.name}>
                                {feedback.name}
                                <div className={style.date}>
                                    {new Date(
                                        feedback.createdAt
                                    ).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                            <div className={style.stars}>
                                {renderStars(feedback.rating)}
                            </div>
                            <div className={style.comment}>
                                {feedback.comment}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Feedback;
