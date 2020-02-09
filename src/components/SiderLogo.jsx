import Link from "umi/link";
import { ReactComponent as Logo } from "../assets/logo-name.svg";

export default () => (
  <div className="mt-16 mr-16 ml-6 mb-6">
    <Link to="/">
      <Logo />
    </Link>
  </div>
);
