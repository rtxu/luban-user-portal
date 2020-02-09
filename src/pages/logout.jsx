import router from "umi/router";

function Logout() {
  localStorage.removeItem("access_token");
  router.replace("/");

  return (
    <div>
      <h1>Logout</h1>
    </div>
  );
}

export default Logout;
