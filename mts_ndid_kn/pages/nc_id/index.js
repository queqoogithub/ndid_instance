import { useRouter } from "next/router";

const Persons = ({ users }) => {
  const router = useRouter();
  const callerUsers = fetch(`/api/nc_id`);

  return (
    <div>
      <p> nc_id index page </p>
      <button onClick={() => router.back()}>Back</button>
      <pre>{JSON.stringify(users, null, 4)}</pre>
    </div>
  );
};

export async function getServerSideProps() {
  const users = await fetch(`http://localhost:8081/posts/`);
  const data = await users.json();

  if (!data) {
    return {
      notFound: true
    };
  }

  return {
    props: { users: data }
  };
}

export default Persons;