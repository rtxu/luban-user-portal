import Redirect from "umi/redirect";

import { LS } from "../util";

function Logout() {
  localStorage.removeItem(LS.ACCESS_TOKEN);
  return <Redirect to="/" />;
}

export default Logout;
