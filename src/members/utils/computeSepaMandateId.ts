import { SingleMemberData } from "src/members/types/AllMembersData";

export function computeSepaMandateId(member: SingleMemberData) {
    return "SOLAWI.2023." + member.id;
}
