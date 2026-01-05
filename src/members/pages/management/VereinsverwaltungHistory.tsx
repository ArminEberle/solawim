import { useEffect, useState } from 'react';
import { getAllMemberHistoryData } from 'src/api/getAllMemberHistoryData';
import { ChangeEntry, SingleMemberHistoryData } from 'src/members/types/AllMembersData';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';

export type VereinsverwaltungHistoryProps = {
    updateTimestamp?: number | undefined;
};

export const VereinsverwaltungHistory = ({ updateTimestamp }: VereinsverwaltungHistoryProps) => {
    const [chronologically, setChronologically] = useState([] as SingleMemberHistoryData[]);
    const [byUser, setByUser] = useState({} as Record<string, SingleMemberHistoryData[]>);

    useEffect(() => {
        getAllMemberHistoryData().then(historyData => {
            setChronologically(historyData);
            const newByUser: Record<string, SingleMemberHistoryData[]> = {};
            for (const userHistroyEntry of historyData) {
                if (!newByUser[userHistroyEntry.id]) {
                    newByUser[userHistroyEntry.id] = [];
                }
                newByUser[userHistroyEntry.id].push(userHistroyEntry);
            }
            // now compute the changes per user
            for (const userHistory of Object.values(newByUser)) {
                for (let i = 0; i < userHistory.length - 2; i++) {
                    const now = userHistory[i].membership as Record<string, any>;
                    const previous = userHistory[i + 1].membership as Record<string, any>;
                    const changes: ChangeEntry[] = [];
                    for (const propName in now) {
                        if (now[propName] === previous[propName]) {
                            continue;
                        }
                        changes.push({
                            field: propName,
                            old: String(previous[propName]),
                            new: String(now[propName]),
                        });
                    }
                    userHistory[i].changes = changes;
                }
            }
            setByUser(newByUser);
        });
    }, [updateTimestamp]);

    return (
        <div className="pl-3">
            <CollapsibleSection
                title="Änderungshistorie Chronologisch"
                stateHandler={useState(true)}
            >
                {chronologically.map((entry, index) => (
                    <div key={entry.id + '_' + entry.createdAt + '_' + index}>
                        <HistoryEntry
                            withName={true}
                            entry={entry}
                        />
                    </div>
                ))}
            </CollapsibleSection>
            <CollapsibleSection
                title="Änderungshistorie nach Mitglied"
                stateHandler={useState(true)}
            >
                {Object.values(byUser).map((histEntryAr, index) => (
                    <div
                        className="pl-3"
                        key={histEntryAr[0].id + '_' + index}
                    >
                        <CollapsibleSection
                            initiallyCollapsed={true}
                            title={memberlabel(histEntryAr[0])}
                        >
                            {histEntryAr.map((entry, index) => (
                                <div key={entry.id + '_' + entry.createdAt + '_' + index}>
                                    <HistoryEntry
                                        withName={false}
                                        entry={entry}
                                    />
                                </div>
                            ))}
                        </CollapsibleSection>
                    </div>
                ))}
            </CollapsibleSection>
        </div>
    );
};

const memberlabel = (member: SingleMemberHistoryData): string =>
    (member.membership?.firstname ? member.membership?.firstname + ' ' : '') +
    (member.membership?.lastname ? member.membership?.lastname + ' ' : '') +
    member.user_nicename;

const HistoryEntry = (props: {
    entry: SingleMemberHistoryData;
    withName: boolean;
}) => (
    <>
        <div>
            {props.entry.createdAt} Änderung durch {props.entry.createdBy}{' '}
            {props.withName && <b>Mitglied {memberlabel(props.entry)}</b>}
        </div>
        <div className="mb-3 dfv">
            {props.entry.changes &&
                props.entry.changes.map(changeEntry => (
                    <div key={changeEntry.field}>
                        <b>{changeEntry.field}</b>: {changeEntry.old} =&gt; {changeEntry.new}
                    </div>
                ))}
            {!props.entry.changes && <b>Erstanlage</b>}
        </div>
    </>
);
