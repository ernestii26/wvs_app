import { RoleNameToId } from "../constants/Uri"

const RolesNameToId = (roles) => {
    const Ids = []
    for(let role of roles){
        let id = RoleNameToId.get(role);
        if(id != undefined)
            Ids.push(id)
    }
    return Ids;
}

export default RolesNameToId;