function Page({ match }) {
  return (
    <div>This is an organization (named /{match.params.org}) homepage </div>
  );
}

export default Page;
