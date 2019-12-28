function Page({ match }) {
  return (
    <div>
      <h1>This is /user/{match.params.id}. </h1>
      <h1>User Homepage</h1>
    </div>
  );
}

export default Page;
