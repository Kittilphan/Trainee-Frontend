export default function ErrorPage({ error }) {
  if (error) {
    const { httpCode, message } = error;
    if (httpCode === 404) {
      return (
        <>
          <h2>Sorry, page not found</h2>
          {message && <p className="mt-4">{message}</p>}
        </>
      );
    }
  }
  return (
    <>
      <h2>Oops! something went wrong.</h2>
    </>
  );
}
