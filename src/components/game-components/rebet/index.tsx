// import React, { useEffect, useState } from "react";
// import { useGameContext, useGameActionContext, useSystemContext } from "../../../_shared/react-contexts";
// import { StorageHelper, localStorageKeys } from "../../../_shared/helpers/storage-helper";
// import { RebetStorageModel } from "../../game-base/type";
// import Styles from "./rebet.module.scss";
// import { BetState, BetTrackModel, Props } from "./type";
// import { useTranslation, Trans } from "next-i18next";
// import { GameResourceKeys } from "../../../_shared/resources/game-resource-keys";
// import { formatOdds, numberWithCommas } from "../../../_shared/helpers/number-helper";
// import { GetLocalizedErrorMessage } from "../../../_shared/helpers/notice-helper";

// const buildMessage = (notice, apiError, t, gameName) => ({
//     gameName: t(`${gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`),
//     roundId: notice?.gameRoundId || apiError?.gameRoundId,
//     message: GetLocalizedErrorMessage(notice?.errorCode || apiError?.errorCode),
//     errorCode: notice?.errorCode || apiError?.errorCode,
//     minBet: notice?.minBet || apiError?.minBet,
//     maxBet: notice?.maxBet || apiError?.maxBet,
// });

// const Rebet: React.FC<Props> = (props: Props) => {
//     const { onCloseModal } = props;
//     const rebetStorageKey = localStorageKeys.rebet;
//     const rebetStorage = StorageHelper.get<RebetStorageModel>(rebetStorageKey) || {};
//     const rebetInfo = rebetStorage[props.gameId];
//     const lastBetChoices = rebetInfo.betInfo;
//     const { roundId, gameSetting } = useGameContext();
//     const { fractionalOddsFormat } = useSystemContext();
//     const gameActionContext = useGameActionContext();
//     const { gameName } = gameSetting;

//     const { t } = useTranslation([gameName.toLowerCase(), "common", "messages"]);

//     const [betTrack, updateBetTrack] = useState<{ [key: string]: BetTrackModel }>({});
//     const [isWaiting, updateIsWaiting] = useState(false);
//     const [isSubmit, updateIsSummit] = useState(false);

//     useEffect(() => {
//         const handleEndBetMessage = ({ endBet, betChoice, notice, apiError }) => {
//             if (betTrack[betChoice]) {
//                 betTrack[betChoice] = {
//                     state: endBet > 0 ? BetState.Success : BetState.Error,
//                     messages: buildMessage(notice, apiError, t, gameName),
//                     validAmount: endBet > 0 ? endBet : 0,
//                 };

//                 if (checkBetFinish(betTrack)) {
//                     const totalSuccessBetAmount = Object.values(betTrack).reduce((total, bet) => total + bet.validAmount, 0);

//                     updateIsWaiting(false);
//                     gameActionContext.finishProcessingBet();
//                     totalSuccessBetAmount > 0 && gameActionContext.playAcceptedBetAnimation(totalSuccessBetAmount);
//                     !Object.values(betTrack).some((bet) => bet.state !== BetState.Success) && onCloseModal();
//                 }
//                 updateBetTrack(betTrack);
//             }
//         };

//         const checkBetFinish = (betTrack: { [key: string]: BetTrackModel }) =>
//             !Object.values(betTrack).some((betTrackInfo) => betTrackInfo.state === BetState.Waiting);

//         const listenerId = gameActionContext.registerMessageHandler("endBet", handleEndBetMessage.bind(this));

//         return () => gameActionContext.unsubscribeMessageHandler(listenerId);
//     }, []);

//     const renderLastRoundBet = () => {
//         return lastBetChoices
//             ? Object.keys(lastBetChoices).map((betChoice) => {
//                   if (lastBetChoices[betChoice] > 0) {
//                       const bettypeName = `bettype-${betChoice}`;
//                       const isShowBettype = t(bettypeName) !== bettypeName;

//                       return (
//                           <div key={betChoice}>
//                               <div
//                                   className={`${Styles["bet-info"]} ${
//                                       betTrack[betChoice] && Styles[getClassByBetState(betTrack[betChoice].state)]
//                                   }`}
//                               >
//                                   <div className={Styles["bet-choice"]}>
//                                       {isShowBettype && <span className={Styles["choice-bettype"]}> {t(bettypeName)}</span>}
//                                       <span className={Styles["choice"]}>{t(betChoice)}</span>@
//                                       {formatOdds(props.getOddsByChoice(betChoice), fractionalOddsFormat)}
//                                   </div>
//                                   <div className="d-flex align-items-center">
//                                       <div className={Styles["bet-amount"]}>{numberWithCommas(lastBetChoices[betChoice])}</div>
//                                       {betTrack[betChoice] && (
//                                           <div className={`icon-${getClassByBetState(betTrack[betChoice].state)} ${Styles["icon"]}`}></div>
//                                       )}
//                                   </div>
//                               </div>
//                               {betTrack[betChoice]?.state === BetState.Error && (
//                                   <div className={Styles["error-message"]}>
//                                       <Trans t={t} components={{ br: <i /> }}>
//                                           {t(betTrack[betChoice].messages.message, {
//                                               gameName: betTrack[betChoice].messages.gameName,
//                                               roundId: betTrack[betChoice].messages.roundId,
//                                               minBet: numberWithCommas(+betTrack[betChoice].messages.minBet),
//                                               maxBet: numberWithCommas(+betTrack[betChoice].messages.maxBet),
//                                               errorCode: betTrack[betChoice].messages.errorCode,
//                                           })}
//                                       </Trans>
//                                   </div>
//                               )}
//                           </div>
//                       );
//                   }
//                   return null;
//               })
//             : null;
//     };

//     const getClassByBetState = (betState: BetState) => {
//         return BetState[betState].toLocaleLowerCase();
//     };

//     const handleSubmit = () => {
//         Object.keys(lastBetChoices).forEach((betChoice) => {
//             if (lastBetChoices[betChoice] > 0) {
//                 betTrack[betChoice] = { state: BetState.Waiting };
//                 gameActionContext.placeBet(betChoice, lastBetChoices[betChoice]);
//             }
//         });

//         updateBetTrack(betTrack);
//         updateIsSummit(true);
//         updateIsWaiting(true);
//     };

//     const handleCloseModal = () => {
//         onCloseModal();
//     };

//     return (
//         <div className={Styles["container"]}>
//             <div className={Styles.header}>
//                 <div className={Styles["game-name"]}>{t(GameResourceKeys.GAME_NAME)}</div>
//                 <div className={Styles["round-number"]}>#{roundId}</div>
//             </div>
//             <div className={Styles["bet-list"]}>{renderLastRoundBet()}</div>
//             <div className={`${Styles["action"]} ${isWaiting && Styles["waiting"]}`}>
//                 {!isSubmit && (
//                     <div className={Styles["button-group"]}>
//                         <button onClick={handleCloseModal} className={`btn-grey ${Styles["custom-button"]}`}>
//                             {t("common:cancel")}
//                         </button>
//                         <button onClick={handleSubmit} className={`btn-red ${Styles["custom-button"]}`}>
//                             {t("common:confirm")}
//                         </button>
//                     </div>
//                 )}
//                 {isSubmit && (
//                     <button onClick={handleCloseModal} className="btn-red w-100">
//                         {t("common:close")}
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Rebet;
