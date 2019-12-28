function Page({ match }) {
  return (
    <div>
      <h1>This is /user/{match.params.id}/permission. </h1>
      <h1>当前用户为组织管理者，该页面用以对组织内用户的权限进行管理</h1>
    </div>
  );
}

export default Page;
