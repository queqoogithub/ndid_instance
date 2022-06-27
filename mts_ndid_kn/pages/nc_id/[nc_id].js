import { useRouter } from "next/router";

const Person = ({ user }) => {
  const router = useRouter();

  return (
    <div>
      <p> nc_id page </p>
      <button onClick={() => router.back()}>Back</button>
      <pre>{JSON.stringify(user, null, 4)}</pre>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { nc_id } = context.params;
  const user = await fetch(`http://localhost:8081/posts/${nc_id}`);
  const data = await user.json();

  if (!data) {
    return {
      notFound: true
    };
  }

  return {
    props: { user: data }
  };
}

export default Person;