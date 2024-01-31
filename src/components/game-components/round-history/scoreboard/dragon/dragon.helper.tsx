export const GetNameFromChoice = ({ settlementResult, choices }) => {
    let choiceValue = "";
    if (settlementResult && choices) {
        choices.forEach((choice) => {
            if (settlementResult[choice]) {
                choiceValue = choice;
            }
        });
    }

    return choiceValue;
};

export const GetChoiceValueFromTranslate = ({ settlementResult, choices, translateDotTextMapping }) => {
    let name = "";
    if (settlementResult && choices) {
        if (choices.includes("tie") && settlementResult.tie) {
            return translateDotTextMapping["tie"];
        }
        choices.forEach((choice) => {
            if (settlementResult[choice]) {
                name = translateDotTextMapping[choice];
            }
        });
    }

    return name;
};
